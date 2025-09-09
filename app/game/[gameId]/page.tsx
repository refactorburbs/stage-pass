import NotAuthorized from "@/components/ErrorPages/NotAuthorized";
import Navbar from "@/components/Home/Navbar/Navbar";
import UploadButton from "@/components/Home/UploadButton/UploadButton";
import { UserRole } from "@/lib/constants/placeholder.constants";
import { getGame } from "@/lib/DAL_DAO/game.data";
import { getUser, getUserPermissions } from "@/lib/DAL_DAO/user.data";
import { notFound } from "next/navigation";

interface GamePageProps {
  params: {
    gameId: string;
  };
}

export default async function GamePage({ params }: GamePageProps) {
  const gameId = parseInt(params.gameId);
  const user = await getUser();
  const gameData = await getGame(gameId);

  if (!user) {
    return <NotAuthorized />
  }

  if (!gameData) {
    return notFound();
  }

  const rules = await getUserPermissions(user, gameData);

  return (
    <div>
      <Navbar
        gameName={gameData.name}
        teamString={gameData.teams.join(" x ")}
        user={user}
      />

      {rules.hasFinalSay && <span>HAS FINAL SAY</span>}

      {rules.canUpload && (
        <UploadButton text="Upload Asset"/>
      )}
    </div>
  );
}