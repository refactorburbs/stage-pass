import { getGameAssetCategories, getUser } from "@/lib/data";
import UploadAssetForm from "./UploadAssetForm";
import { notFound } from "next/navigation";
import NotAuthorized from "@/components/ErrorPages/NotAuthorized";
import { UserRole } from "@/app/generated/prisma";
import UploadButton from "@/components/Buttons/UploadButton/UploadButton";

import styles from "./upload.module.css";

interface UploadPageProps {
  params: { gameId: string };
}


export default async function UploadPage({ params }: UploadPageProps) {
  const { gameId } = await params;
  const gameData = await getGameAssetCategories(Number(gameId));
  const user = await getUser();

  if (!user || user.role === UserRole.VOTER) {
    return <NotAuthorized />
  }
  if (!gameData) {
    notFound();
  }

  const uploadButtonOptions = {
    text: "Upload Asset",
    id: "upload-asset-button",
    formId: "uploadAssetForm"
  }

  return (
    <div className={styles.upload_page}>
      <div className={styles.upload_card}>
        <span>Asset uploads go through 2 stages of review:</span>
        <ol className={styles.info_list}>
          <li>
            {`The first round is internal, and is for approving individual parts of an asset (such as heads or tattoos),
            or Full Assets. Only assets in the "Full Asset" category can move onto Phase 2.`}
          </li>
          <li>
            {`The second round is external, and happens once a Full Asset is approved internally.
            Game/IP owners will go through their own voting approval phase in Phase 2.`}
          </li>
        </ol>
        <span>Once an asset voting phase is finished, a Discord notification will be sent in the #art channel</span>

        <UploadAssetForm gameData={gameData}/>
      </div>
      <UploadButton options={uploadButtonOptions}/>
    </div>
  );
}