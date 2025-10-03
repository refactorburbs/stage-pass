"use client";

import { useOptimistic, useState } from "react";
import { AssetFeedItem, AssetItemForVoterFeed } from "@/lib/types/assets.types";
import { PendingCommentData } from "@/lib/types/comments.types";
import CarouselArrow from "../CarouselArrow/CarouselArrow";
import PendingAssetCard from "@/components/Cards/PendingAssetCard/PendingAssetCard";
import PendingCommentCard from "@/components/Cards/PendingCommentCard/PendingCommentCard";
import PaginationDots from "@/components/SVG/PaginationDots/PaginationDots";

import styles from "./CardCarousel.module.css";

interface CardCarouselProps {
  items: Array<AssetFeedItem | PendingCommentData>
  type: "asset" | "comment";
}
export default function CardCarousel({ items, type }: CardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Track voted asset IDs optimistically (filter out ones already voted on)
  // (used in child component under a useTransition so rollbacks happen if it fails)
  // optimisticState = set of voteIds, setOptimisticState = add vote to set
  const [votedAssetIds, addVotedAsset] = useOptimistic(
    new Set<number>(), // Initial state
    // currState,  newState        new set to trigger React state update
    (currentVoted, assetId: number) => new Set(currentVoted).add(assetId)
  );

  // Filter out voted items to get the optimistic items list
  const availableItems = items.filter(item => !votedAssetIds.has(item.id));
  const itemCount = availableItems.length;

  // Navigate to next slide
  const nextSlide = () => {
    setCurrentIndex(prev => prev < itemCount - 1 ? prev + 1 : prev);
  };

  // Navigate to previous slide
  const prevSlide = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : prev);
  };

  // Optimistic vote - update UI immediately while async server action happens in VoteButtons to cast vote
  const handleOptimisticVote = (assetId: number) => {
    // The current index and current asset need to be updated together (otherwise we'll get a race condition)
    // before updating the optimistic state, check what the new index should be and if we have reference to the current item.
    const currentItem = availableItems[currentIndex];
    if (!currentItem) return;

    // Update the index first if we're voting on the currently displayed item
    if (currentItem.id === assetId) {
      // If this is the last item, stay put (will show "no items" b/c itemCount === 0)
      // Otherwise shift the current index to the next item immediately
      if (currentIndex >= itemCount - 1) {
        setCurrentIndex(Math.max(0, currentIndex - 1));
      }
    } else {
      // We're voting on a different item and need to adjust the index if the voted item is b4 current pos.
      const votedItemIndex = availableItems.findIndex(item => item.id === assetId);
      if (votedItemIndex !== -1 && votedItemIndex < currentIndex) {
        setCurrentIndex(prev => Math.max(0, prev - 1));
      }
    }
    // Lastly, update the optimistic state (which will trigger a re-render with the filtered list)
    addVotedAsset(assetId);
  }

  if (itemCount === 0) {
    return (
      <div className={styles.carousel_and_pagination_container}>
        <div className={styles.main_carousel}>
          <div className={styles.no_items}>
            No items in this category
          </div>
        </div>
        <PaginationDots activeIndex={currentIndex} dotQuantity={itemCount}/>
      </div>
    );
  }

  // Check if we're at the first or last slide for arrow states
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === itemCount - 1;
  const currentItem = availableItems[currentIndex];

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
      <PaginationDots activeIndex={currentIndex} dotQuantity={itemCount}/>
    </div>
  );
}