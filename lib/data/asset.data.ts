import prisma from "@/lib/prisma";
import {
  AssetStatus,
  VotePhase,
  VoteType
} from "@/app/generated/prisma";
import { calculateRawAssetVotes } from "../utils";
import { GetAssetFeedForArtistResponse, GetAssetFeedForGameResponse, GetAssetFeedForVoterResponse } from "../types/dto.types";
import { AssetItemForGameFeed, AssetItemForVoterFeed, GetAssetDetailsResponse, IntermediateVoterAssetDetailsItem, IntermediateVoterAssetItem } from "../types/assets.types";
import { getAllEligibleVoters } from "./user.data";
import { UserAvatarData } from "../types/users.types";
import { isAssetLocked } from "../utils/asset.utils";
import { ASSET_DETAILS_SELECT_QUERY, ASSET_REVISION_SELECT_QUERY, USER_AVATAR_SELECT_QUERY } from "../constants/query.constants";
import { transformRevisionData, transformUserAvatarData } from "../utils/transforms.utils";

export async function getAssetDetails(assetId: number): Promise<GetAssetDetailsResponse> {
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

  const transformVote = (vote: IntermediateVoterAssetDetailsItem) => ({
    id: vote.user.id,
    firstName: vote.user.firstName,
    fullName: vote.user.fullName,
    initials: vote.user.initials,
    avatar: vote.user.avatar,
    customAvatar: vote.user.customAvatar || null,
    teamName: vote.user.team.name
  })

  const approvedVotes = currentAssetVotes
    .filter(vote => vote.voteType === VoteType.APPROVE)
    .map(transformVote);

  const rejectedVotes = currentAssetVotes
    .filter(vote => vote.voteType === VoteType.REJECT)
    .map(transformVote);

  let pendingVoteCount = eligibleVoters.length - currentAssetVotes.length;
  // If the asset is locked, return 0 for pending voters
  if ((asset.currentPhase === VotePhase.PHASE1
    && (asset.status === AssetStatus.PHASE1_APPROVED
    || asset.status === AssetStatus.PHASE1_REJECTED))
    // Same for phase 2 - if locked in phase2, return 0 for pending
    || (asset.currentPhase === VotePhase.PHASE2
      && (asset.status === AssetStatus.PHASE2_APPROVED
        || asset.status === AssetStatus.PHASE2_REJECTED)
    )) {
    pendingVoteCount = 0;
  }

  // This DTO will be phase specific - revisions and history too.
  // That way if there are dinky revisions we don't want external reviewers to see, they won't.
  // Same with previous conversations/comments - phase specific.
  const assetDetailsDTO = {
    id: asset.id,
    title: asset.title,
    category: asset.category,
    imageUrls: asset.imageUrls,
    createdAt: asset.createdAt,
    currentPhase: asset.currentPhase,
    status: asset.status,
    revisionNumber: asset.revisionNumber,
    revisionDescription: asset.revisionDescription,
    uploader: transformUserAvatarData(asset.uploader),
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

export async function getShortAssetDetails(assetId: number) {
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

export async function getAssetFeedForArtist(
  userId: number,
  gameId: number
): Promise<GetAssetFeedForArtistResponse> {
  // Artists can only upload and comment. Thus their personal feed will be 3 columns:
  // 1. All assets they've personally uploaded that have definitively been rejected by others (both phase 1 and phase 2)
  // 2. All assets they've personally uploaded that still have a PENDING asset status
  // 3. All assets they've personally uploaded that have definitively been accepted by others (includes both phase 1 and phase 2)
  const allAssets = await prisma.asset.findMany({
    where: {
      uploader_id: userId,
      game_id: gameId,
      status: {
        notIn: [AssetStatus.ARCHIVED, AssetStatus.REVISED]
      }
    },
    select: {
      id: true,
      title: true,
      category: true,
      imageUrls: true,
      status: true,
      currentPhase: true,
      createdAt: true,
      phase1CompletedAt: true,
      phase2CompletedAt: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Group assets by status
  const rejected = allAssets.filter(asset =>
    asset.status === AssetStatus.PHASE1_REJECTED || asset.status === AssetStatus.PHASE2_REJECTED
  );

  const pending = allAssets.filter(asset =>
    asset.status === AssetStatus.PENDING
  );

  const approved = allAssets.filter(asset =>
    asset.status === AssetStatus.PHASE1_APPROVED || asset.status === AssetStatus.PHASE2_APPROVED
  );

  return { rejected, pending, approved };
}

export async function getAssetFeedForVoter(
  userId: number,
  gameId: number,
  hasFinalSay: boolean
): Promise<GetAssetFeedForVoterResponse> {
  // Voters personal feed will be two columns with a special pending column in the middle:
  // 1. All PENDING assets they have personally rejected. If hasFinalSay is true in their userRolePermissions, then this is only for phase 2. Else phase 1
  // 2. In the middle is all PENDING assets they have yet to review - All assets that are PENDING and that they have not already voted on. if hasFinalSay, only phase2 else phase1
  // 3. All PENDING assets they have personally accepted. If hasFinalSay is true, this is only for phase2. else phase1.
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
      id: true,
      title: true,
      category: true,
      imageUrls: true,
      currentPhase: true,
      createdAt: true,
      uploader: {
        select: USER_AVATAR_SELECT_QUERY
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

  // Get rid of the "votes" field and refine teamName field
  const transformAsset = (asset: IntermediateVoterAssetItem): AssetItemForVoterFeed => ({
    id: asset.id,
    title: asset.title,
    category: asset.category,
    imageUrls: asset.imageUrls,
    createdAt: asset.createdAt,
    currentPhase: asset.currentPhase,
    uploader: transformUserAvatarData(asset.uploader),
    vote_id: asset.votes[0]?.id || null, // Used to reference assetVote if user wants to switch vote back to pending
    votedAt: asset.votes[0]?.createdAt || null
  });

  // Group by user's personal voting status
  // The vote selection query will return an array of one item or no item
  // since users can only vote once - so the vote will either be approve or reject
  // or no vote record for this asset will appear.
  const approved = pendingAssets
    .filter(asset => asset.votes.length > 0 && asset.votes[0].voteType === VoteType.APPROVE)
    .map(transformAsset);

  const rejected = pendingAssets
    .filter(asset => asset.votes.length > 0 && asset.votes[0].voteType === VoteType.REJECT)
    .map(transformAsset);

  const pending = pendingAssets
    .filter(asset => asset.votes.length === 0)
    .map(transformAsset)

  return {
    approved,
    rejected,
    pending
  };
}

export async function getAssetFeedForGame(
  gameId: number,
  hasFinalSay: boolean
): Promise<GetAssetFeedForGameResponse> {
  // Game view has 3 columns, just like the artist, but instead of concrete
  // accepted or rejected, we display current, raw vote values (not necessarily based on total eligible voters voting %)
  // Get all assets that aren't archived or revised for this game (approved/rejected assets will be colored specially)
  // Whether an asset winds up in rejected, pending, or approved is simple:
  // If the asset's votes for this phase are higher for rejected than approved, it's in rejected. Also if its status is rejected for this phase.
  // If the asset's votes for this phase are higher for approved than rejected, it's in approved. Also if its status is approved for this phase.
  // If the asset's votes for this phase are even, it is in pending.
  // Fields we need to retrieve from each qualifying asset:
  // Asset: id, title, imageUrls, category, status, uploader_id (to get uploader name), createdAt.
  // Asset votes: if the asset is trending towards rejected, then all users who cast rejected votes
  //  -> Get the voter's fullName, initials, avatar, customAvatar
  const targetPhase = hasFinalSay ? VotePhase.PHASE2 : VotePhase.PHASE1;

  // Note this creates complete phase segregation - users a part of phase 1 will never see phase 2 results
  // in their game feed and vice versa. Artists who post for both phases can see it in their personal feed, however.
  // @TODO To let the whole team know the results of phase 2, a discord notification is sent to the uploader as well as mentioning
  // that the asset has been archived. Rejected assets in the archive can be brought back out to voting pool by users adding a revision.
  const allAssets = await prisma.asset.findMany({
    where: {
      status: {
        notIn: [AssetStatus.ARCHIVED, AssetStatus.REVISED]
      },
      game_id: gameId,
      currentPhase: targetPhase,
    },
    select: {
      id: true,
      title: true,
      category: true,
      imageUrls: true,
      createdAt: true,
      currentPhase: true,
      status: true,
      uploader: {
        select: USER_AVATAR_SELECT_QUERY
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
            select: USER_AVATAR_SELECT_QUERY
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

    const assetDTO: AssetItemForGameFeed = {
      id: asset.id,
      title: asset.title,
      category: asset.category,
      imageUrls: asset.imageUrls,
      createdAt: asset.createdAt,
      currentPhase: asset.currentPhase,
      status: asset.status,
      uploader: transformUserAvatarData(asset.uploader),
      voters: [] as Array<UserAvatarData>
    }
    const isReject = rejectCount > approveCount;
    const isApprove = approveCount > rejectCount;
    assetDTO.voters = asset.votes
      .filter((vote) => {
        if (isReject) return vote.voteType === VoteType.REJECT;
        if (isApprove) return vote.voteType === VoteType.APPROVE;
        // Note this will only be for votes that have been cast, not pending
      })
      .map((vote) => ({
        id: vote.user.id,
        firstName: vote.user.firstName,
        fullName: vote.user.fullName,
        initials: vote.user.initials,
        avatar: vote.user.avatar,
        customAvatar: vote.user.customAvatar,
        teamName: vote.user.team.name
    }));
    if (isReject) {
      sortedAssets.rejected.push(assetDTO);
    } else if (isApprove) {
      sortedAssets.approved.push(assetDTO);
    }
    // For pending assets (tied votes or no votes), show voters who haven't voted yet
    const pendingVoters = eligibleVoters
      .filter((voter) => !votedUserIds.has(voter.id) && voter.id !== asset.uploader.id)
      .map((voter) => ({
        id: voter.id,
        firstName: voter.firstName,
        fullName: voter.fullName,
        initials: voter.initials,
        avatar: voter.avatar,
        customAvatar: voter.customAvatar,
        teamName: voter.teamName
      }));
    if (pendingVoters.length) {
      const assetDTOClone = { ...assetDTO };
      // only add to this asset's pending list if the asset voting phase hasn't locked.
      if (!isAssetLocked(assetDTOClone)) {
        assetDTOClone.voters = pendingVoters;
        sortedAssets.pending.push(assetDTOClone);
      }
    }
  });
  return sortedAssets;
}