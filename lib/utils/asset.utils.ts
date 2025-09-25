import { AssetStatus, VotePhase } from "@/app/generated/prisma";
import { AssetDetails, AssetFeedItem, AssetHistoryArray, AssetRevisionDetails } from "../types/assets.types";

/**
 * Determines whether an asset is "locked" (cannot be modified or voted on)
 * based on the current voting phase and its status.
*/
export function isAssetLocked(currentPhase: VotePhase, status: AssetStatus): boolean {
  if (currentPhase === VotePhase.PHASE1) {
    return status === AssetStatus.PHASE1_APPROVED ||
           status === AssetStatus.PHASE1_REJECTED;
  }

  if (currentPhase === VotePhase.PHASE2) {
    return status === AssetStatus.PHASE2_APPROVED ||
           status === AssetStatus.PHASE2_REJECTED;
  }

  return false;
}

/**
 * Used with a .sort() to sort a list of assets so that unlocked (pending final votes)
 * assets appear first, followed by locked (finalized) assets.
 *
 * This is useful for displaying assets in a feed where users should see
 * actionable items (unlocked assets) over those that have already been finalized.
*/
export function sortUnlockedAssetsFirst(a: AssetFeedItem, b: AssetFeedItem) {
  const aLocked = isAssetLocked(a.currentPhase, a.status) ? 1 : 0;
  const bLocked = isAssetLocked(b.currentPhase, b.status) ? 1 : 0;
  return aLocked - bLocked;
}

export function buildAssetHistoryArray(
  asset: AssetDetails,
  revisions: AssetRevisionDetails[],
  originalAsset?: AssetRevisionDetails | null
): AssetHistoryArray {
  return [
    asset,
    ...revisions,
    ...(originalAsset ? [originalAsset] : []),
  ];
}