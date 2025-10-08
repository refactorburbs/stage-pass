"use client";

import { useState, useTransition } from "react";
import { dismissCommentsForAsset } from "@/app/actions/comment.actions";
import { PendingCommentData } from "@/lib/types/comments.types";
import TrashIcon from "@/components/SVG/Icons/TrashIcon";
import { useRouter } from "next/navigation";
import Image from "next/image";

import styles from "./PendingCommentCard.module.css";
import CommentHeader from "@/components/Layout/Headers/CommentHeader/CommentHeader";

interface PendingCommentCardProps {
  comment: PendingCommentData;
}

const truncateComment = (comment: string) => {
  if (comment.length >= 150) {
    return `${comment.slice(0, 149)}...`;
  }
  return comment;
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
          <div className={styles.text_content_header}>

            <CommentHeader
              commenter={comment.commenter}
              timestamp={comment.createdAt}
            />

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
          <span className={`child-carousel-content ${styles.comment}`}>
            {truncateComment(comment.content)}
          </span>
        </div>

      </div>
      <button
        disabled={isPending}
        onClick={handleDismissClick}
        className={styles.dismiss_button}
      >
        <div className={styles.trash_icon}>
          <TrashIcon />
        </div>
        Dismiss
      </button>
    </div>
  );
}