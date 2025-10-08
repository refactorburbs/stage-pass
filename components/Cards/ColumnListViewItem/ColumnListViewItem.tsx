"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { AssetFeedItem } from "@/lib/types/assets.types";
import { PendingCommentData } from "@/lib/types/comments.types";
import { AssetStatus, VotePhase } from "@/app/generated/prisma";
import VoterBubbles from "@/components/Avatar/VoterBubbles/VoterBubbles";
import CaretIcon from "@/components/SVG/Icons/CaretIcon";
import PendingCommentsNotification from "@/components/Feed/PendingCommentsNotification/PendingCommentsNotification";
import { redactAssetVote } from "@/app/actions/asset.actions";
import { useParams, useRouter } from "next/navigation";
import { timeAgo, isAssetLocked } from "@/lib/utils";
import { dismissCommentsForAsset } from "@/app/actions/comment.actions";
import AssetHeader from "@/components/Layout/Headers/AssetHeader/AssetHeader";
import LockIcon from "@/components/SVG/Icons/LockIcon";

import styles from "./ColumnListViewItem.module.css";

interface ColumnListViewItemProps {
  item: AssetFeedItem;
  notifications?: Array<PendingCommentData>;
  columnTitle: "Rejected" | "Approved" | "Pending" | "Pending Review";
}

// Assets that have a final vote on them are colored. Pending are white.
const getItemStyle = (currentPhase: VotePhase, status: AssetStatus) => {
  switch (status) {
    case AssetStatus.PHASE1_APPROVED:
      if (currentPhase === VotePhase.PHASE2) {
        return {
          backgroundColor: "#F1F3F4",
          border: "2px solid white"
        };
      }
    case AssetStatus.PHASE2_APPROVED:
      return {
        backgroundColor: "var(--color-approved-faded)",
        border: "2px solid var(--color-approved)"
      };
    case AssetStatus.PHASE1_REJECTED:
    case AssetStatus.PHASE2_REJECTED:
      return {
        backgroundColor: "var(--color-rejected-faded)",
        border: "2px solid var(--color-rejected)"
      };
    default:
      return {
        backgroundColor: "#F1F3F4",
        border: "2px solid white"
      };
  }
}

export default function ColumnListViewItem({ item, notifications, columnTitle }: ColumnListViewItemProps) {
  const { gameId } = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // If the imageUrl exists but is a broken link (can happen with improper database deletions), then have fallback.
  const fallbackSrc = "/no-image-available.webp";
  const [imageSrc, setImageSrc] = useState(item.imageUrls[0] || fallbackSrc);

  const hasVoters = "voters" in item; // like AssetItemForGameFeed
  const hasOtherUploader = "uploader" in item; // Voter or Game feed, not Artist feed
  const isArtistFeed = !hasOtherUploader;

  const itemStyle = getItemStyle(item.currentPhase, item.status);
  const submissionInfoText = `Submitted by ${hasOtherUploader ? item.uploader.firstName : "you"}`;
  const commentsForThisAsset = notifications?.filter((notification) => notification.asset_id === item.id) || [];

  const handleRedactVote = (voteId: number) => {
    startTransition(async () => {
      await redactAssetVote(voteId, Number(gameId));
    });
  };

  const onCardClick = () => {
    // If this is the Artist's personal feed with comments, dismiss them all on asset click
    if (commentsForThisAsset.length > 0) {
      startTransition(async () => {
        await dismissCommentsForAsset(commentsForThisAsset[0].subscriber_id, item.id);
      });
    }
    router.push(`/game/${gameId}/asset/${item.id}`);
  }

  const renderAssetReviewPhaseHeader = () => {
    const assetLocked = isAssetLocked(item.currentPhase, item.status);
    if (assetLocked) {
      const isApproved = item.status === AssetStatus.PHASE1_APPROVED || item.status === AssetStatus.PHASE2_APPROVED;
      const headerColor = isApproved ? "var(--color-approved)" : "var(--color-rejected)";
      return (
        <div className={styles.locked_overlay} style={{ backgroundColor: headerColor }}>
          <span>{isApproved ? "Approved" : "Rejected"}</span>
          <div className={styles.lock_icon}>
            <LockIcon />
          </div>
        </div>
      );
    }
    // show no header for external review
    let reviewPhaseText = "";
    if (isArtistFeed && item.currentPhase === VotePhase.PHASE2) {
      reviewPhaseText = "Pending Final Review";
    } else if (item.currentPhase === VotePhase.PHASE1) {
      reviewPhaseText = "Internal Review";
    }
    return (
      <span className={styles.phase_info}>
        {reviewPhaseText}
      </span>
    );
  }

  const renderFooter = () => {
    // For the game feed, where one asset item has several voters
    if (hasVoters) {
      if (item.voters.length === 0) {
        // This should never happen - if it's a tie, and all votes are in,
        // there would be 0 voters for an asset in the pending column. A notification should be sent
        // from the castAssetVote fn but currently just a discord one @TODO. so if no notifcation, fallback:
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
      const isInApprovedColumn = columnTitle === "Approved";
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
            className={styles.move_to_pending_button}
          >
            {isInApprovedColumn && <CaretIcon direction="left" sizePx={5}/>}
            Move to Pending
            {!isInApprovedColumn && <CaretIcon direction="right" sizePx={5}/>}
          </button>
        </div>
      );
    }
    // Default case is artists: show a footer of how many pending comments
    // are on the asset they uploaded.
    return <PendingCommentsNotification notifications={commentsForThisAsset}/>
  }

  return (
    <div
      onClick={onCardClick}
      className={styles.list_item_container}
      style={itemStyle}
    >
      <div className={styles.image_preview_container}>
        <Image
          src={imageSrc}
          alt="Asset"
          height={1080}
          width={1080}
          className="object-fit"
          onError={() => setImageSrc(fallbackSrc)}
        />
      </div>
      <div className={styles.list_item_info}>
        <AssetHeader
          title={item.title}
          phaseInfoElement={renderAssetReviewPhaseHeader()}
          subtitle={submissionInfoText}
          timestamp={item.createdAt}
        />
        <div className={styles.item_footer}>
          {renderFooter()}
        </div>
      </div>
    </div>
  );
}