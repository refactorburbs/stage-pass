import prisma from "@/lib/prisma";
import { USER_AVATAR_SELECT_QUERY } from "../constants/placeholder.constants";
import { PendingCommentData, UserAssetComment } from "../types/assets.types";

export async function getUserPendingComments(userId: number): Promise<Array<PendingCommentData>> {
  const comments = await prisma.pendingCommentNotification.findMany({
    where: {
      user_id: userId,
      is_dismissed: false
    },
    select: {
      id: true,
      asset_id: true,
      comment: {
        select: {
          content: true,
          createdAt: true,
          asset: {
            select: {
              imageUrl: true,
              game_id: true
            }
          },
          user: {
            select: USER_AVATAR_SELECT_QUERY
          }
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return comments.map((comment) => ({
    id: comment.id,
    content: comment.comment.content,
    createdAt: comment.comment.createdAt,
    assetImage: comment.comment.asset.imageUrl,
    asset_id: comment.asset_id,
    game_id: comment.comment.asset.game_id,
    subscriber_id: userId,
    commenter: {
      id: comment.comment.user.id,
      firstName: comment.comment.user.firstName,
      fullName: comment.comment.user.fullName,
      initials: comment.comment.user.initials,
      avatar: comment.comment.user.avatar,
      customAvatar: comment.comment.user.customAvatar,
      teamName: comment.comment.user.team.name
    }
  }));
}

export async function getCommentsForAsset (assetId: number): Promise<Array<UserAssetComment>> {
  const assetComments = await prisma.assetComment.findMany({
    where: {
      asset_id: assetId
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: USER_AVATAR_SELECT_QUERY
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return assetComments.map((comment) => ({
    ...comment,
    user: {
      id: comment.user.id,
      firstName: comment.user.firstName,
      fullName: comment.user.fullName,
      initials: comment.user.initials,
      avatar: comment.user.avatar,
      customAvatar: comment.user.customAvatar,
      teamName: comment.user.team.name
    }
  }));
}