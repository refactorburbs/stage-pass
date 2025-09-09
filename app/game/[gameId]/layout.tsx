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

  const rules = await getUserPermissions(user, gameData);

  return (
    <div className={styles.game_layout_page}>
      <Navbar
        gameName={gameData.name}
        teamString={gameData.teams.join(" x ")}
        user={user}
      />
      {children}
      {rules.canUpload && (<UploadButton/>)}
    </div>
  );
}

// create an edit profile page? Maybe just to display this person's info and edit picture
// enable pinata file conversion and test with profile picture
// get file upload working for creating a new asset in db.