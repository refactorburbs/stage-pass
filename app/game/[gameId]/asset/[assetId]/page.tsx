import { getAssetDetails, getCommentsForAsset, getUser, getUserPermissions } from "@/lib/data";
import NotAuthorized from "@/components/ErrorPages/NotAuthorized";
import CommentForm from "@/components/Forms/CommentForm/CommentForm";
import { VotePhase } from "@/app/generated/prisma";
import AssetDetailsCarousel from "@/components/Carousels/AssetDetailsCarousel/AssetDetailsCarousel";
import { buildAssetHistoryArray, canAssetBeRevised } from "@/lib/utils/asset.utils";
import UploadButton from "@/components/Buttons/UploadButton/UploadButton";

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
  const assetCommentHistoryArray = await Promise.all(
    assetsInOrderOfRevision.map((asset) => (
      getCommentsForAsset(asset.id, targetPhase)
    ))
  );

  const latestAsset = assetsInOrderOfRevision[0];
  const assetCanBeRevised = canAssetBeRevised(latestAsset.currentPhase, latestAsset.status);
  const uploadButtonOptions = {
    text: "Add Revision",
    href: `/game/${gameId}/asset/${assetId}/upload`
  }

  return (
    <div className={styles.asset_page}>
      <AssetDetailsCarousel
        assetHistoryArray={assetsInOrderOfRevision}
        assetCommentHistoryArray={assetCommentHistoryArray}
        isPendingVote={isPendingVote}
        gameId={Number(gameId)}
        targetPhase={targetPhase}
      />
      <CommentForm
        gameId={Number(gameId)}
        assetId={Number(assetId)}
        userId={user.id}
        phase={targetPhase}
      />
      {(rules.canUpload && assetCanBeRevised) &&
        <UploadButton options={uploadButtonOptions}/>
      }
    </div>
  );
}