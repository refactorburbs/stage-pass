"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import styles from "./TooltipHover.module.css";

interface TooltipHoverProps {
  text: string;
  children: ReactNode;
}

// Making this a client rendered portal to render separately from the rest of the layout
// Otherwise you wind up with overflow issues of parent container, when really we just
// want this to display above and over the entire web page. Easier to make responsive, too.
export default function TooltipHover ({ text, children }: TooltipHoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isHovered && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 12, // 0.75rem
        left: rect.left
      });
    }
  }, [isHovered]);

  return (
    <>
      <span
        ref={containerRef}
        className={styles.tooltip_container}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </span>
      {isHovered && createPortal(
        <span
          className={styles.tooltip}
          style={{
            position: "fixed",
            top: `${position.top}px`,
            left: `${position.left}px`,
            opacity: 1
          }}
        >
          {text}
        </span>,
        document.body
      )}
    </>
  );
}