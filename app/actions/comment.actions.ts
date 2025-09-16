"use server";

import prisma from "@/lib/prisma";
import {
  SubscriptionType,
} from "@/app/generated/prisma";
import z from "zod";
import { revalidatePath } from "next/cache";

// Validation schemas ----------------------------------------------------------------
const createCommentSchema = z.object({
  assetId: z.string().transform((id) => { // Form fields are strings, so transform to num.
    const num = parseInt(id);
    if (isNaN(num)) throw new Error("Invalid asset ID");
    return num;
  }),
  userId: z.string().transform((id) => {
    const num = parseInt(id);
    if (isNaN(num)) throw new Error("Invalid user ID");
    return num;
  }),
  gameId: z.string().transform((id) => {
    const num = parseInt(id);
    if (isNaN(num)) throw new Error("Invalid game ID");
    return num;
  }),
  content: z.string()
});
// -----------------------------------------------------------------------------------

// When a user casts votes, call this function with SubscriptionType.VOTED
export async function subscribeUserToAsset(userId: number, assetId: number, type: SubscriptionType) {
  await prisma.assetSubscription.upsert({
    where: {
      asset_id_user_id: { asset_id: assetId, user_id: userId } // satisfies the @@unique constraint
    },
    create: { // If not subscribed, this is the create condition
      asset_id: assetId,
      user_id: userId,
      subscription_type: type
    },
    update: {} // If already subscribed, do nothing
  });
}

export async function createCommentAndNotify(formData: FormData): Promise<void> {
  const validatedFields = createCommentSchema.safeParse({
    assetId: formData.get("assetId"),
    userId: formData.get("userId"),
    gameId: formData.get("gameId"),
    content: formData.get("content")
  })

  if (!validatedFields.success) {
    return;
  }

  const { assetId, userId, gameId, content } = validatedFields.data;

  const comment = await prisma.assetComment.create({
    data: {
      asset_id: assetId,
      user_id: userId,
      content
    }
  });

  // Subscribe the commenter to further comments on this asset
  await subscribeUserToAsset(userId, assetId, SubscriptionType.COMMENTED);

  // Get all subscribers except the commenter (don't notify the person who just commented)
  const subscribers = await prisma.assetSubscription.findMany({
    where: {
      asset_id: assetId,
      user_id: { not: userId }
    }
  });

  // Create notifications for each subscriber on this asset,
  // linking each subscriber id to this new comment id and put it
  // in their pendingCommentNotification table
  const notifications = subscribers.map(sub => ({
    user_id: sub.user_id,
    comment_id: comment.id
  }));

  await prisma.pendingCommentNotification.createMany({
    data: notifications
  });

  revalidatePath(`/game/${gameId}/asset/${assetId}`);
}