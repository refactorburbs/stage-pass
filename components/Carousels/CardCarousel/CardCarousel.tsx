"use client";

import { useEffect, useOptimistic, useState } from "react";
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
    // currState,  newState/action     new set to trigger React state update
    (currentVoted, assetId: number) => new Set(currentVoted).add(assetId)
  );

  // Filter out voted items to get the optimistic items list
  const availableItems = items.filter(item => !votedAssetIds.has(item.id));
  const itemCount = availableItems.length;

  // Sync currentIndex when availableItems changes (due to voting)
  useEffect(() => {
    if (currentIndex >= itemCount && itemCount > 0) {
      setCurrentIndex(itemCount - 1);
    }
  }, [itemCount, currentIndex]);

  const nextCard = () => {
    setCurrentIndex(prev => prev < itemCount - 1 ? prev + 1 : prev);
  };

  const prevCard = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : prev);
  };

  // Optimistic vote - update UI immediately while async server action happens in VoteButtons to cast vote
  const handleOptimisticVote = (assetId: number) => {
    // Update the optimistic state (which will trigger a re-render with the filtered list)
    // and the useEffect will handle the index adjustment
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

  // In case a race condition still occurs (which it shouldn't... return nothing rather than crash)
  if (!currentItem) return null;

  return (
    <div className={styles.carousel_and_pagination_container}>
      <div className="card-carousel">
        <CarouselArrow
          direction="left"
          onClick={prevCard}
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
          onClick={nextCard}
          isActive={!isLastSlide}
        />
      </div>
      <PaginationDots activeIndex={currentIndex} dotQuantity={itemCount}/>
    </div>
  );
}