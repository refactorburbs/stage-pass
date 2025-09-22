import { AssetItemForVoterFeed } from "@/lib/types/assets.types";
import AvatarBubble from "@/components/AvatarBubble/AvatarBubble";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import VoteButtons from "./VoteButtons";
import { timeAgo } from "@/lib/utils";

import styles from "./PendingAssetCard.module.css";

interface PendingAssetCardProps {
  asset: AssetItemForVoterFeed;
  onVote: (assetId: number) => void;
}

// on click of an asset that's pending in a voter feed, send some search params for ?voteStatus=PENDING
// Then on the asset details page, can render the vote buttons there conditionally on search params received
export default function PendingAssetCard ({ asset, onVote }: PendingAssetCardProps) {
  const { gameId } = useParams();
  // Safety check - sometimes the asset is removed quicker than the useState can update the index
  // That throws an error, so this is a fallback image
  if (!asset || !asset.id) {
    return (
      <div className={styles.asset_card_container}>
        <div className={styles.image_preview_container}>
          <Image
            src="/processing-vote.webp"
            alt="Asset"
            height={1080}
            width={1080}
            className={styles.preview_image}
          />
        </div>
      </div>
    );
  }
  return (
    <Link href={`/game/${gameId}/asset/${asset.id}?isPending=true`}>
      <div className={styles.asset_card_container}>
        <div className={styles.image_preview_container}>
          <Image
            src={asset.imageUrls[0]}
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
              Uploaded {timeAgo(asset.createdAt)}
            </span>
          </div>
        </div>
        <VoteButtons
          assetId={asset.id}
          currentPhase={asset.currentPhase}
          gameId={Number(gameId)}
          onVote={onVote}
        />
      </div>
    </Link>
  );
}