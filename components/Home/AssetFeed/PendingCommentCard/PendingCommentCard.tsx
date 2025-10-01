"use client";

import { useState, useTransition } from "react";
import AvatarBubble from "@/components/AvatarBubble/AvatarBubble";
import { timeAgo } from "@/lib/utils";
import { PendingCommentData } from "@/lib/types/comments.types";
import Image from "next/image";
import { useRouter } from "next/navigation";

import styles from "./PendingCommentCard.module.css";
import { dismissCommentsForAsset } from "@/app/actions/comment.actions";

interface PendingCommentCardProps {
  comment: PendingCommentData;
}

export default function PendingCommentCard({ comment }: PendingCommentCardProps) {
  const [isPending, startTransition] = useTransition();
  const fallbackSrc = "/no-image-available.webp";
  const [imageSrc, setImageSrc] = useState(comment.assetImage || fallbackSrc);
  const router = useRouter();
  const handleCardClick = () => {
    startTransition(async () => {
      await dismissCommentsForAsset(comment.subscriber_id, comment.asset_id);
    });
    router.push(`/game/${comment.game_id}/asset/${comment.asset_id}`);
  }

  const handleDismissClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    startTransition(async () => {
      await dismissCommentsForAsset(comment.subscriber_id, comment.asset_id);
    });
    window.location.reload(); // Hard reload - not the best option but meh
  }

  return (
    <div className={styles.comment_card} onClick={handleCardClick}>
      <div className={styles.comment_content}>

        <div className={styles.text_content}>
          <div className={styles.user_info}>
            <AvatarBubble size="medium" user={comment.commenter} />
            <span>{timeAgo(comment.createdAt)}</span>
          </div>
          <span className={styles.comment}>
            {comment.content}
          </span>
        </div>

        <div className={styles.image_preview_container}>
          <Image
            src={imageSrc}
            alt="Asset Preview"
            className="object-fit"
            height={1080}
            width={1080}
            onError={() => setImageSrc(fallbackSrc)}
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