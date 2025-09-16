import prisma from "@/lib/prisma";

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
            select: {
              firstName: true,
              initials: true,
              avatar: true,
              customAvatar: true
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}