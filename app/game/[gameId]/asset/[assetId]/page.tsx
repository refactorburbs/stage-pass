import { getAssetDetails, getCommentsForAsset, getUser, getUserPermissions } from "@/lib/data";
import NotAuthorized from "@/components/ErrorPages/NotAuthorized";
import CommentForm from "@/components/Forms/CommentForm/CommentForm";
import { VotePhase } from "@/app/generated/prisma";
import AssetDetailsCarousel from "@/components/Carousels/AssetDetailsCarousel/AssetDetailsCarousel";
import { buildAssetHistoryArray } from "@/lib/utils/asset.utils";

import styles from "./AssetPage.module.css";

interface AssetPageProps {
  params: { gameId: string, assetId: string },
  searchParams: {
    isPendingVote?: boolean;
  }
}

export default async function AssetPage ({ params, searchParams }: AssetPageProps) {
  const { gameId, assetId } = await params;
  const { isPendingVote } = await searchParams;
  const user = await getUser();

  if (!user) {
    return <NotAuthorized />
  }

  const rules = await getUserPermissions(user, Number(gameId));
  const targetPhase = rules.hasFinalSay ? VotePhase.PHASE2 : VotePhase.PHASE1;

  const assetDetails = await getAssetDetails(Number(assetId));
  const { originalAsset, revisions, ...currentAsset } = assetDetails;
  const assetsInOrderOfRevision = buildAssetHistoryArray(currentAsset, revisions, originalAsset);

  return (
    <div className={styles.asset_page}>
      <AssetDetailsCarousel
        assetHistoryArray={assetsInOrderOfRevision}
        isPendingVote={isPendingVote}
        gameId={Number(gameId)}
        targetPhase={targetPhase}
        getAssetComments={getCommentsForAsset}
      />
      <CommentForm
        gameId={Number(gameId)}
        assetId={Number(assetId)}
        userId={user.id}
        phase={targetPhase}
      />
    </div>
  );
}