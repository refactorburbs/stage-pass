import { getGameAssetCategories, getShortAssetDetails, getUser } from "@/lib/data";
import UploadAssetRevisionForm from "./UploadAssetRevisionForm";
import { notFound } from "next/navigation";
import NotAuthorized from "@/components/ErrorPages/NotAuthorized";
import { UserRole } from "@/app/generated/prisma";

import styles from "./UploadRevision.module.css";

interface UploadAssetRevisionPageProps {
  params: { gameId: string, assetId: string };
}

export default async function UploadAssetRevisionPage({ params }: UploadAssetRevisionPageProps) {
  const { gameId, assetId } = await params;
  const gameData = await getGameAssetCategories(Number(gameId));
  const user = await getUser();
  const asset = await getShortAssetDetails(Number(assetId));

  if (!user || user.role === UserRole.VOTER) {
    return <NotAuthorized />
  }

  if (!gameData || !asset) {
    notFound();
  }

  const originalAssetId = asset.original_asset_id ? asset.original_asset_id : Number(assetId);

  return (
    <div className={styles.upload_page}>
      <div className={styles.upload_card}>
        <span>{`Revision number ${asset.revisionNumber + 1} for: "${asset.title}"`}</span>
        <ul className={styles.info_list}>
          <li>
            {`Creating a revision will take the old asset out of the current voting phase.`}
          </li>
          <li>
            {`Previous revisions can still be viewed, but not interacted with.`}
          </li>
        </ul>
        <UploadAssetRevisionForm gameData={gameData} originalAssetId={originalAssetId} title={asset.title} category={asset.category}/>
      </div>
    </div>
  );
}