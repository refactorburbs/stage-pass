"use client";

import Image from "next/image";
import { useState } from "react";
import { AssetFeedItem } from "@/lib/types/assets.types";
import { AssetStatus, VotePhase } from "@/app/generated/prisma";
import ReactTimeAgo from "react-time-ago";
import VoterBubbles from "../VoterBubbles/VoterBubbles";

import styles from "./ColumnListViewItem.module.css";

interface ColumnListViewProps {
  item: AssetFeedItem;
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

export default function ColumnListViewItem({ item }: ColumnListViewProps) {
  // If the imageUrl exists but is a broken link (can happen with improper database deletions), then have fallback.
  const fallbackSrc = "/no-image-available.webp";
  const [imageSrc, setImageSrc] = useState(item.imageUrl || fallbackSrc);

  const hasStatus = "status" in item;
  const hasVoters = "voters" in item;
  const hasOtherUploader = "uploader" in item;

  const itemColor = hasStatus ? getItemColor(item.status) : "white";
  const submissionInfoText = `Submitted by ${hasOtherUploader ? item.uploader.firstName : "you"}`;
  console.log('item is ', item)

  const renderFooter = () => {
    if (hasVoters) {
      return <VoterBubbles voters={item.voters} />;
    } else if (hasOtherUploader) {
      return (
        <div className={styles.vote_status}>
          <div className={styles.submission_info}>
            Voted by you • <ReactTimeAgo date={item.createdAt} locale="en-US" />
          </div>
          <button type="button">
            Move to Pending
          </button>
        </div>
      );
    }
    return <></>
  }

  return (
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
          {submissionInfoText} • <ReactTimeAgo date={item.createdAt} locale="en-US" />
        </div>

        <div className={styles.item_footer}>
          {renderFooter()}
        </div>
      </div>
    </div>
  );
}