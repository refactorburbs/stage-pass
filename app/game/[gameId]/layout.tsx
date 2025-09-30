import NotAuthorized from "@/components/ErrorPages/NotAuthorized";
import Navbar from "@/components/Home/Navbar/Navbar";
import UploadButton from "@/components/Home/UploadButton/UploadButton";
import { getGame, getUser, getUserPermissions } from "@/lib/data/index";
import { notFound } from "next/navigation";

import styles from "./layout.module.css";

export default async function GamePageLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: { gameId: string }
}>) {
  const { gameId } = await params;
  const user = await getUser();
  const gameData = await getGame(Number(gameId));

  if (!user) {
    return <NotAuthorized />
  }

  if (!gameData) {
    return notFound();
  }

  // const rules = await getUserPermissions(user, Number(gameId));
  const gameInfo = {
    gameName: gameData.name,
    numTeams: gameData.teams.length,
    teamString: gameData.teams.join(" x "),
    gameId: Number(gameId)
  }

  return (
    <div className={styles.game_layout_page}>
      <Navbar
        gameInfo={gameInfo}
        user={user}
      />
      {children}
      {/* {rules.canUpload && (<UploadButton/>)} */}
    </div>
  );
}