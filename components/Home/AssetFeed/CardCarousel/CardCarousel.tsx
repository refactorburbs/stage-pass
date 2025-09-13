"use client";

import { useCallback, useState } from "react";
import { AssetFeedItem } from "@/lib/types/assets.types";
import CarouselArrow from "../CarouselArrow/CarouselArrow";
import PendingAssetCard from "../PendingAssetCard/PendingAssetCard";

import styles from "./CardCarousel.module.css";

interface CardCarouselProps {
  items: Array<AssetFeedItem>
  type: "asset" | "comment";
}
export default function CardCarousel({ items, type }: CardCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemCount = items.length;

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

  // Check if we're at the first or last slide for arrow states
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === itemCount - 1;

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
            <PendingAssetCard asset={items[currentIndex]}/>
          ) : (
            <div>Comment Card</div>
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