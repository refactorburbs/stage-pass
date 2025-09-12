import { AssetStatus, VoteType } from "@/app/generated/prisma";

export interface AssetVote {
  id: number;
  voteType: VoteType;
  weight: number;
}

export interface AssetVoteCalculation {
  approveCount: number;
  rejectCount: number;
}

export interface AssetVoter {
  id: number;
  fullName: string;
  initials: string;
  avatar: number;
  customAvatar: string | null;
  teamName: string;
}

export interface AssetItemForGameFeed {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  createdAt: Date;
  status: AssetStatus;
  uploaderFirstName: string;
  uploaderTeam: string;
  voters: Array<AssetVoter>
}