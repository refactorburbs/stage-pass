"use client";

import { useCallback, useOptimistic, useState } from "react";
import { AssetFeedItem, AssetItemForVoterFeed } from "@/lib/types/assets.types";
import { PendingCommentData } from "@/lib/types/comments.types";
import CarouselArrow from "../CarouselArrow/CarouselArrow";
import PendingAssetCard from "@/components/Cards/PendingAssetCard/PendingAssetCard";
import PendingCommentCard from "@/components/Cards/PendingCommentCard/PendingCommentCard";

import styles from "./CardCarousel.module.css";

interface CardCarouselProps {
  items: Array<AssetFeedItem | PendingCommentData>
  type: "asset" | "comment";
}
export default function CardCarousel({ items, type }: CardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track voted asset IDs optimistically (filter out ones already voted on)
  //    optimisticState setOptimisticState
  const [votedAssetIds, addVotedAsset] = useOptimistic(
    new Set<number>(),
    // currState,  newState
    (currentVoted, assetId: number) => new Set(currentVoted).add(assetId)
  );

  // Filter out voted items to get the optimistic items list
  const availableItems = items.filter(item => !votedAssetIds.has(item.id));
  const itemCount = availableItems.length;

  // Navigate to next slide
  const nextSlide = useCallback(() => {
    const nextIndex = currentIndex < itemCount - 1 ? currentIndex + 1 : currentIndex;
    setCurrentIndex(nextIndex);
  }, [currentIndex, itemCount]);

  // Navigate to previous slide
  const prevSlide = useCallback(() => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : currentIndex;
    setCurrentIndex(prevIndex);
  }, [currentIndex]);

  // Optimistic vote - update UI immediately while async server action happens to cast vote
  const handleOptimisticVote = (assetId: number) => {
    addVotedAsset(assetId);
    // If this is the last item, stay put (will show "no items")
    // Otherwise shift the current index to the next item immediately
    if (currentIndex >= itemCount - 1 && itemCount > 1) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  }

  // Check if we're at the first or last slide for arrow states
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === itemCount - 1;
  const currentItem = availableItems[currentIndex];

  // If no available items, parent component handles this
  if (itemCount === 0) {
    return null; // Parent shows "No items in this category"
  }

  return (
    <div className={styles.carousel_and_pagination_container}>
      <div className={styles.main_carousel}>
        <CarouselArrow
          direction="left"
          onClick={prevSlide}
          isActive={!isFirstSlide}
        />
        {type === "asset" ?
          (
            <PendingAssetCard
              asset={currentItem as AssetItemForVoterFeed}
              onVote={handleOptimisticVote}
            />
          ) : (
            <PendingCommentCard
              comment={currentItem as PendingCommentData}
            />
          )
        }
        <CarouselArrow
          direction="right"
          onClick={nextSlide}
          isActive={!isLastSlide}
        />
      </div>
      <span>{currentIndex + 1}/{items.length}</span>
    </div>
  );

}