import { ReactNode } from "react";

import styles from "./TooltipHover.module.css";

interface TooltipHoverProps {
  text: string;
  children: ReactNode;
}

export default function TooltipHover ({ text, children }: TooltipHoverProps) {
  return (
    <span className={styles.tooltip_container}>
      {children}
      <span className={styles.tooltip}>
        {text}
      </span>
    </span>
  );
}