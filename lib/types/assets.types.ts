import { AssetStatus, VotePhase, VoteType } from "@/app/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { UserAvatarData } from "./users.types";

export interface AssetVote {
  id: number;
  voteType: VoteType;
  weight: Decimal;
}

export interface AssetVoteCalculation {
  approveCount: number;
  rejectCount: number;
}

export interface AssetItemForArtistFeed {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  status: AssetStatus;
  currentPhase: VotePhase;
  createdAt: Date;
  phase1CompletedAt: Date | null;
  phase2CompletedAt: Date | null;
}

export type IntermediateVoterAssetItem = {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  createdAt: Date;
  currentPhase: VotePhase;
  uploader: {
    id: number;
    firstName: string;
    fullName: string;
    initials: string;
    avatar: number;
    customAvatar: string | null;
    team: {
      name: string;
    };
  };
  votes: {
    id: number;
    voteType: VoteType;
    createdAt: Date;
  }[];
};

export interface AssetItemForVoterFeed {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  createdAt: Date;
  currentPhase: VotePhase;
  uploader: UserAvatarData;
  vote_id: number | null;
  votedAt: Date | null;
}

export interface AssetItemForGameFeed {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  createdAt: Date;
  currentPhase: VotePhase;
  status: AssetStatus;
  uploader: UserAvatarData;
  voters: Array<UserAvatarData>
}

export type AssetFeedItem = AssetItemForArtistFeed | AssetItemForVoterFeed | AssetItemForGameFeed;

export type IntermediateVoterAssetDetailsItem = {
  id: number;
  voteType: VoteType;
  phase: VotePhase;
  weight: Decimal;
  user: {
    id: number;
    firstName: string;
    fullName: string;
    initials: string;
    avatar: number;
    customAvatar: string | null;
    team: {
      name: string;
    }
  }
}

export interface GetAssetDetailsResponse {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  createdAt: Date;
  currentPhase: VotePhase;
  uploader: {
    id: number;
    firstName: string;
    fullName: string;
    initials: string;
    avatar: number;
    customAvatar: string | null;
    teamName: string;
  }
  votes: {
    rejectPercentage: number;
    approvePercentage: number;
    pendingCount: number;
    approved: Array<UserAvatarData>;
    rejected: Array<UserAvatarData>;
  }
}

export interface UserAssetComment {
  id: number;
  content: string;
  createdAt: Date,
  user: UserAvatarData;
}

export interface PendingCommentData {
  id: number;
  content: string;
  createdAt: Date,
  assetImage: string;
  asset_id: number;
  game_id: number;
  subscriber_id: number;
  commenter: UserAvatarData;
}