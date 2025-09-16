import { AssetStatus, VotePhase, VoteType } from "@/app/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export interface AssetVote {
  id: number;
  voteType: VoteType;
  weight: Decimal;
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
  uploader: {
    firstName: string;
    fullName: string;
    initials: string;
    avatar: number;
    customAvatar: string | null;
    teamName: string;
  }
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
  uploader: {
    firstName: string;
    teamName: string;
  }
  voters: Array<AssetVoter>
}

export type AssetFeedItem = AssetItemForArtistFeed | AssetItemForVoterFeed | AssetItemForGameFeed;

export type IntermediateVoterAssetDetailsItem = {
  id: number;
  voteType: VoteType;
  phase: VotePhase;
  weight: Decimal;
  user: {
    id: number;
    fullName: string;
    initials: string;
    avatar: number;
    customAvatar: string | null;
    team: {
      name: string;
    }
  }
}

export interface VoterInfo {
  id: number;
  fullName: string;
  initials: string;
  avatar: number;
  customAvatar: string | null;
  teamName: string;
}

export interface GetAssetDetailsResponse {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
  createdAt: Date;
  currentPhase: VotePhase;
  uploader: {
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
    approved: Array<VoterInfo>;
    rejected: Array<VoterInfo>;
  }
}