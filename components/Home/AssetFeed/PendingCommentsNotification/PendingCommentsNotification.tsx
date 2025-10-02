"use client";

import React, { useTransition } from "react";
import { dismissCommentsForAsset } from "@/app/actions/comment.actions";
import { PendingCommentData } from "@/lib/types/comments.types";
import CommentIcon from "@/components/SVG/Icons/CommentIcon";
import { useRouter } from "next/navigation";

import styles from "./PendingCommentsNotification.module.css";

interface PendingCommentsNotificationProps {
  notifications: Array<PendingCommentData>
}

export default function PendingCommentsNotification({ notifications }: PendingCommentsNotificationProps) {
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

  return (
    <div className={styles.pending_comment_footer}>
      <button
        disabled={isPending}
        onClick={handleDismiss}
        className={styles.comment_icon}
      >
        <div className={styles.comment_number_bubble}>
          {notifications.length}
        </div>
        <CommentIcon />
      </button>
    </div>
  );
}