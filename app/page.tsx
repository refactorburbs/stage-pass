import { getUser, getTeam } from "@/lib/data/index";
import GameProjectOption from "@/components/GameProjectOption/GameProjectOption";
import BlueprintGrid from "@/components/Layout/BlueprintGrid/BlueprintGrid";
import Navbar from "@/components/Layout/Navbar/Navbar";
import Footer from "@/components/Layout/Footer/Footer";
import NotAuthorized from "@/components/ErrorPages/NotAuthorized";
import { notFound } from "next/navigation";

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
    <BlueprintGrid>
      <div className="page-layout">
        <Navbar user={user} />
        <div className={`content-wrapper page-content ${styles.game_selection_content}`}>
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
        <Footer />
      </div>
    </BlueprintGrid>
  );
}
