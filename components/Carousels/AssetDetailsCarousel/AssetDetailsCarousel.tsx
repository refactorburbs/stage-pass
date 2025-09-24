"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AssetHistoryArray, UserAssetComment } from "@/lib/types/assets.types";
import AvatarBubble from "@/components/AvatarBubble/AvatarBubble";
import VoterBubbles from "@/components/Home/AssetFeed/VoterBubbles/VoterBubbles";
import VoteButtons from "@/components/Home/AssetFeed/PendingAssetCard/VoteButtons";
import CarouselArrow from "@/components/Home/AssetFeed/CarouselArrow/CarouselArrow";
import ImageGrid from "@/components/ImageGrid/ImageGrid";
import { VotePhase } from "@/app/generated/prisma";
import AssetComment from "@/components/AssetComment/AssetComment";
import { isAssetLocked, timeAgo } from "@/lib/utils";

import styles from "./AssetDetailsCarousel.module.css";

interface AssetDetailsCarouselProps {
  assetHistoryArray: AssetHistoryArray;
  isPendingVote: boolean | undefined;
  gameId: number;
  targetPhase: VotePhase;
  getAssetComments: (assetId: number, phase: VotePhase) => Promise<UserAssetComment[]>;
}

export default function AssetDetailsCarousel({
  assetHistoryArray,
  isPendingVote,
  gameId,
  targetPhase,
  getAssetComments
}: AssetDetailsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [comments, setComments] = useState<Array<UserAssetComment>>([]);
  const contactFormRef = useRef<HTMLFormElement | null>(null);
  const uploadButtonRef = useRef<HTMLLinkElement | null>(null);

  const itemCount = assetHistoryArray.length;
  // Check if we're at the first or last slide for arrow states
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === itemCount - 1;
  const currentAsset = assetHistoryArray[currentIndex];
  const latestAsset = assetHistoryArray[0]; // contains category and title info that stays the same for all revisions.
  const uploaderInfoString = `${currentAsset.uploader.fullName} - ${currentAsset.uploader.teamName}`;
  const assetIsLocked = isAssetLocked(latestAsset);

  useEffect(() => {
    const refreshAssetComments = async () => {
      const updatedComments = await getAssetComments(assetHistoryArray[currentIndex].id, targetPhase);
      setComments(updatedComments);
    }
    refreshAssetComments();

    // Can only comment on the latest revision (the most current asset in review)
    contactFormRef.current = document.getElementById("asset-details-comment-form") as HTMLFormElement;
    uploadButtonRef.current = document.getElementsByClassName("upload-button")[0] as HTMLLinkElement;

    if (!contactFormRef.current) return;
    if (currentIndex !== 0 || assetIsLocked) {
      contactFormRef.current.style.visibility = "hidden";
    } else {
      contactFormRef.current.style.visibility = "visible";
    }

    if (assetIsLocked) {
      uploadButtonRef.current.style.visibility = "hidden";
    } else {
      uploadButtonRef.current.style.visibility = "visible";
    }
  }, [assetHistoryArray, assetIsLocked, currentIndex, getAssetComments, targetPhase]);

  // Navigate to next slide
  const nextSlide = useCallback(async () => {
    const nextIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : currentIndex;
    setCurrentIndex(nextIndex);
  }, [currentIndex, itemCount]);

  // Navigate to previous slide
  const prevSlide = useCallback(async () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
    setCurrentIndex(prevIndex);
  }, [currentIndex]);

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
      <div className={styles.asset_comments}>
        <h3>Comments</h3>
        {comments.map((comment) => <AssetComment comment={comment} key={comment.id}/>)}
      </div>
    </div>
  )
}