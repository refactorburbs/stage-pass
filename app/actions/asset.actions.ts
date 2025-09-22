"use server";

import { UploadAssetFormState } from "@/lib/types/forms.types";
import { z } from "zod";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import { SubscriptionType, UserRole, VotePhase, VoteType } from "../generated/prisma";
import { USER_VOTE_WEIGHT, VOTE_DECISION_THRESHOLD } from "@/lib/constants/placeholder.constants";
import { getAllEligibleVoters, getUser } from "@/lib/data";
import { calculateRawAssetVotes, sendDiscordNotification } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { subscribeUserToAsset } from "./comment.actions";

// Validation schemas ----------------------------------------------------------------
const uploadAssetSchema = z.object({
  imageUrls: z.array(z.string()).min(1, "Must upload at least one image - ").max(4, "Maximum 4 images per asset"),
  title: z.string().min(5, "Title should be more descriptive."),
  category: z.string(),
  gameId: z.string().transform((id) => { // Form fields are strings, so transform to num.
    const num = parseInt(id);
    if (isNaN(num)) throw new Error("Invalid game ID");
    return num;
  })
});
// -----------------------------------------------------------------------------------

export async function uploadAssetImage(_state: UploadAssetFormState, formData: FormData): Promise<UploadAssetFormState> {
  // 1. Validate upload form fields with zod
  const validatedFields = uploadAssetSchema.safeParse({
    imageUrls: formData.getAll("image-urls"),
    title: formData.get("title"),
    category: formData.get("category"),
    gameId: formData.get("gameId")
  });

  if (!validatedFields.success) {
    const tree = z.treeifyError(validatedFields.error);
    const fieldErrors: Record<string, string[]> = {};

    for (const [key, value] of Object.entries(tree.properties ?? {})) {
      if (value?.errors?.length > 0) {
        fieldErrors[key] = value.errors;
      }
    }
    return { errors: fieldErrors };
  }

  const { imageUrls, title, category, gameId } = validatedFields.data;
  // 2. Get user id (uploader_id) from the session store
  const session = await verifySession();
  if (!session.userId) {
    console.log("No userId found in session");
    return { message: "Something went wrong. Invalid user session id." }
  }
  const uploaderId = Number(session.userId);

  try {
    // 3. Create a new asset in Prisma
    const newAsset = await prisma.asset.create({
      data: {
        title,
        category,
        imageUrls,
        game_id: gameId,
        uploader_id: uploaderId
      }
    });
    // 4. Subscribe the uploader to comments on their asset
    await subscribeUserToAsset(uploaderId, newAsset.id, SubscriptionType.UPLOADED);
  } catch (error) {
    console.error("Image upload error:", error)
    return {
      message: `Image upload error: ${error}`
    }
  }
  // 5. Redirect to the user's feed (should see their post in pending)
  redirect(`/game/${gameId}`);
}

export async function castAssetVote(
  assetId: number,
  gameId: number,
  voteType: VoteType,
  phase: VotePhase
): Promise<void> {
  const voter = await getUser();
  if (!voter || voter.role === UserRole.ARTIST) return;

  const voterWeight = USER_VOTE_WEIGHT[voter.role];
  // Separate query because if this is the first vote, assetVote will be empty
  // We need to find the id of the uploader to make sure and exclude them from
  // the eligible voter count (LEADs can upload but can't vote on their own asset)
  const assetBeingVotedOn = await prisma.asset.findUnique({
    where: {
      id: assetId
    },
    select: {
      title: true,
      uploader_id: true
    }
  });

  const assetVotes = await prisma.assetVote.findMany({
    where: {
      asset_id: assetId,
      phase,
    }
  });

  const { rejectCount, approveCount } = calculateRawAssetVotes(assetVotes);
  const excludedVoterIds = assetBeingVotedOn ? [assetBeingVotedOn.uploader_id] : [];
  const eligibleVoters = await getAllEligibleVoters(gameId, phase, excludedVoterIds);
  const isLastVoteOnAsset = assetVotes.length === eligibleVoters.length - 1;

  if (isLastVoteOnAsset) {
    const finalApproveCount = voteType === VoteType.APPROVE ? approveCount + voterWeight : approveCount;
    const finalRejectCount = voteType === VoteType.REJECT ? rejectCount + voterWeight : rejectCount;
    const finalVoteTotal = finalApproveCount + finalRejectCount;
    const approvalPercentage = (finalApproveCount / finalVoteTotal) * 100;
    const rejectPercentage = (finalRejectCount / finalVoteTotal) * 100;

    if (approvalPercentage >= VOTE_DECISION_THRESHOLD || finalApproveCount > finalRejectCount) {
      // Let's set a cron or something to officially change an assets status after 2 hours (giving people time to change their mind)
      console.log("Last vote on this asset! Locking approval in 2 hours");
      await prisma.assetPendingLock.upsert({
        where: {
          asset_id: assetId
        },
        create: {
          voteType: VoteType.APPROVE,
          currentPhase: phase,
          asset_id: assetId,
          game_id: gameId
        },
        update: {
          voteType: VoteType.APPROVE
        }
      });
    } else if (rejectPercentage >= VOTE_DECISION_THRESHOLD || rejectPercentage > approvalPercentage) {
      console.log("Last vote on this asset! Locking rejection in 2 hours");
      await prisma.assetPendingLock.upsert({
        where: {
          asset_id: assetId
        },
        create: {
          voteType: VoteType.REJECT,
          currentPhase: phase,
          asset_id: assetId,
          game_id: gameId
        },
        update: {
          voteType: VoteType.REJECT
        }
      });
    } else {
      console.log("Asset voting tie! Sending Discord notification");
      await sendDiscordNotification(`"${assetBeingVotedOn?.title}" received a tie vote. This asset needs manual review.`);
    }
  }
  // Add a new vote record (not in an else b/c it should happen regardless if this is the final vote)
  await prisma.assetVote.create({
    data: {
      voteType,
      phase,
      weight: voterWeight,
      asset_id: assetId,
      user_id: voter.id
    }
  });

  // Voting is a user interaction, subscribe them to comments on it:
  await subscribeUserToAsset(voter.id, assetId, SubscriptionType.VOTED);

  revalidatePath(`/game/${gameId}`);
}

export async function redactAssetVote(voteId: number, gameId: number): Promise<void> {
  // If a user changes their mind on a vote, this will move the asset back in their personal pending feed.
  // If we have a 2 hour finalization cron running on this asset, we need to cancel it because the vote was redacted.
  // OR just in the cron, when it's time to execute, check again that all votes are accoutned for?
  await prisma.assetVote.delete({
    where: {
      id: voteId
    }
  });
  revalidatePath(`/game/${gameId}`);
}