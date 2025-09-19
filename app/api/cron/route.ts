// Process all assets that are pending lock (all votes are in)
// Because users can switch their votes back to pending, or new users can sign
// up while voting is happening (thus changing the number of eligible voters)
// We use this cron to double check that all votes are in and settled before
// locking it for this phase. The cron happens on vercel, which is configured
// to this api route in the vercel.json.

import { cleanupPendingCommentsAndSubs } from "@/app/actions/comment.actions";
import { AssetStatus, VotePhase, VoteType } from "@/app/generated/prisma";
import { VOTE_DECISION_THRESHOLD } from "@/lib/constants/placeholder.constants";
import { getAllEligibleVoters } from "@/lib/data";
import prisma from "@/lib/prisma";
import { AssetUpdateData, LockJob } from "@/lib/types/cron.types";
import { calculateRawAssetVotes, sendDiscordVoteResultNotification } from "@/lib/utils";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Verify this is coming from Vercel and not some random curl or Postman
    const authHeader = request.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return Response.json({ error: "Unauthorized Cron Call" }, { status: 401 });
    }

    // Get all assets pending final decision
    const pendingLocks = await prisma.assetPendingLock.findMany({
      select: {
        id: true,
        voteType: true,
        currentPhase: true,
        game_id: true,
        createdAt: true,
        asset: {
          select: {
            id: true,
            title: true,
            uploader_id: true,
            category: true,
          }
        }
      }
    });

    let processedCount = 0;

    for (const lockJob of pendingLocks) {
      try {
        await processAssetLock(lockJob);
        processedCount++;
      } catch (error) {
        console.error(`Failed to process lock job ${lockJob.id}:`, error);
      }
    }

    return Response.json({
      success: true,
      processed: processedCount,
      total: pendingLocks.length
    });

  } catch (error) {
    console.error("Cron job failed:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function processAssetLock(lockJob: LockJob) {
  const asset = lockJob.asset;

  // Re-check current vote counts and see if everyone has voted
  const currentVotes = await prisma.assetVote.findMany({
    where: {
      asset_id: asset.id,
      phase: lockJob.currentPhase
    }
  });

  const { rejectCount, approveCount } = calculateRawAssetVotes(currentVotes);
  const excludedVoterIds = [asset.uploader_id];
  const eligibleVoters = await getAllEligibleVoters(lockJob.game_id, lockJob.currentPhase, excludedVoterIds);

  if (currentVotes.length < eligibleVoters.length) {
    console.log(`Asset ${asset.id} - not all voters have voted yet (${currentVotes.length}/${eligibleVoters.length})`);
    return; // Keep in pending lock state
  }

  // Determine final decision
  const totalVotes = approveCount + rejectCount;
  const approvalPercentage = totalVotes > 0 ? (approveCount / totalVotes) * 100 : 0;

  let finalDecision: VoteType;

  if (approvalPercentage >= VOTE_DECISION_THRESHOLD) {
    finalDecision = VoteType.APPROVE;
  } else if (approveCount > rejectCount) {
    finalDecision = VoteType.APPROVE;
  } else {
    finalDecision = VoteType.REJECT; // Includes ties
  }

  let newStatus: AssetStatus;
  let shouldMoveToPhase2 = false;

  if (finalDecision === VoteType.APPROVE) {
    if (lockJob.currentPhase === VotePhase.PHASE1) {
      newStatus = AssetStatus.PHASE1_APPROVED;
      if (asset.category === "Full Asset") {
        shouldMoveToPhase2 = true;
      }
    } else {
      newStatus = AssetStatus.PHASE2_APPROVED;
    }
  } else {
    newStatus = lockJob.currentPhase === VotePhase.PHASE1
      ? AssetStatus.PHASE1_REJECTED
      : AssetStatus.PHASE2_REJECTED;
  }

  // Update the asset status and phase depending on final decision
  const updateData: AssetUpdateData = {
    status: newStatus,
    [`phase${lockJob.currentPhase === VotePhase.PHASE1 ? "1" : "2"}CompletedAt`]: new Date()
  };

  if (shouldMoveToPhase2) {
    updateData.currentPhase = VotePhase.PHASE2;
  }

  const updatedAsset = await prisma.asset.update({
    where: { id: asset.id },
    data: updateData
  });

  await sendDiscordVoteResultNotification({
    id: updatedAsset.id,
    title: updatedAsset.title,
    category: updatedAsset.category,
    imageUrl: updatedAsset.imageUrl
  }, lockJob.currentPhase, finalDecision, shouldMoveToPhase2);

  await cleanupPendingCommentsAndSubs(asset.id);

  // Remove the completed lock job
  await prisma.assetPendingLock.delete({
    where: { id: lockJob.id }
  });

  console.log(`Asset ${asset.id} processed: ${finalDecision} -> ${newStatus}`);
}