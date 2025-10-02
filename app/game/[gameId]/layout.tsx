import NotAuthorized from "@/components/ErrorPages/NotAuthorized";
import Navbar from "@/components/Layout/Navbar/Navbar";
import Footer from "@/components/Layout/Footer/Footer";
import { getGame, getUser } from "@/lib/data/index";
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

  const gameInfo = {
    gameName: gameData.name,
    numTeams: gameData.teams.length,
    teamString: gameData.teams.join(" x "),
    gameId: Number(gameId)
  }

  return (
    <div className={`${styles.game_page_layout} page-layout`}>
      <Navbar gameInfo={gameInfo} user={user} />
      {children}
      <Footer />
    </div>
  );
}