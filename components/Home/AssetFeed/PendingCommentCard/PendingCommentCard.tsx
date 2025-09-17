"use client";

import { useTransition } from "react";
import AvatarBubble from "@/components/AvatarBubble/AvatarBubble";
import { timeAgo } from "@/lib/utils";
import { PendingCommentData } from "@/lib/types/assets.types";
import Image from "next/image";
import { useRouter } from "next/navigation";

import styles from "./PendingCommentCard.module.css";

interface PendingCommentCardProps {
  comment: PendingCommentData;
}

export default function PendingCommentCard({ comment }: PendingCommentCardProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleDismissClick(e);
    router.push(`/game/${comment.game_id}/asset/${comment.asset_id}`);
  }

  const handleDismissClick = (e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>) => {
    e.stopPropagation();
    e.preventDefault();
    startTransition(async () => {
      // await redactAssetVote();
    });
  }

  return (
    <div className={styles.comment_card} onClick={handleCardClick}>
      <div className={styles.comment_content}>

        <div className={styles.text_content}>
          <div className={styles.user_info}>
            <AvatarBubble size="medium" user={comment.user} />
            <span>{timeAgo(comment.createdAt)}</span>
          </div>
          <span className={styles.comment}>
            {comment.content}
          </span>
        </div>

        <div className={styles.image_preview_container}>
          <Image
            src={comment.assetImage}
            alt="Asset Preview"
            className={styles.preview_image}
            height={1080}
            width={1080}
          />
        </div>
      </div>
      <button
        disabled={isPending}
        onClick={handleDismissClick}
      >
        Dismiss
      </button>
    </div>
  );
}