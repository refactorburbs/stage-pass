import prisma from "@/lib/prisma";
import { USER_AVATAR_SELECT_QUERY } from "../constants/placeholder.constants";

export async function getUserPendingComments(userId: number) {
  return await prisma.pendingCommentNotification.findMany({
    where: {
      user_id: userId,
      is_dismissed: false
    },
    include: {
      comment: {
        select: {
          content: true,
          createdAt: true,
          asset: {
            select: {
              id: true,
              imageUrl: true
            }
          },
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
}

export async function getCommentsForAsset (assetId: number) {
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
      createdAt: "desc"
    }
  });

  return assetComments;
}