import { AssetStatus, VotePhase } from "@/app/generated/prisma";
import { AssetItemForGameFeed } from "../types/assets.types";

export function isAssetLocked(asset: AssetItemForGameFeed) {
  if (asset.currentPhase === VotePhase.PHASE1) {
    return asset.status === AssetStatus.PHASE1_APPROVED ||
           asset.status === AssetStatus.PHASE1_REJECTED;
  }

  if (asset.currentPhase === VotePhase.PHASE2) {
    return asset.status === AssetStatus.PHASE2_APPROVED ||
           asset.status === AssetStatus.PHASE2_REJECTED;
  }

  return false;
}