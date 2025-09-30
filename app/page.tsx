import { getUser, getTeam } from "@/lib/data/index";
import GameProjectOption from "@/components/GameProjectSelection/GameProjectOption";
import NotAuthorized from "@/components/ErrorPages/NotAuthorized";
import { notFound } from "next/navigation";
import Navbar from "@/components/Home/Navbar/Navbar";

import styles from "./GameProjectSelectionPage.module.css";

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
      <Navbar user={user} />

      <div className={`content-wrapper ${styles.game_selection_wrapper}`}>
        <div className={styles.welcome_header}>
          <span>{`Hi, ${user.firstName}! Select a`}</span>
          <span>{`game project to work on.`}</span>
        </div>
        <div className={styles.game_selection_options}>
          {teamData.games.map((game) => (
            <GameProjectOption
              game={game}
              user={user}
              teamName={teamData.name}
              key={game.id}
            />
          ))}
        </div>

      </div>
    </div>
  );
}
