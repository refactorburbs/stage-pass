"use server";

import prisma from "@/lib/prisma";
import { USER_DATA_SELECT_QUERY } from "../constants/query.constants";
import { PendingCommentData, UserAssetComment } from "../types/comments.types";
import { VotePhase } from "@/app/generated/prisma";
import { transformUserData } from "../utils";

/**
 * Fetches all **pending comment notifications** for a given user.
 *
 * - Only returns notifications that are not dismissed by this user.
 * - Results are ordered with the most recent comments first.
*/
export async function getUserPendingComments(userId: number): Promise<Array<PendingCommentData>> {
  const pendingNotifications = await prisma.pendingCommentNotification.findMany({
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
              imageUrls: true,
              game_id: true
            }
          },
          user: {
            select: USER_DATA_SELECT_QUERY
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc" // Most recent first
    }
  });

  return pendingNotifications.map((notification) => ({
    id: notification.id,
    content: notification.comment.content,
    createdAt: notification.comment.createdAt,
    assetImage: notification.comment.asset.imageUrls[0],
    asset_id: notification.asset_id,
    game_id: notification.comment.asset.game_id,
    subscriber_id: userId,
    commenter: transformUserData(notification.comment.user)
  }));
}

/**
 * Retrieves all comments for a specific asset in a given voting phase.
 *
 * - Includes the commenter’s transformed user data for consistent UI handling.
 * - Results are ordered chronologically (oldest first).
*/
export async function getCommentsForAsset (assetId: number, phase: VotePhase): Promise<Array<UserAssetComment>> {
  const assetComments = await prisma.assetComment.findMany({
    where: {
      asset_id: assetId,
      phase,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: {
        select: USER_DATA_SELECT_QUERY
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return assetComments.map((comment) => ({
    ...comment,
    user: transformUserData(comment.user)
  }));
}