import { ReactNode } from "react";

import styles from "./BlueprintGrid.module.css";

interface BlueprintGridProps {
  children: ReactNode;
  className?: string;
}

export default function BlueprintGrid({ children, className = "" }: BlueprintGridProps) {
  return (
    <div className={`${styles.blueprint_grid} ${className}`}>
      {children}
    </div>
  );
}