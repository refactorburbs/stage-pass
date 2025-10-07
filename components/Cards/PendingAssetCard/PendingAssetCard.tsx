import AssetHeader from "@/components/Layout/Headers/AssetHeader/AssetHeader";
import VoteButtons from "@/components/Buttons/VoteButtons/VoteButtons";
import { AssetItemForVoterFeed } from "@/lib/types/assets.types";
import ImageGrid from "@/components/Layout/ImageGrid/ImageGrid";
import { useParams } from "next/navigation";
import Link from "next/link";

import styles from "./PendingAssetCard.module.css";

interface PendingAssetCardProps {
  asset: AssetItemForVoterFeed;
  onVote: (assetId: number) => void;
}

// on click of an asset that's pending in a voter feed, send some search params for ?voteStatus=PENDING
// Then on the asset details page, can render the vote buttons there conditionally on search params received
export default function PendingAssetCard ({ asset, onVote }: PendingAssetCardProps) {
  const { gameId } = useParams();
  return (
    <Link
      href={`/game/${gameId}/asset/${asset.id}?isPendingVote=true`}
      className={styles.asset_card_container}
    >
      <div className={styles.image_preview_container}>
        <ImageGrid imageUrls={asset.imageUrls} allowsEnlarge={false}/>
      </div>
      <AssetHeader
        title={asset.title}
        subtitle={`Uploaded by ${asset.uploader.firstName}`}
        timestamp={asset.createdAt!}
      />
      <VoteButtons
        assetId={asset.id}
        currentPhase={asset.currentPhase}
        gameId={Number(gameId)}
        onVote={onVote}
      />
    </Link>
  );
}