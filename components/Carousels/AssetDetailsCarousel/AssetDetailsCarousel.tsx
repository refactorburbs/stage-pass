"use client";

import { useEffect, useRef, useState } from "react";
import { AssetHistoryArray } from "@/lib/types/assets.types";
import { UserAssetComment } from "@/lib/types/comments.types";
import AvatarBubble from "@/components/Avatar/AvatarBubble/AvatarBubble";
import VoterBubbles from "@/components/Avatar/VoterBubbles/VoterBubbles";
import VoteButtons from "@/components/Buttons/VoteButtons/VoteButtons";
import CarouselArrow from "../CarouselArrow/CarouselArrow";
import ImageGrid from "@/components/Layout/ImageGrid/ImageGrid";
import { VotePhase } from "@/app/generated/prisma";
import { isAssetLocked, timeAgo } from "@/lib/utils";
import AssetDetailsCommentList from "./AssetDetailsCommentList/AssetDetailsCommentList";

import styles from "./AssetDetailsCarousel.module.css";

interface AssetDetailsCarouselProps {
  assetHistoryArray: AssetHistoryArray;
  assetCommentHistoryArray: Array<UserAssetComment[]>;
  isPendingVote: boolean | undefined;
  gameId: number;
  targetPhase: VotePhase;
}

export default function AssetDetailsCarousel({
  assetHistoryArray,
  assetCommentHistoryArray,
  isPendingVote,
  gameId,
  targetPhase,
}: AssetDetailsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const contactFormRef = useRef<HTMLFormElement | null>(null);

  const itemCount = assetHistoryArray.length;
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === itemCount - 1;
  const currentAsset = assetHistoryArray[currentIndex];
  const latestAsset = assetHistoryArray[0]; // contains category and title info that stays the same for all revisions.
  const assetIsLocked = isAssetLocked(latestAsset.currentPhase, latestAsset.status);
  const uploaderInfoString = `${currentAsset.uploader.fullName} - ${currentAsset.uploader.teamName}`;

  useEffect(() => {
    // Can only comment on the latest revision (the most current asset in review)
    contactFormRef.current = document.getElementById("asset-details-comment-form") as HTMLFormElement;

    if (!contactFormRef.current) return;
    if (currentIndex !== 0 || assetIsLocked) {
      contactFormRef.current.style.visibility = "hidden";
    } else {
      contactFormRef.current.style.visibility = "visible";
    }
  }, [assetIsLocked, currentIndex]);

  const nextSlide = () => {
    setCurrentIndex(prev => prev < itemCount - 1 ? prev + 1 : prev);
  };

  const prevSlide = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : prev);
  };

  return (
    <div className={styles.asset_content}>
      <h2>{latestAsset.title}</h2>
      <div className={styles.uploader_info}>
        <AvatarBubble user={currentAsset.uploader} size="medium"/>
        <div className={styles.submission_info}>
          {uploaderInfoString} • {timeAgo(currentAsset.createdAt)}
        </div>
      </div>
      <div className={styles.carousel_container}>
        <CarouselArrow
          direction="left"
          onClick={prevSlide}
          isActive={!isFirstSlide}
        />
        <div className={styles.carousel}>
          <div className={styles.image_grid_container}>
            <ImageGrid imageUrls={currentAsset.imageUrls} key={currentAsset.id}/>
            {isPendingVote && currentIndex === 0 && (
              <VoteButtons
                assetId={latestAsset.id}
                currentPhase={targetPhase}
                gameId={Number(gameId)}
              />
            )}
          </div>
          {currentIndex === 0 && (
            <div className={styles.vote_info_container}>
              <div className={styles.vote_info_content}>
                <span>{`Approved (${latestAsset.votes.approvePercentage}%): `}</span>
                <VoterBubbles voters={latestAsset.votes.approved} />
              </div>
              <div className={styles.vote_info_content}>
                <span>{`Rejected (${latestAsset.votes.rejectPercentage}%): `}</span>
                <VoterBubbles voters={latestAsset.votes.rejected} />
              </div>
              <div className={styles.vote_info_content}>
                <span>{`Pending Votes: ${latestAsset.votes.pendingCount} `}</span>
              </div>
            </div>
          )}
        </div>
        <CarouselArrow
          direction="right"
          onClick={nextSlide}
          isActive={!isLastSlide}
        />
      </div>
      <AssetDetailsCommentList
        assetCommentHistoryArray={assetCommentHistoryArray}
        currentIndex={currentIndex}
      />
    </div>
  )
}