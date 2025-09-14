"use server";

import { UploadAssetFormState } from "@/lib/types/forms.types";
import { z } from "zod";
import { redirect } from "next/navigation";
import { verifySession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import { UserRole, VotePhase, VoteType } from "../generated/prisma";
import { USER_VOTE_WEIGHT, VOTE_DECISION_THRESHOLD } from "@/lib/constants/placeholder.constants";
import { getAllEligibleVoters, getUser } from "@/lib/data";
import { calculateRawAssetVotes } from "@/lib/utils";
import { revalidatePath } from "next/cache";

// Validation schemas ----------------------------------------------------------------
const uploadAssetSchema = z.object({
  imageUrl: z.string(),
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
    imageUrl: formData.get("imageUrl"),
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

  const { imageUrl, title, category, gameId } = validatedFields.data;
  // 2. Get user id (uploader_id) from the session store
  const session = await verifySession();
  if (!session.userId) {
    console.log("No userId found in session");
    return { message: "Something went wrong. Invalid user session id." }
  }
  const uploaderId = Number(session.userId);

  try {
    // 3. Create a new asset in Prisma
    await prisma.asset.create({
      data: {
        title,
        category,
        imageUrl,
        game_id: gameId,
        uploader_id: uploaderId
      }
    });
  } catch (error) {
    console.error("Image upload error:", error)
    return {
      message: `Image upload error: ${error}`
    }
  }
  // Redirect to the user's feed (should see their post in pending)
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

  const voterWeight = USER_VOTE_WEIGHT[voter.role]
  const assetVotes = await prisma.assetVote.findMany({
    where: {
      id: assetId,
      phase,
    }
  });

  const { rejectCount, approveCount } = calculateRawAssetVotes(assetVotes);
  const eligibleVoters = await getAllEligibleVoters(gameId, phase);
  const isLastVoteOnAsset = assetVotes.length === eligibleVoters.length - 1;

  if (isLastVoteOnAsset) {
    const finalApproveCount = voteType === VoteType.APPROVE ? approveCount + voterWeight : approveCount;
    const finalRejectCount = voteType === VoteType.REJECT ? rejectCount + voterWeight : rejectCount;
    const finalVoteTotal = finalApproveCount + finalRejectCount;
    const approvalPercentage = (finalApproveCount / finalVoteTotal) * 100;

    if (approvalPercentage >= VOTE_DECISION_THRESHOLD) {
      // Let's set a cron or something to officially change an assets status after 2 hours (giving people time to change their mind)
      console.log("Last vote on this asset! Locking approval in 2 hours");
    } else {
      console.log("Last vote on this asset! Locking rejection in 2 hours");
    }
    // If the asset category was "Full Asset" and the asset status was phase1_approved then update the asset to phase2 and phase1completedat
    console.log("updating current asset status and phase - this should happen in the cron job");
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

  revalidatePath(`/game/${gameId}`);
}