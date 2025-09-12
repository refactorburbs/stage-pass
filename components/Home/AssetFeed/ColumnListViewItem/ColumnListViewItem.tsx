"use client";

import Image from "next/image";
import { useState } from "react";

import styles from "./ColumnListViewItem.module.css";

export default function ColumnListViewItem({ item }) {
  const fallbackSrc = "/no-image-available.webp";
  // If the imageUrl exists but is a broken link (can happen with improper database deletions), then have fallback.
  const [imageSrc, setImageSrc] = useState(item.imageUrl || fallbackSrc);
  return (
    <div className={styles.list_item_container}>
      <div className={styles.image_preview_container}>
        <Image
          src={imageSrc}
          alt="Asset"
          height={1080}
          width={1080}
          className={styles.preview_image}
          onError={() => setImageSrc(fallbackSrc)}
        />
      </div>
      <div className={styles.list_item_info}>
        <div className={styles.header}>
          <div style={{ fontWeight: '500' }}>
            {item.title}
          </div>
          <span className={styles.phase_info}>{item.status}</span>
        </div>
        <div style={{ fontSize: '14px', color: '#64748b' }}>
          {`Submitted by ${item.uploader_id} • ${item.date}`}
        </div>
        <div style={{ fontSize: '14px', color: '#64748b' }}>
          {`Rejected by you • Just now`}
        </div>
      </div>
    </div>
  );
}