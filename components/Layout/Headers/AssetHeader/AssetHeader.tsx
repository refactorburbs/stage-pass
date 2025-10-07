import { ReactNode } from "react";
import { timeAgo } from "@/lib/utils";

import styles from "./AssetHeader.module.css";

interface AssetHeaderProps {
  title: string;
  subtitle: string;
  timestamp: Date;
  phaseInfoElement?: ReactNode;
}

export default function AssetHeader({
  title,
  subtitle,
  timestamp,
  phaseInfoElement
}: AssetHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.title_container}>
        <span className={styles.title}>
          {title}
        </span>
        {phaseInfoElement && phaseInfoElement}
      </div>
      <div className={styles.subtitle}>
        {subtitle} • {timeAgo(timestamp)}
      </div>
    </div>
  );
}