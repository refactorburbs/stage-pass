"use client";

import { AssetItemForVoterFeed } from "@/lib/types/assets.types";
import Image from "next/image";

import styles from "./PendingAssetCard.module.css";
import AvatarBubble from "@/components/AvatarBubble/AvatarBubble";
import ReactTimeAgo from "react-time-ago";

interface PendingAssetCardProps {
  asset: AssetItemForVoterFeed
}

export default function PendingAssetCard ({ asset }: PendingAssetCardProps) {
  return (
    <div className={styles.asset_card_container}>
      <div className={styles.image_preview_container}>
        <Image
          src={asset.imageUrl}
          alt="Asset"
          height={1080}
          width={1080}
          className={styles.preview_image}
        />
      </div>
      <div className={styles.uploader_info}>
        <AvatarBubble size="medium" user={asset.uploader}/>
        <div className={styles.asset_header}>
          <span>{asset.title}</span>
          <span style={{ fontSize: "12px" }}>
            Uploaded <ReactTimeAgo date={asset.createdAt} locale="en-US" />
          </span>
        </div>
      </div>
      <div className={styles.vote_buttons}>
        <span>No</span>
        <span>Yes</span>
      </div>
    </div>
  );
}