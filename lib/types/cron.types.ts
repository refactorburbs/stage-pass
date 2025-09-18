import { AssetStatus, VotePhase, VoteType } from "@/app/generated/prisma";

export interface LockJob {
  id: number;
  voteType: VoteType;
  currentPhase: VotePhase;
  asset: {
    id: number;
    uploader_id: number;
    category: string;
  }
  game_id: number;
  createdAt: Date;
}

export type AssetUpdateData = {
  status: AssetStatus;
  phase1CompletedAt?: Date;
  phase2CompletedAt?: Date;
  currentPhase?: VotePhase;
}