"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import styles from "./ImageGrid.module.css";

interface ImageData {
  url: string;
  width: number;
  height: number;
  aspectRatio: number;
  originalIndex: number;
  loaded: boolean;
  isLandscape: boolean;
}

interface ImageGridProps {
  imageUrls: string[];
  allowsEnlarge: boolean; /* only allow enlarging/opening of the image on asset details page */
}

function getGridTemplate(images: ImageData[]): string {
  // images will be an array sorted by aspect ratio and original picture width -
  // landscape images and wide images come first
  // and should take up more space unless it sacrifices their aspect ratio
  const count = images.length;
  const landscapeCount = images.filter(img => img.isLandscape).length;

  // Single image
  if (count === 1) {
    // Landscape takes up whole area, square takes up 50%
    return images[0].isLandscape
      ? `"img-1 img-1 img-1 img-1"
         "img-1 img-1 img-1 img-1"`
      : `"img-1 img-1 . ."
         "img-1 img-1 . ."`;
  }

  // Two images
  if (count === 2) {
    // Both are landscape (50%)
    if (landscapeCount === 2) {
      return `"img-1 img-1 . ."
              "img-2 img-2 . ."`;
    } else if (landscapeCount === 1) {
      // One landscape, one square (small row)
      return `"img-1 img-1 img-2 ."
              ". . . ."`;
    } else {
      // Both are square (take up whole area, 1/2 and 1/2)
      return `"img-1 img-1 img-2 img-2"
              "img-1 img-1 img-2 img-2"`;
    }
  }

  // Three images
  if (count === 3) {
    if (landscapeCount === 3) {
      return `"img-1 img-1 img-2 img-2"
              "img-3 img-3 . ."`;
    } else if (landscapeCount === 2) {
      return `"img-1 img-1 img-3 img-3"
              "img-2 img-2 img-3 img-3"`;
    } else if (landscapeCount === 1) {
      return `"img-1 img-1 img-2 img-2"
              ". img-3 img-2 img-2"`;
    } else {
      return `"img-1 img-1 img-2 ."
              "img-1 img-1 img-3 ."`;
    }
  }

  // Four images
  if (count === 4) {
    if (landscapeCount === 4) {
      return `"img-1 img-1 img-3 img-3"
              "img-2 img-2 img-4 img-4"`;
    } else if (landscapeCount === 3) {
      return `"img-1 img-1 img-4 ."
              "img-2 img-2 img-3 img-3"`;
    } else if (landscapeCount === 2) {
      return `"img-1 img-1 img-3 ."
              "img-2 img-2 img-4 ."`;
    } else if (landscapeCount === 1) {
      return `"img-2 img-2 img-3 img-4"
              "img-2 img-2 img-1 img-1"`;
    } else {
      return `"img-1 img-1 img-2 ."
              "img-1 img-1 img-3 img-4"`;
    }
  }

  return `"img-1 img-1 img-1 img-1"
          "img-1 img-1 img-1 img-1"`;
}

export default function ImageGrid({ imageUrls, allowsEnlarge }: ImageGridProps) {
  const [images, setImages] = useState<ImageData[]>([]);

  // Without this useEffect, scrolling on the Voter feed does not update imageUrls
  useEffect(function resetImagesOnCarouselArrowChange() {
    // @TODO remove slice. slicing right now for testing
    setImages(prev => {
      // Was running into an issue with the skeleton loading animation getting stuck
      // Next/Image generates a <img> with lazy loading and caching, and the browser will keep the cached decoded images in memory
      // but React will re-create the component. Since the <img> is new but the browser already has the data, onLoad won't fire again
      // after a soft refresh (revalidate path or navigating to the same route we're already on), so the check for allImagesLoaded will
      // be false after a soft refresh and the skeleton animation hangs until you do a full refresh. To circumvent that, we can
      // either try using onLoadingComplete instead of onLoad (because it always fires), or we can prevent the image state from fully
      // resetting on validation by returning the same state if the imageUrls didn't actually change.
      if (prev.length && prev.every((img, i) => img.url === imageUrls[i])) {
        return prev; // don’t reset if URLs are same
      }
      return imageUrls.slice(0, 4).map((url, index) => ({
        url,
        width: 0,
        height: 0,
        aspectRatio: 1,
        originalIndex: index,
        loaded: false,
        isLandscape: false,
      }));
    });
  }, [imageUrls]);

  const handleImageLoad = (index: number, event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.target as HTMLImageElement;
    const aspectRatio = img.naturalWidth / img.naturalHeight;

    setImages(prev => {
      const newImages = [...prev];
      newImages[index] = {
        ...newImages[index],
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio,
        isLandscape: aspectRatio > 1.3,
        loaded: true
      };
      return newImages;
    });
  };

  const allImagesLoaded = images.every(img => img.loaded);
  const sortedImages = allImagesLoaded
    ? [...images].sort((a, b) => {
        // 1. Landscape images first
        if (a.isLandscape !== b.isLandscape) {
          return a.isLandscape ? -1 : 1;
        }
        // 2. Wider aspect ratio first
        if (b.aspectRatio !== a.aspectRatio) {
          return b.aspectRatio - a.aspectRatio;
        }
        // 3. If aspect ratio is same, sort by width (larger first)
        return b.width - a.width;
      })
    : images;

  const gridTemplateAreas = allImagesLoaded
    ? getGridTemplate(sortedImages)
    : `"img-1 img-1 img-3 img-3"
       "img-2 img-2 img-3 img-3"`;

  return (
    <div
      className={styles.grid_template_setup}
      style={{ gridTemplateAreas }}
    >
      {sortedImages.map((image, index) => {
        const gridAreaName = `img-${index + 1}`;
        const WrapperComponent = allowsEnlarge ? "a" : "div";
        const wrapperProps = allowsEnlarge ? {
            href: image.url,
            target: "_blank",
            rel: "noopener noreferrer"
          } : {};
        return (
          <WrapperComponent
            key={image.originalIndex}
            className={styles.image_container}
            style={{ gridArea: gridAreaName }}
            {...wrapperProps}
          >
            <Image
              src={image.url}
              alt={`Image ${image.originalIndex + 1}`}
              height={1920}
              width={1080}
              className={`object-fit ${styles.image}`}
              onLoad={(e) => handleImageLoad(image.originalIndex, e)}
            />
            {!image.loaded && <div className={styles.skeleton_overlay} />}
          </WrapperComponent>
        );
      })}
    </div>
  );
}