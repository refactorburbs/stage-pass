import Image from "next/image";
import VoteButtons from "@/components/Home/AssetFeed/PendingAssetCard/VoteButtons";
import AvatarBubble from "@/components/AvatarBubble/AvatarBubble";
import { timeAgo } from "@/lib/utils";
import { getAssetDetails } from "@/lib/data";
import VoterBubbles from "@/components/Home/AssetFeed/VoterBubbles/VoterBubbles";

import styles from "./AssetPage.module.css";

interface AssetPageProps {
  params: { gameId: string, assetId: string },
  searchParams: {
    isPending?: boolean;
  }
}

export default async function AssetPage ({ params, searchParams }: AssetPageProps) {
  const { gameId, assetId } = await params;
  const { isPending } = await searchParams;

  const assetDetails = await getAssetDetails(Number(assetId));
  const uploaderInfoString = `${assetDetails.uploader.fullName} - ${assetDetails.uploader.teamName}`

  return (
    <div className={styles.asset_page}>
      <div className={styles.asset_content}>
        <h2>{assetDetails.title}</h2>
        <div className={styles.uploader_info}>
          <AvatarBubble user={assetDetails.uploader} size="medium"/>
          <div className={styles.submission_info}>
            {uploaderInfoString} • {timeAgo(assetDetails.createdAt)}
          </div>
        </div>
        <div className={styles.image_preview_container}>
          <Image
            src={assetDetails.imageUrl}
            alt="Asset"
            height={1920}
            width={1080}
            className={styles.preview_image}
          />
        </div>
        {isPending && (
          <VoteButtons
            assetId={assetDetails.id}
            currentPhase={assetDetails.currentPhase}
            gameId={Number(gameId)}
          />
        )}
      </div>
      <div className={styles.vote_info_container}>
        <div className={styles.vote_info_content}>
          {`Approved (${assetDetails.votes.approvePercentage}%): `}
          <VoterBubbles voters={assetDetails.votes.approved} />
        </div>
        <div className={styles.vote_info_content}>
          {`Rejected (${assetDetails.votes.rejectPercentage}%): `}
          <VoterBubbles voters={assetDetails.votes.rejected} />
        </div>
        <div className={styles.vote_info_content}>
          {`Pending Votes: ${assetDetails.votes.pendingCount} `}
        </div>
      </div>
    </div>
  );
}