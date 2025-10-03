"use server";

import prisma from "@/lib/prisma";
import {
  AssetStatus,
  VotePhase,
  VoteType
} from "@/app/generated/prisma";
import { calculateRawAssetVotes } from "../utils";
import {
  GetAssetFeedForArtistResponse,
  GetAssetFeedForGameResponse,
  GetAssetFeedForVoterResponse,
  GetUserDataResponse
} from "../types/dto.types";
import {
  AssetItemForGameFeed,
  AssetRevisionBaseData,
  GetAssetDetailsAndHistoryResponse,
} from "../types/assets.types";
import { getAllEligibleVoters } from "./user.data";
import { isAssetLocked, sortUnlockedAssetsFirst } from "../utils/asset.utils";
import {
  ASSET_DETAILS_SELECT_QUERY,
  ASSET_REVISION_SELECT_QUERY,
  BASE_ASSET_FEED_SELECT_QUERY,
  USER_DATA_SELECT_QUERY
} from "../constants/query.constants";
import {
  transformRevisionData,
  transformUserData,
  transformVoterFeedAsset
} from "../utils/transforms.utils";

/**
 * Retrieves detailed information about a specific asset (for its Asset Details Page),
 * including its voting status, phase-specific revisions, and history.
 *
 * - Only includes data relevant to the **current phase** of the asset:
 *   - Votes are filtered by the asset's current phase.
 *   - Revisions are filtered to include only those in the current phase.
 *   - Phase-specific DTO ensures that early or draft revisions are hidden from reviewers
 *     in later phases, preventing accidental exposure of unfinished or incorrect versions.
 *
 * - Calculates voting percentages (`approvePercentage` and `rejectPercentage`) and identifies
 *   which users approved or rejected the asset.
 * - Determines pending voters by checking eligible users who have not yet voted,
 *   accounting for whether the asset is locked.
*/
export async function getAssetDetails(assetId: number): Promise<GetAssetDetailsAndHistoryResponse> {
  const asset = await prisma.asset.findUnique({
    where: {
      id: assetId
    },
    select: {
      ...ASSET_DETAILS_SELECT_QUERY,
      game_id: true,
      uploader_id: true,
      originalAsset: {
        select: {
          ...ASSET_REVISION_SELECT_QUERY,
          revisions: {
            where: {
              id: { not: assetId } // If the current asset from assetId arguement is a revision, don't include it again.
            },
            select: ASSET_REVISION_SELECT_QUERY,
            orderBy: {
              revisionNumber: "desc" // latest revision is first in array
            }
          },
        }
      },
    },
  });

  if (!asset) {
    throw new Error("No asset found with this Id");
  }

  const targetPhase = asset.currentPhase;
  const currentAssetVotes = asset.votes.filter((vote) => vote.phase === targetPhase);
  const eligibleVoters = await getAllEligibleVoters(asset.game_id, targetPhase, [asset.uploader_id]);

  const { rejectCount, approveCount } = calculateRawAssetVotes(currentAssetVotes);
  let totalVotes = rejectCount + approveCount;
  if (totalVotes === 0) totalVotes = 1; // Prevent dividing by 0 and getting NaN
  const rejectPercentage = Math.round((rejectCount / totalVotes) * 100);
  const approvePercentage = Math.round((approveCount / totalVotes) * 100);

  const approvedVotes = currentAssetVotes
    .filter(vote => vote.voteType === VoteType.APPROVE)
    .map((vote) => transformUserData(vote.user));

  const rejectedVotes = currentAssetVotes
    .filter(vote => vote.voteType === VoteType.REJECT)
    .map((vote) => transformUserData(vote.user));

  let pendingVoteCount = eligibleVoters.length - currentAssetVotes.length;
  // If the asset is locked, return 0 for pending voters (stops pending for new users showing up after vote lock)
  if (isAssetLocked(asset.currentPhase, asset.status)) {
    pendingVoteCount = 0;
  }

  const assetDetailsDTO = {
    ...asset,
    uploader: transformUserData(asset.uploader),
    votes: {
      rejectPercentage,
      approvePercentage,
      pendingCount: pendingVoteCount,
      approved: approvedVotes,
      rejected: rejectedVotes
    },
    originalAsset: asset.originalAsset && asset.originalAsset.currentPhase === targetPhase ? transformRevisionData(asset.originalAsset) : null,
    revisions: asset.originalAsset ? asset.originalAsset.revisions.filter((revision) => revision.currentPhase === targetPhase).map(transformRevisionData) : []
  };

  return assetDetailsDTO;
}

/**
 * Fetches the base asset information required to create a revision.
 *
 * - Returns only fields that are immutable during a revision:
 *   - `title` and `category` are locked in the form to prevent changes.
 *   - `original_asset_id` is used to link the revision to the original asset.
 * - Designed specifically for the UploadAssetRevisionForm; not for full asset details.
*/
export async function getAssetRevisionBaseData(assetId: number): Promise<AssetRevisionBaseData | null> {
  const asset = await prisma.asset.findUnique({
    where: {
      id: assetId
    },
    select: {
      id: true,
      title: true,
      category: true,
      createdAt: true,
      original_asset_id: true,
      revisionNumber: true
    }
  });
  return asset;
}

/**
 * Fetches the asset feed for a specific artist within a game.
 *
 * The feed is split into three columns based on asset status:
 * 1. **Rejected:** Assets uploaded by the artist that have been definitively rejected in either phase 1 or phase 2.
 * 2. **Pending:** Assets uploaded by the artist that are still PENDING.
 * 3. **Approved:** Assets uploaded by the artist that have been definitively approved in either phase 1 or phase 2.
 *
*/
export async function getAssetFeedForArtist(
  userId: number,
  gameId: number
): Promise<GetAssetFeedForArtistResponse> {
  const allAssets = await prisma.asset.findMany({
    where: {
      uploader_id: userId,
      game_id: gameId,
      status: {
        notIn: [AssetStatus.ARCHIVED, AssetStatus.REVISED]
      }
    },
    select: {
      ...BASE_ASSET_FEED_SELECT_QUERY,
      phase1CompletedAt: true,
      phase2CompletedAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const rejected = allAssets
    .filter(asset =>
      asset.status === AssetStatus.PHASE1_REJECTED
      || asset.status === AssetStatus.PHASE2_REJECTED
    );

  const pending = allAssets
    .filter(asset =>
      asset.status === AssetStatus.PENDING
      || (asset.status === AssetStatus.PHASE1_APPROVED && asset.currentPhase === VotePhase.PHASE2)
    );

  const approved = allAssets
    .filter(asset =>
      asset.status === AssetStatus.PHASE2_APPROVED
      || (asset.status === AssetStatus.PHASE1_APPROVED && asset.currentPhase === VotePhase.PHASE1)
    )

  return { rejected, pending, approved };
}

/**
 * Fetches the personalized asset feed for a voter within a game (includes LEADs and VOTERs).
 *
 * The feed is split into three columns based on the voter's personal interactions:
 * 1. **Rejected:** Assets that the voter has personally rejected. If the voter has `hasFinalSay`,
 *    this only includes assets from phase 2; otherwise phase 1.
 * 2. **Pending:** Assets that are still PENDING and the voter has not yet voted on. The middle column
 *    represents assets awaiting their review. Phase depends on `hasFinalSay`.
 * 3. **Approved:** Assets that the voter has personally approved. Again, filtered by phase depending
 *    on `hasFinalSay`.
 *
 * Only assets uploaded by other users are included (voter's own assets are excluded).
*/
export async function getAssetFeedForVoter(
  userId: number,
  gameId: number,
  hasFinalSay: boolean
): Promise<GetAssetFeedForVoterResponse> {
  const targetPhase = hasFinalSay ? VotePhase.PHASE2 : VotePhase.PHASE1;
  const targetStatus = hasFinalSay ? AssetStatus.PHASE1_APPROVED : AssetStatus.PENDING;

  const pendingAssets = await prisma.asset.findMany({
    where: {
      game_id: gameId,
      status: targetStatus,
      currentPhase: targetPhase,
      uploader_id: {
        not: userId // Exclude the LEAD's own asset posts
      }
    },
    select: {
      ...BASE_ASSET_FEED_SELECT_QUERY,
      uploader: {
        select: USER_DATA_SELECT_QUERY
      },
      votes: {
        where: {
          user_id: userId,
          phase: targetPhase
        },
        select: {
          id: true,
          voteType: true,
          createdAt: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Group by user's personal voting status
  // The vote selection query will return an array of one item or no item
  // since users can only vote once - so the vote will either be approve or reject
  // or no vote record for this asset will appear.
  const approved = pendingAssets
    .filter(asset => asset.votes.length > 0 && asset.votes[0].voteType === VoteType.APPROVE)
    .map(transformVoterFeedAsset);

  const rejected = pendingAssets
    .filter(asset => asset.votes.length > 0 && asset.votes[0].voteType === VoteType.REJECT)
    .map(transformVoterFeedAsset);

  const pending = pendingAssets
    .filter(asset => asset.votes.length === 0)
    .map(transformVoterFeedAsset)

  return {
    approved,
    rejected,
    pending
  };
}

/**
 * Fetches a game-wide asset feed (including trending and locked assets) organized into approved, rejected, and pending columns.
 *
 * Each asset is classified based on the vote totals for the current phase:
 * - **Rejected:** If the asset has more reject votes than approve votes, or its status is rejected for this phase.
 * - **Approved:** If the asset has more approve votes than reject votes, or its status is approved for this phase.
 * - **Pending:** If votes are tied, or no votes have been cast yet.
 *
 * Voter bubbles are included only for users who voted for that specific outcome. Pending assets
 * include eligible voters who haven't voted yet, excluding the uploader themselves.
 *
 * **Phase-specific behavior:**
 * - Users only see results for their phase; phase 1 users won't see phase 2 results and vice versa.
 * - This ensures votes and asset visibility are segregated by voting phase.
 *
 * Within each column, assets are sorted so that **actionable assets appear first**,
 * and **locked/finalized assets appear at the bottom**.
 *
*/
export async function getAssetFeedForGame(
  gameId: number,
  hasFinalSay: boolean
): Promise<GetAssetFeedForGameResponse> {
  const targetPhase = hasFinalSay ? VotePhase.PHASE2 : VotePhase.PHASE1;

  // Note this creates complete phase segregation - users a part of phase 1 will never see phase 2 results
  // in their game feed and vice versa. Artists who post for both phases can see it in their personal feed, however,
  // separated by "Internal Review" and "Pending Final Review" on their asset card.
  const allAssets = await prisma.asset.findMany({
    where: {
      status: {
        notIn: [AssetStatus.ARCHIVED, AssetStatus.REVISED]
      },
      game_id: gameId,
      currentPhase: targetPhase,
    },
    select: {
      ...BASE_ASSET_FEED_SELECT_QUERY,
      uploader: {
        select: USER_DATA_SELECT_QUERY
      },
      votes: {
        where: {
          phase: targetPhase,
        },
        select: {
          id: true,
          voteType: true,
          weight: true,
          user: {
            select: USER_DATA_SELECT_QUERY
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const sortedAssets = {
    approved: [] as AssetItemForGameFeed[],
    rejected: [] as AssetItemForGameFeed[],
    pending: [] as AssetItemForGameFeed[]
  }

  const eligibleVoters = await getAllEligibleVoters(gameId, targetPhase);

  allAssets.forEach((asset) => {
    const { rejectCount, approveCount } = calculateRawAssetVotes(asset.votes);
    // This Set contains user IDs who voted on THIS specific asset
    // If no one voted on this asset, the Set will be empty
    const votedUserIds = new Set(asset.votes.map(vote => vote.user.id));

    // Each asset will be trending towards either rejected, approved, or pending
    // and we need to display only voter bubbles for that specific vote type
    const assetDTO: AssetItemForGameFeed = {
      id: asset.id,
      title: asset.title,
      category: asset.category,
      imageUrls: asset.imageUrls,
      createdAt: asset.createdAt,
      currentPhase: asset.currentPhase,
      status: asset.status,
      uploader: transformUserData(asset.uploader),
      voters: [] as Array<GetUserDataResponse>
    }

    // Determine which way the asset is trending
    const isReject = rejectCount > approveCount;
    const isApprove = approveCount > rejectCount;
    assetDTO.voters = asset.votes
      .filter((vote) => {
        if (isReject) return vote.voteType === VoteType.REJECT;
        if (isApprove) return vote.voteType === VoteType.APPROVE;
        // Note this will only be for votes that have been cast, filters nothing if pending.
      })
      .map((vote) => transformUserData(vote.user));
    if (isReject) {
      sortedAssets.rejected.push(assetDTO);
    } else if (isApprove) {
      sortedAssets.approved.push(assetDTO);
    }
    // For pending assets (tied votes or no votes), show voters who haven't voted yet
    // and exclude the uploader themselves since they can't vote on their own asset.
    const pendingVoters = eligibleVoters
      .filter((voter) => !votedUserIds.has(voter.id) && voter.id !== asset.uploader.id);

    if (pendingVoters.length) {
      // Don't want to overwrite the existing assetDTO voters if this asset has votes trending already.
      // Create a shallow clone to avoid mutating the original assetDTO in approved/rejected lists.
      const assetDTOClone = { ...assetDTO };
      // only add to this asset's pending list if the asset voting phase hasn't locked.
      if (!isAssetLocked(assetDTOClone.currentPhase, assetDTOClone.status)) {
        assetDTOClone.voters = pendingVoters;
        sortedAssets.pending.push(assetDTOClone);
      }
    }
  });
  sortedAssets.approved.sort(sortUnlockedAssetsFirst);
  sortedAssets.rejected.sort(sortUnlockedAssetsFirst);
  return sortedAssets;
}