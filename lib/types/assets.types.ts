import { AssetStatus, VotePhase, VoteType } from "@/app/generated/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { GetUserDataResponse } from "./dto.types";
import { RawUserQueryData } from "./users.types";

export interface BaseAsset {
  id: number;
  title: string;
  category: string;
  imageUrls: string[];
  createdAt: Date;
  status: AssetStatus;
  currentPhase: VotePhase;
}

export interface AssetItemForArtistFeed extends BaseAsset {
  phase1CompletedAt: Date | null;
  phase2CompletedAt: Date | null;
}

export interface AssetItemForVoterFeed extends BaseAsset {
  uploader: GetUserDataResponse;
  vote_id: number | null;
  votedAt: Date | null;
}

export interface AssetItemForGameFeed extends BaseAsset {
  uploader: GetUserDataResponse;
  voters: Array<GetUserDataResponse>
}

export type AssetFeedItem = AssetItemForArtistFeed | AssetItemForVoterFeed | AssetItemForGameFeed;

export interface AssetVote {
  id: number;
  voteType: VoteType;
  weight: Decimal;
}

export type AssetVoteCalculation = {
  approveCount: number;
  rejectCount: number;
}

export interface AssetDetails {
  id: number;
  title: string;
  category: string;
  imageUrls: string[];
  createdAt: Date;
  currentPhase: VotePhase;
  status: AssetStatus;
  revisionNumber: number;
  revisionDescription: string;
  uploader: GetUserDataResponse;
  votes: {
    rejectPercentage: number;
    approvePercentage: number;
    pendingCount: number;
    approved: Array<GetUserDataResponse>;
    rejected: Array<GetUserDataResponse>;
  }
}

// For the UploadAssetRevisionForm - locked data from original asset.
export interface AssetRevisionBaseData {
  id: number;
  title: string;
  category: string;
  createdAt: Date;
  original_asset_id: number | null;
  revisionNumber: number;
}

export interface AssetRevisionDetails {
  id: number;
  imageUrls: string[];
  createdAt: Date;
  status: AssetStatus;
  revisionNumber: number;
  revisionDescription: string;
  uploader: GetUserDataResponse;
}

export interface GetAssetDetailsAndHistoryResponse extends AssetDetails {
  originalAsset: AssetRevisionDetails | null;
  revisions: Array<AssetRevisionDetails>;
}

export type AssetHistoryArray =
  | [AssetDetails, ...AssetRevisionDetails[]] // no originalAsset
  | [AssetDetails, ...AssetRevisionDetails[], AssetRevisionDetails]; // with originalAsset

// ------------------------------------------------------------------------------------
// Intermediate, Raw Query Data Types for transforming into DTOs ----------------------
// ------------------------------------------------------------------------------------

export type RawVoterAssetQueryData = {
  id: number;
  title: string;
  category: string;
  imageUrls: string[];
  createdAt: Date;
  status: AssetStatus;
  currentPhase: VotePhase;
  uploader: RawUserQueryData;
  votes: Array<{
    id: number;
    voteType: VoteType;
    createdAt: Date;
  }>;
};

export type RawAssetRevisionQueryData = {
  id: number;
  imageUrls: string[];
  createdAt: Date;
  status: AssetStatus;
  revisionNumber: number;
  revisionDescription: string;
  currentPhase: VotePhase;
  uploader: RawUserQueryData;
}