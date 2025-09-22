import VoteButtons from "@/components/Home/AssetFeed/PendingAssetCard/VoteButtons";
import AvatarBubble from "@/components/AvatarBubble/AvatarBubble";
import { timeAgo } from "@/lib/utils";
import { getAssetDetails, getCommentsForAsset, getUser, getUserPermissions } from "@/lib/data";
import VoterBubbles from "@/components/Home/AssetFeed/VoterBubbles/VoterBubbles";
import NotAuthorized from "@/components/ErrorPages/NotAuthorized";
import CommentForm from "@/components/Forms/CommentForm/CommentForm";
import AssetComment from "@/components/AssetComment/AssetComment";
import { VotePhase } from "@/app/generated/prisma";
import ImageGrid from "@/components/ImageGrid/ImageGrid";

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
  const user = await getUser();

  if (!user) {
    return <NotAuthorized />
  }

  const rules = await getUserPermissions(user, Number(gameId));
  const targetPhase = rules.hasFinalSay ? VotePhase.PHASE2 : VotePhase.PHASE1;
  const assetComments = await getCommentsForAsset(Number(assetId), targetPhase);

  const assetDetails = await getAssetDetails(Number(assetId));
  console.log('asset details are ', assetDetails)
  const uploaderInfoString = `${assetDetails.uploader.fullName} - ${assetDetails.uploader.teamName}`;

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
        <div className={styles.image_grid_container}>
          <ImageGrid imageUrls={assetDetails.imageUrls} />
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
            <span>{`Approved (${assetDetails.votes.approvePercentage}%): `}</span>
            <VoterBubbles voters={assetDetails.votes.approved} />
          </div>
          <div className={styles.vote_info_content}>
            <span>{`Rejected (${assetDetails.votes.rejectPercentage}%): `}</span>
            <VoterBubbles voters={assetDetails.votes.rejected} />
          </div>
          <div className={styles.vote_info_content}>
            <span>{`Pending Votes: ${assetDetails.votes.pendingCount} `}</span>
          </div>
        </div>
        <div className={styles.asset_comments}>
          <h3>Comments</h3>
          {assetComments.map((comment) => <AssetComment comment={comment} key={comment.id}/>)}
        </div>
      </div>
      <CommentForm
        gameId={Number(gameId)}
        assetId={Number(assetId)}
        userId={user.id}
        phase={targetPhase}
      />
    </div>
  );
}