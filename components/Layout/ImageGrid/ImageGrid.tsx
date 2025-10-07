// "use client";

// import Image from "next/image";
// import { useEffect, useState } from "react";

// import styles from "./ImageGrid.module.css";

// interface ImageData {
//   url: string;
//   width: number;
//   height: number;
//   aspectRatio: number;
//   originalIndex: number;
//   loaded: boolean;
// }

// interface ImageGridProps {
//   imageUrls: string[];
// }

// export default function ImageGrid({ imageUrls }: ImageGridProps) {
//   const [images, setImages] = useState<ImageData[]>([]);

//   useEffect(function resetStateOnCarouselArrowChange() {
//     setImages(
//       imageUrls.slice(0, 1).map((url, index) => ({
//         url,
//         width: 0,
//         height: 0,
//         aspectRatio: 1,
//         originalIndex: index,
//         loaded: false
//       }))
//     );
//   }, [imageUrls]);

//   const handleImageLoad = (index: number, event: React.SyntheticEvent<HTMLImageElement, Event>) => {
//     const img = event.target as HTMLImageElement;

//     setImages(prev => {
//       const newImages = [...prev];
//       newImages[index] = {
//         ...newImages[index],
//         width: img.naturalWidth,
//         height: img.naturalHeight,
//         aspectRatio: img.naturalWidth / img.naturalHeight,
//         loaded: true
//       };
//       return newImages;
//     });
//   };

//   const allImagesLoaded = images.every(img => img.loaded);

//   const renderSingleImage = () => {
//     const image = images[0];
//     return (
//       <div className={styles.single_layout}>
//         <div
//           className={styles.image_container}
//           style={{ aspectRatio: allImagesLoaded ? image.aspectRatio : "16/9" }}
//         >
//           <Image
//             src={image.url}
//             alt="Asset Image 1"
//             width={1920}
//             height={1080}
//             className={styles.image}
//             onLoad={(e) => handleImageLoad(0, e)}
//           />
//         </div>
//       </div>
//     );
//   };

//   const renderTwoImages = () => {
//     const imagesSortedByWidth = [...images].sort((a, b) => b.width - a.width);
//     const img1 = images[imagesSortedByWidth[0].originalIndex];
//     const img2 = images[imagesSortedByWidth[1].originalIndex];
//     // Calculate flex ratios based on width, but with some limits
//     const flexRatio1 = allImagesLoaded ? Math.max(imagesSortedByWidth[0].width / imagesSortedByWidth[1].width, 1.2) : 1.5;
//     const flexRatio2 = 1;

//     return (
//       <div className={styles.two_layout}>
//         <div
//           className={styles.image_container}
//           style={{
//             flex: flexRatio1,
//             aspectRatio: allImagesLoaded ? img1.aspectRatio : "16/9"
//           }}
//         >
//           <Image
//             src={img1.url}
//             alt="Asset Image 1"
//             width={1920}
//             height={1080}
//             className={styles.image}
//             onLoad={(e) => handleImageLoad(img1.originalIndex, e)}
//           />
//         </div>
//         <div
//           className={styles.image_container}
//           style={{
//             flex: flexRatio2,
//             aspectRatio: allImagesLoaded ? img2.aspectRatio : "16/9"
//           }}
//         >
//           <Image
//             src={img2.url}
//             alt="Asset Image 2"
//             width={1920}
//             height={1080}
//             className={styles.image}
//             onLoad={(e) => handleImageLoad(img2.originalIndex, e)}
//           />
//         </div>
//       </div>
//     );
//   };

//   const renderThreeImages = () => {
//     const imagesSortedByWidth = [...images].sort((a, b) => b.width - a.width);
//     const hasMultipleWideImages = imagesSortedByWidth.filter((image) => image.aspectRatio > 1.3).length >= 2;
//     // If the images vary in size, then put the larger one on top and find a flex ratio for the two smaller ones.
//     const largestImage = images[imagesSortedByWidth[0].originalIndex];
//     const remainingImages = imagesSortedByWidth.slice(1);
//     // Calculate flex ratio for the two smaller images
//     const img2 = images[remainingImages[0].originalIndex];
//     const img3 = images[remainingImages[1].originalIndex];
//     const flexRatio = allImagesLoaded ? img2.width > 0 && img3.width > 0 ? 1 - (img3.width / img2.width) : 1 : 1;

//     return (
//       <div className={styles.three_layout}>
//         {/* Large image on top */}
//         <div
//           className={styles.image_container}
//           style={{
//             aspectRatio: allImagesLoaded ? largestImage.aspectRatio : "16/9"
//           }}
//         >
//           <Image
//             src={largestImage.url}
//             alt="Asset Image 1"
//             width={1920}
//             height={1080}
//             className={styles.image}
//             onLoad={(e) => handleImageLoad(largestImage.originalIndex, e)}
//           />
//         </div>

//         {/* Two smaller images on bottom if of varying sizes, else just column stack */}
//         <div className={hasMultipleWideImages ? "" : styles.grid_row}>
//           <div
//             className={styles.image_container}
//             style={{
//               aspectRatio: allImagesLoaded ? img2.aspectRatio : "16/9",
//               flex: flexRatio
//             }}
//           >
//             <Image
//               src={img2.url}
//               alt="Asset Image 2"
//               width={1920}
//               height={1080}
//               className={styles.image}
//               onLoad={(e) => handleImageLoad(img2.originalIndex, e)}
//             />
//           </div>
//           <div
//             className={styles.image_container}
//             style={{
//               flex: Math.min(1 - flexRatio, 0.5),
//               aspectRatio: allImagesLoaded ? img3.aspectRatio : "16/9"
//             }}
//           >
//             <Image
//               src={img3.url}
//               alt="Asset Image 3"
//               width={1920}
//               height={1080}
//               className={styles.image}
//               onLoad={(e) => handleImageLoad(img3.originalIndex, e)}
//             />
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const renderFourImages = () => {
//     const imagesSortedByWidth = [...images].sort((a, b) => b.width - a.width);
//     const hasMultipleWideImages = imagesSortedByWidth.filter((image) => image.aspectRatio > 1.3).length >= 2;
//     const img1 = images[imagesSortedByWidth[0].originalIndex];
//     const img2 = images[imagesSortedByWidth[1].originalIndex];
//     const img3 = images[imagesSortedByWidth[2].originalIndex];
//     const img4 = images[imagesSortedByWidth[3].originalIndex];
//     // Try to create balanced rows with flex 1
//     return (
//       <div className={styles.four_layout}>
//         <div className={hasMultipleWideImages ? styles.grid_row : ""}>
//           <div
//             className={styles.image_container}
//             style={{
//               flex: 1,
//               aspectRatio: allImagesLoaded ? img1.aspectRatio : "16/9"
//             }}
//           >
//             <Image
//               src={img1.url}
//               alt="Asset Image 1"
//               width={1920}
//               height={1080}
//               className={styles.image}
//               onLoad={(e) => handleImageLoad(img1.originalIndex, e)}
//             />
//           </div>
//           <div
//             className={styles.image_container}
//             style={{
//               flex: 1,
//               aspectRatio: allImagesLoaded ? img2.aspectRatio : "16/9"
//             }}
//           >
//             <Image
//               src={img2.url}
//               alt="Asset Image 2"
//               width={1920}
//               height={1080}
//               className={styles.image}
//               onLoad={(e) => handleImageLoad(img2.originalIndex, e)}
//             />
//           </div>
//         </div>

//         <div className={hasMultipleWideImages ? styles.grid_row : ""}>
//           <div
//             className={styles.image_container}
//             style={{
//               flex: 1,
//               aspectRatio: allImagesLoaded ? img3.aspectRatio : "16/9"
//             }}
//           >
//             <Image
//               src={img3.url}
//               alt="Asset Image 3"
//               width={1920}
//               height={1080}
//               className={styles.image}
//               onLoad={(e) => handleImageLoad(img3.originalIndex, e)}
//             />
//           </div>
//           <div
//             className={styles.image_container}
//             style={{
//               flex: 1,
//               aspectRatio: allImagesLoaded ? img4.aspectRatio : "16/9"
//             }}
//           >
//             <Image
//               src={img4.url}
//               alt="Asset Image 4"
//               width={1920}
//               height={1080}
//               className={styles.image}
//               onLoad={(e) => handleImageLoad(img4.originalIndex, e)}
//             />
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const renderLayout = () => {
//     switch (images.length) {
//       case 1:
//         return renderSingleImage();
//       case 2:
//         return renderTwoImages();
//       case 3:
//         return renderThreeImages();
//       case 4:
//         return renderFourImages();
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className={styles.grid_template_setup}>
//       {renderLayout()}
//     </div>
//   );
// }

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
}

const demoImages = [
'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=450',
'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=450',
'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=800',
'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=450'
];

function getGridTemplate(images: ImageData[]): string {
  const count = images.length;
  const landscapeCount = images.filter(img => img.isLandscape).length;

  // Single image
  if (count === 1) {
    return images[0].isLandscape
      ? `"img-1 img-1 img-1 img-1"
         "img-1 img-1 img-1 img-1"`
      : `"img-1 img-1 . ."
         "img-1 img-1 . ."`;
  }

  // Two images
  if (count === 2) {
    if (landscapeCount === 2) {
      return `"img-1 img-1 . ."
              "img-2 img-2 . ."`;
    } else if (landscapeCount === 1) {
      return `". . img-2 img-2"
              "img-1 img-1 img-2 img-2"`;
    } else {
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
      return `"img-1 img-1 img-2 img-1"
              "img-3 . img-2 img-2"`;
    } else {
      return `"img-1 img-1 img-2 ."
              "img-1 img-1 img-3 ."`;
    }
  }

  // Four images
  if (count === 4) {
    if (landscapeCount === 4) {
      return `"img-1 img-1 img-2 img-2"
              "img-3 img-3 img-4 img-4"`;
    } else if (landscapeCount === 3) {
      return `"img-1 img-1 img-2 img-2"
              "img-3 img-3 img-4 ."`;
    } else if (landscapeCount === 2) {
      return `"img-1 img-1 img-3 img-4"
              "img-2 img-2 img-3 img-4"`;
    } else if (landscapeCount === 1) {
      return `"img-2 img-3 img-4 ."
              "img-2 img-3 img-1 img-1"`;
    } else {
      return `"img-1 img-2 img-3 img-4"
              "img-1 img-2 img-3 img-4"`;
    }
  }

  return `"img-1 img-1 img-1 img-1"
          "img-1 img-1 img-1 img-1"`;
}

export default function ImageGrid({ imageUrls }: ImageGridProps) {
  const [images, setImages] = useState<ImageData[]>([]);

  useEffect(function resetStateOnCarouselArrowChange() {
    setImages(
      imageUrls.slice(0, 3).map((url, index) => ({
        url,
        width: 0,
        height: 0,
        aspectRatio: 1,
        originalIndex: index,
        loaded: false,
        isLandscape: false
      }))
    );
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
        isLandscape: aspectRatio > 1.2,
        loaded: true
      };
      return newImages;
    });
  };

  const allImagesLoaded = images.every(img => img.loaded);
  // const imagesSortedByWidth = [...images].sort((a, b) => b.width - a.width);

  // once every image has loaded, sort them by width.
  // Here are the width scenarios for four images:
  // All four images are square 1:1
  // All four images are landscape 16:9
  // Two are square, two are landscape
  // one is square, three are landscape
  // one is landscape, three are square
  // In general terms:
  // EVERY is either one or the other (covers 1, 2, 3, and 4 images)
  //    Only one square?
  //      img-1 img-1 blank blank
  //      img-1 img-1 blank blank
  //    Two square?
  //      img-1 img-1 img-2 img-2
  //      img-1 img-1 img-2 img-2
  //    Three square?
  //      img-1 img-2 img-3 blank
  //      img-1 img-2 img-3 blank
  //    All 4 square?
  //      img-1 img-2 img-3 img 4
  //      img-1 img-2 img-3 img-4
  //    Only one landscape?
  //      img-1 img-1 img-1 img-1
  //      img-1 img-1 img-1 img-1
  //    Two landscape?
  //      img-1 img-1 img-2 img-2
  //      img-1 img-1 img-2 img-2
  //    Three landscape?
  //      img-1 img-1 img-2 img-2
  //      img-3 img-3 blank blank
  //    All 4 landscape?
  //      img-1 img-1 img-2 img-2
  //      img-3 img-3 img-4 img-4
  // 50% are one and 50% are the other (covers 2 and 4 images)
  //    2 images:
  //      img-1 img-1 img-2 blank
  //      img-1 img-1 img-2 blank
  //    4 images:
  //      img-1 img-1 img-3 img-4
  //      img-2 img-2 img-3 img-4
  // One is square and the others are landscape (covers 3 and 4 images)
  //    3 images:
  //      img-1 img-1 img-3 blank
  //      img-2 img-2 img-3 blank
  //    4 images:
  //      img-1 img-1 img-2 img-2
  //      img-3 img-3 img-4 blank
  // One is landscape and the others are square
  //    3 images:
  //      img-2 img-3 img-1 img-1
  //      img-2 img-3 blank blank
  //    4 images:
  //      img-2 img-3 img-4 blank
  //      img-2 img-3 img-1 img-1

  const sortedImages = allImagesLoaded
    ? [...images].sort((a, b) => b.aspectRatio - a.aspectRatio)
    : images;

  const gridTemplateAreas = allImagesLoaded
    ? getGridTemplate(sortedImages)
    : "img-1 img-1 img-1 img-1 / img-1 img-1 img-1 img-1";

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(2, 1fr)',
        gridTemplateAreas,
        gap: '0.5rem',
        width: '100%',
        aspectRatio: '16/9',
        backgroundColor: '#1a1a1a',
        padding: '0.5rem',
        borderRadius: '8px'
      }}
    >
      {sortedImages.map((image, index) => {
        const gridAreaName = `img-${index + 1}`;
        return (
          <div
            key={image.originalIndex}
            style={{
              gridArea: gridAreaName,
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '4px',
              backgroundColor: '#2a2a2a'
            }}
          >
            <Image
              src={image.url}
              alt={`Image ${image.originalIndex + 1}`}
              height={1920}
              width={1080}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onLoad={(e) => handleImageLoad(image.originalIndex, e)}
            />
          </div>
        );
      })}
    </div>
  );
}