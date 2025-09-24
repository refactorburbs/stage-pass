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
}

interface BentoImageGridProps {
  imageUrls: string[];
}

export default function ImageGrid({ imageUrls }: BentoImageGridProps) {
  const [images, setImages] = useState<ImageData[]>([]);

  useEffect(function resetStateOnCarouselArrowChange() {
    setImages(
      imageUrls.slice(0, 4).map((url, index) => ({
        url,
        width: 0,
        height: 0,
        aspectRatio: 1,
        originalIndex: index,
        loaded: false
      }))
    );
  }, [imageUrls]);

  const handleImageLoad = (index: number, event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = event.target as HTMLImageElement;

    setImages(prev => {
      const newImages = [...prev];
      newImages[index] = {
        ...newImages[index],
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
        loaded: true
      };
      return newImages;
    });
  };

  const allImagesLoaded = images.every(img => img.loaded);

  const renderSingleImage = () => {
    const image = images[0];
    return (
      <div className={styles.single_layout}>
        <div
          className={styles.image_container}
          style={{ aspectRatio: allImagesLoaded ? image.aspectRatio : "16/9" }}
        >
          <Image
            src={image.url}
            alt="Asset Image 1"
            width={1920}
            height={1080}
            className={styles.image}
            onLoad={(e) => handleImageLoad(0, e)}
          />
        </div>
      </div>
    );
  };

  const renderTwoImages = () => {
    const imagesSortedByWidth = [...images].sort((a, b) => b.width - a.width);
    const img1 = images[imagesSortedByWidth[0].originalIndex];
    const img2 = images[imagesSortedByWidth[1].originalIndex];
    // Calculate flex ratios based on width, but with some limits
    const flexRatio1 = allImagesLoaded ? Math.max(imagesSortedByWidth[0].width / imagesSortedByWidth[1].width, 1.2) : 1.5;
    const flexRatio2 = 1;

    return (
      <div className={styles.two_layout}>
        <div
          className={styles.image_container}
          style={{
            flex: flexRatio1,
            aspectRatio: allImagesLoaded ? img1.aspectRatio : "16/9"
          }}
        >
          <Image
            src={img1.url}
            alt="Asset Image 1"
            width={1920}
            height={1080}
            className={styles.image}
            onLoad={(e) => handleImageLoad(img1.originalIndex, e)}
          />
        </div>
        <div
          className={styles.image_container}
          style={{
            flex: flexRatio2,
            aspectRatio: allImagesLoaded ? img2.aspectRatio : "16/9"
          }}
        >
          <Image
            src={img2.url}
            alt="Asset Image 2"
            width={1920}
            height={1080}
            className={styles.image}
            onLoad={(e) => handleImageLoad(img2.originalIndex, e)}
          />
        </div>
      </div>
    );
  };

  const renderThreeImages = () => {
    const imagesSortedByWidth = [...images].sort((a, b) => b.width - a.width);
    const hasMultipleWideImages = imagesSortedByWidth.filter((image) => image.aspectRatio > 1.3).length >= 2;
    // If the images vary in size, then put the larger one on top and find a flex ratio for the two smaller ones.
    const largestImage = images[imagesSortedByWidth[0].originalIndex];
    const remainingImages = imagesSortedByWidth.slice(1);
    // Calculate flex ratio for the two smaller images
    const img2 = images[remainingImages[0].originalIndex];
    const img3 = images[remainingImages[1].originalIndex];
    const flexRatio = allImagesLoaded ? img2.width > 0 && img3.width > 0 ? 1 - (img3.width / img2.width) : 1 : 1;

    return (
      <div className={styles.three_layout}>
        {/* Large image on top */}
        <div
          className={styles.image_container}
          style={{
            aspectRatio: allImagesLoaded ? largestImage.aspectRatio : "16/9"
          }}
        >
          <Image
            src={largestImage.url}
            alt="Asset Image 1"
            width={1920}
            height={1080}
            className={styles.image}
            onLoad={(e) => handleImageLoad(largestImage.originalIndex, e)}
          />
        </div>

        {/* Two smaller images on bottom if of varying sizes, else just column stack */}
        <div className={hasMultipleWideImages ? "" : styles.grid_row}>
          <div
            className={styles.image_container}
            style={{
              aspectRatio: allImagesLoaded ? img2.aspectRatio : "16/9",
              flex: flexRatio
            }}
          >
            <Image
              src={img2.url}
              alt="Asset Image 2"
              width={1920}
              height={1080}
              className={styles.image}
              onLoad={(e) => handleImageLoad(img2.originalIndex, e)}
            />
          </div>
          <div
            className={styles.image_container}
            style={{
              flex: Math.min(1 - flexRatio, 0.5),
              aspectRatio: allImagesLoaded ? img3.aspectRatio : "16/9"
            }}
          >
            <Image
              src={img3.url}
              alt="Asset Image 3"
              width={1920}
              height={1080}
              className={styles.image}
              onLoad={(e) => handleImageLoad(img3.originalIndex, e)}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderFourImages = () => {
    const imagesSortedByWidth = [...images].sort((a, b) => b.width - a.width);
    const hasMultipleWideImages = imagesSortedByWidth.filter((image) => image.aspectRatio > 1.3).length >= 2;
    const img1 = images[imagesSortedByWidth[0].originalIndex];
    const img2 = images[imagesSortedByWidth[1].originalIndex];
    const img3 = images[imagesSortedByWidth[2].originalIndex];
    const img4 = images[imagesSortedByWidth[3].originalIndex];
    // Try to create balanced rows with flex 1
    return (
      <div className={styles.four_layout}>
        <div className={hasMultipleWideImages ? styles.grid_row : ""}>
          <div
            className={styles.image_container}
            style={{
              flex: 1,
              aspectRatio: allImagesLoaded ? img1.aspectRatio : "16/9"
            }}
          >
            <Image
              src={img1.url}
              alt="Asset Image 1"
              width={1920}
              height={1080}
              className={styles.image}
              onLoad={(e) => handleImageLoad(img1.originalIndex, e)}
            />
          </div>
          <div
            className={styles.image_container}
            style={{
              flex: 1,
              aspectRatio: allImagesLoaded ? img2.aspectRatio : "16/9"
            }}
          >
            <Image
              src={img2.url}
              alt="Asset Image 2"
              width={1920}
              height={1080}
              className={styles.image}
              onLoad={(e) => handleImageLoad(img2.originalIndex, e)}
            />
          </div>
        </div>

        <div className={hasMultipleWideImages ? styles.grid_row : ""}>
          <div
            className={styles.image_container}
            style={{
              flex: 1,
              aspectRatio: allImagesLoaded ? img3.aspectRatio : "16/9"
            }}
          >
            <Image
              src={img3.url}
              alt="Asset Image 3"
              width={1920}
              height={1080}
              className={styles.image}
              onLoad={(e) => handleImageLoad(img3.originalIndex, e)}
            />
          </div>
          <div
            className={styles.image_container}
            style={{
              flex: 1,
              aspectRatio: allImagesLoaded ? img4.aspectRatio : "16/9"
            }}
          >
            <Image
              src={img4.url}
              alt="Asset Image 4"
              width={1920}
              height={1080}
              className={styles.image}
              onLoad={(e) => handleImageLoad(img4.originalIndex, e)}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderLayout = () => {
    switch (images.length) {
      case 1:
        return renderSingleImage();
      case 2:
        return renderTwoImages();
      case 3:
        return renderThreeImages();
      case 4:
        return renderFourImages();
      default:
        return null;
    }
  };

  return (
    <div className={styles.bento_grid}>
      {renderLayout()}
    </div>
  );
}