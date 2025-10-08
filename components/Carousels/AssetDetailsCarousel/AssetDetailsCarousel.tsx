"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AssetHistoryArray } from "@/lib/types/assets.types";
import { UserAssetComment } from "@/lib/types/comments.types";
import AvatarBubble from "@/components/Avatar/AvatarBubble/AvatarBubble";
import VoteButtons from "@/components/Buttons/VoteButtons/VoteButtons";
import CarouselArrow from "../CarouselArrow/CarouselArrow";
import ImageGrid from "@/components/Layout/ImageGrid/ImageGrid";
import { VotePhase } from "@/app/generated/prisma";
import { isAssetLocked, timeAgo } from "@/lib/utils";
import AssetDetailsVoteTrends from "./AssetDetailsVoteTrends/AssetDetailsVoteTrends";
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

  useLayoutEffect(() => {
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
    <div className={styles.asset_images_and_comments}>
      <div className={styles.asset_header}>
        <h2>{latestAsset.title}</h2>
        <div className={styles.uploader_info}>
          <AvatarBubble user={currentAsset.uploader} size="medium"/>
          <div className={styles.submission_info}>
            {uploaderInfoString} • {timeAgo(currentAsset.createdAt)}
          </div>
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
            <ImageGrid imageUrls={currentAsset.imageUrls} key={currentAsset.id} allowsEnlarge={true}/>
            {isPendingVote && currentIndex === 0 && (
              <VoteButtons
                assetId={latestAsset.id}
                currentPhase={targetPhase}
                gameId={Number(gameId)}
              />
            )}
          </div>
        </div>
        <CarouselArrow
          direction="right"
          onClick={nextSlide}
          isActive={!isLastSlide}
        />
      </div>
      {/* Only show the vote trends on the latest asset (not revisions) */}
      {currentIndex === 0 && (
        <AssetDetailsVoteTrends assetVotes={latestAsset.votes}/>
      )}
      <AssetDetailsCommentList
        assetCommentHistoryArray={assetCommentHistoryArray}
        currentIndex={currentIndex}
      />
    </div>
  )
}