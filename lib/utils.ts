import { VoteType } from "@/app/generated/prisma";
import { AssetVote, AssetVoteCalculation } from "./types/assets.types";

export function createFullName(firstName: string, lastName: string): string {
  return firstName[0].toUpperCase() + firstName.slice(1) + " " + lastName[0].toUpperCase() + lastName.slice(1);
}

export function createInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
}

export function calculateRawAssetVotes(assetVotes: Array<AssetVote>): AssetVoteCalculation {
  const result = {
    rejectCount: 0,
    approveCount: 0,
  };

  for (let i = 0; i < assetVotes.length; i++) {
    const vote = assetVotes[i];
    const isApproved = vote.voteType === VoteType.APPROVE;
    if (isApproved) {
      result.approveCount += vote.weight;
    } else {
      result.rejectCount += vote.weight;
    }
  }

  return result;
}