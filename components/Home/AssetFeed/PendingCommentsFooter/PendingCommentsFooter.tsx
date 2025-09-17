"use client";

import { PendingCommentData } from "@/lib/types/assets.types";
import React, { useTransition } from "react";
import { dismissCommentsForAsset } from "@/app/actions/comment.actions";
import { useRouter } from "next/navigation";

import styles from "./PendingCommentsFooter.module.css";

interface PendingCommentsFooterProps {
  notifications: Array<PendingCommentData>
}

export default function PendingCommentsFooter({ notifications }: PendingCommentsFooterProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  if (notifications.length === 0) return <></>;

  const userId = notifications[0].subscriber_id;
  const assetId = notifications[0].asset_id;
  const gameId = notifications[0].game_id;

  const handleDismiss = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    startTransition(async () => {
      await dismissCommentsForAsset(userId, assetId);
    });
    router.push(`/game/${gameId}/asset/${assetId}`);
  }

  const commentCountString = `${notifications.length} New Comment${notifications.length === 1 ? "" : "s"}`;
  return (
    <div className={styles.pending_comment_footer}>
      <span>{commentCountString}</span>
      <button disabled={isPending} onClick={handleDismiss}>
        Dismiss
      </button>
    </div>
  );
}