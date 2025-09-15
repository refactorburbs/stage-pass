import { AssetItemForVoterFeed } from "@/lib/types/assets.types";
import AvatarBubble from "@/components/AvatarBubble/AvatarBubble";
import ReactTimeAgo from "react-time-ago";
import Image from "next/image";
import { useParams } from "next/navigation";
import VoteButtons from "./VoteButtons";

import styles from "./PendingAssetCard.module.css";

interface PendingAssetCardProps {
  asset: AssetItemForVoterFeed;
  onVote: (assetId: number) => void;
}

export default function PendingAssetCard ({ asset, onVote }: PendingAssetCardProps) {
  const { gameId } = useParams();
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
      <VoteButtons
        asset={asset}
        gameId={Number(gameId)}
        onVote={onVote}
      />
    </div>
  );
}