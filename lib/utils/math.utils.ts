import { VoteType } from "@/app/generated/prisma";
import { AssetVote, AssetVoteCalculation } from "../types/assets.types";

export function calculateRawAssetVotes(assetVotes: Array<AssetVote>): AssetVoteCalculation {
  const result = {
    rejectCount: 0,
    approveCount: 0,
  };

  for (let i = 0; i < assetVotes.length; i++) {
    const vote = assetVotes[i];
    const isApproved = vote.voteType === VoteType.APPROVE;
    if (isApproved) {
      result.approveCount += vote.weight.toNumber();
    } else {
      result.rejectCount += vote.weight.toNumber();
    }
  }

  return result;
}