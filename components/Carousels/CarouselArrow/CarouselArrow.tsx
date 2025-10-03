"use client";

import CaretIcon from "@/components/SVG/Icons/CaretIcon";

import styles from "./CarouselArrow.module.css";

interface CarouselArrowProps {
  direction: "left" | "right";
  onClick: () => void;
  isActive: boolean;
}

export default function CarouselArrow({ direction, onClick, isActive }: CarouselArrowProps) {
  return (
    <button
      onClick={onClick}
      className={`${styles.carousel_arrow_button} ${isActive ? styles.active : styles.inactive}`}
    >
      <CaretIcon sizePx={16} color="var(--color-secondary)" direction={direction}/>
    </button>
  );
}