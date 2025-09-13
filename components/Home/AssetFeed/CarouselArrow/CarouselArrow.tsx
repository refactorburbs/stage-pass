"use client";

import Image from "next/image";

import styles from "./CarouselArrow.module.css";

interface CarouselArrowProps {
  direction: "left" | "right";
  onClick: () => void;
  isActive: boolean;
}

export default function CarouselArrow({ direction, onClick, isActive }: CarouselArrowProps) {
  if (!isActive) {
    return (
      <div className={styles.arrow_inactive}>
        <div className={styles.arrow_inactive_box}/>
      </div>
    );
  }

  return (
    <button onClick={onClick} className={styles.button}>
      {direction === "left" ? (
          <div className={`${styles.carousel_arrow} ${styles.left_arrow}`}>
            <Image
              src="/left-caret.png"
              alt="scroll left"
              width={50}
              height={50}
            />
          </div>
        ) : (
          <div className={`${styles.carousel_arrow} ${styles.right_arrow}`}>
            <Image
              src="/right-caret.png"
              alt="scroll right"
              width={50}
              height={50}
            />
          </div>
        )
      }
    </button>
  );
}