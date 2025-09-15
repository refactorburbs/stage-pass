import prisma from "@/lib/prisma";
import {
  AssetStatus,
  VotePhase,
  VoteType
} from "@/app/generated/prisma";
import { calculateRawAssetVotes } from "../utils";
import { GetAssetFeedForArtistResponse, GetAssetFeedForGameResponse, GetAssetFeedForVoterResponse } from "../types/dto.types";
import { AssetItemForGameFeed, AssetItemForVoterFeed, AssetVoter, IntermediateVoterAssetItem } from "../types/assets.types";
import { getAllEligibleVoters } from "./user.data";

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
      imageUrl: true,
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
      imageUrl: true,
      currentPhase: true,
      createdAt: true,
      uploader: {
        select: {
          firstName: true,
          fullName: true,
          initials: true,
          avatar: true,
          customAvatar: true,
          team: {
            select: { name: true }
          }
        }
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
    imageUrl: asset.imageUrl,
    createdAt: asset.createdAt,
    currentPhase: asset.currentPhase,
    uploader: {
      firstName: asset.uploader.firstName,
      fullName: asset.uploader.fullName,
      initials: asset.uploader.initials,
      avatar: asset.uploader.avatar,
      customAvatar: asset.uploader.customAvatar,
      teamName: asset.uploader.team.name
    },
    vote_id: asset.votes[0]?.id || null // Used to reference assetVote if user wants to switch vote back to pending
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
  // Asset: id, title, imageUrl, category, status, uploader_id (to get uploader name), createdAt.
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
      imageUrl: true,
      createdAt: true,
      currentPhase: true,
      status: true,
      uploader: {
        select: {
          id: true,
          firstName: true,
          team: {
            select: { name: true }
          }
        }
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
            select: {
              id: true,
              fullName: true,
              initials: true,
              avatar: true,
              customAvatar: true,
              team: {
                select: { name: true }
              }
            }
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
      imageUrl: asset.imageUrl,
      createdAt: asset.createdAt,
      currentPhase: asset.currentPhase,
      status: asset.status,
      uploader: {
        firstName: asset.uploader.firstName,
        teamName: asset.uploader.team.name
      },
      voters: [] as Array<AssetVoter>
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
    } else {
      // For pending assets (tied votes or no votes), show voters who haven't voted yet
      const pendingVoters = eligibleVoters
        .filter((voter) => !votedUserIds.has(voter.id) && voter.id !== asset.uploader.id)
        .map((voter) => ({
          id: voter.id,
          fullName: voter.fullName,
          initials: voter.initials,
          avatar: voter.avatar,
          customAvatar: voter.customAvatar,
          teamName: voter.teamName
        }));
      assetDTO.voters = pendingVoters;
      sortedAssets.pending.push(assetDTO);
    }
  });
  return sortedAssets;
}