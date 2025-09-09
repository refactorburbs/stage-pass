import { getUser, getTeam } from "@/lib/data/index";
import GameProjectOption from "@/components/GameProjectSelection/GameProjectOption";
import NotAuthorized from "@/components/ErrorPages/NotAuthorized";
import { notFound } from "next/navigation";

import styles from "./page.module.css";

export default async function GameProjectSelectionPage() {
  const user = await getUser();

  if (!user) {
    return <NotAuthorized />
  }

  const teamData = await getTeam(user.team_id);

  if (!teamData) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <h1>StagePass</h1>
      <span>Select Game Project:</span>
      <div className="content-wrapper">
        {teamData.games.map((game) => (
          <GameProjectOption game={game} key={game.id}/>
        ))}
      </div>
    </div>
  );
}
