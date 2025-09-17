"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { AssetFeedItem, PendingCommentData } from "@/lib/types/assets.types";
import { AssetStatus, VotePhase } from "@/app/generated/prisma";
import VoterBubbles from "../VoterBubbles/VoterBubbles";
import PendingCommentsFooter from "../PendingCommentsFooter/PendingCommentsFooter";
import { redactAssetVote } from "@/app/actions/asset.actions";
import { useParams } from "next/navigation";
import { timeAgo } from "@/lib/utils";

import styles from "./ColumnListViewItem.module.css";

interface ColumnListViewProps {
  item: AssetFeedItem;
  notifications?: Array<PendingCommentData>
}

// Assets that have a final vote on them are colored. Pending are white.
const getItemColor = (status: AssetStatus) => {
  switch (status) {
    case AssetStatus.PHASE1_APPROVED:
    case AssetStatus.PHASE2_APPROVED:
      return "#a8d899ff";
    case AssetStatus.PHASE1_REJECTED:
    case AssetStatus.PHASE2_REJECTED:
      return "#FAA0A0";
    default:
      return "white";
  }
}

export default function ColumnListViewItem({ item, notifications }: ColumnListViewProps) {
  const { gameId } = useParams();
  const [isPending, startTransition] = useTransition();
  // If the imageUrl exists but is a broken link (can happen with improper database deletions), then have fallback.
  const fallbackSrc = "/no-image-available.webp";
  const [imageSrc, setImageSrc] = useState(item.imageUrl || fallbackSrc);

  const hasStatus = "status" in item;
  const hasVoters = "voters" in item;
  const hasOtherUploader = "uploader" in item;

  const itemColor = hasStatus ? getItemColor(item.status) : "white";
  const submissionInfoText = `Submitted by ${hasOtherUploader ? item.uploader.firstName : "you"}`;

  const commentsForThisAsset = notifications?.filter((notification) => notification.asset_id === item.id) || [];

  const handleRedactVote = (voteId: number) => {
    startTransition(async () => {
      await redactAssetVote(voteId, Number(gameId));
    });
  };

  const renderFooter = () => {
    // For the game feed, where one asset item has several voters
    if (hasVoters) {
      if (item.voters.length === 0) {
        return <span>Voting Complete: Tie</span>
      }
      return (
        <div style={{width: "100%"}}>
          <VoterBubbles voters={item.voters} />
        </div>
      );
      // If there are no voters on the item, check if we uploaded or
      // if we are voting (someone else uploaded)
    } else if (hasOtherUploader) {
      return (
        <div className={styles.vote_status}>
          <div className={styles.submission_info}>
            Voted by you • {timeAgo(item.votedAt!)}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault(); // stop the default link/routing behavior of clicking parent container
              handleRedactVote(item.vote_id as number);
            }}
            disabled={isPending}
          >
            Move to Pending
          </button>
        </div>
      );
    }
    // Default case is artists: show a footer of how many pending comments
    // are on the asset they uploaded.
    return <PendingCommentsFooter notifications={commentsForThisAsset}/>
  }

  return (
    <Link href={`/game/${gameId}/asset/${item.id}`}>
      <div className={styles.list_item_container} style={{ backgroundColor: itemColor }}>
        <div className={styles.image_preview_container}>
          <Image
            src={imageSrc}
            alt="Asset"
            height={1080}
            width={1080}
            className={styles.preview_image}
            onError={() => setImageSrc(fallbackSrc)}
          />
        </div>
        <div className={styles.list_item_info}>
          <div className={styles.header}>
            <span>{item.title}</span>
            {item.currentPhase === VotePhase.PHASE1 && (
              <span className={styles.phase_info}>
                Internal Review
              </span>
            )}
          </div>
          <div className={styles.submission_info}>
            {submissionInfoText} • {timeAgo(item.createdAt)}
          </div>

          <div className={styles.item_footer}>
            {renderFooter()}
          </div>
        </div>
      </div>
    </Link>
  );
}