import { getGameAssetCategories } from "@/lib/data";
import UploadAssetForm from "./UploadAssetForm";
import { notFound } from "next/navigation";

import styles from "./upload.module.css";

interface UploadPageProps {
  params: { gameId: string };
}


export default async function UploadPage({ params }: UploadPageProps) {
  const gameId = Number(params.gameId);
  const gameData = await getGameAssetCategories(gameId);

  if (!gameData) {
    notFound();
  }

  return (
    <div className={styles.upload_page}>
      <div className={styles.upload_card}>

        <p>{`Asset uploads go through 3 stages of review:
        The first round is internal, and is for approving individual parts such as heads or tattoos.
        The second round is also internal, but is for approving complete, full assets such as an entire football player character.
        The third round is external, and happens once a full asset is approved internally. IP owners will go through their own
        voting approval phase. Finally, when the asset is approved externally, it is ready to be put in the game!
        `}</p>

        <UploadAssetForm gameData={gameData}/>
      </div>
    </div>
  );
}