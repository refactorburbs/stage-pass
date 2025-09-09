import NotAuthorized from "@/components/ErrorPages/NotAuthorized";
import { getGame } from "@/lib/DAL_DAO/game.data";
import { getUser, getUserPermissions } from "@/lib/DAL_DAO/user.data";
import { notFound } from "next/navigation";

interface GamePageProps {
  params: {
    gameId: string;
  };
}

export default async function GamePage({ params }: GamePageProps) {
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
    <div>

      {rules.hasFinalSay && <span>HAS FINAL SAY</span>}
    </div>
  );
}