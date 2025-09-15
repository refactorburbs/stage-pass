import { AssetStatus, VotePhase, VoteType } from "@/app/generated/prisma";

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