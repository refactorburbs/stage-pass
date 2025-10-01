import Link from "next/link";
import { getGame, getUserPermissions } from "@/lib/data/index";
import { notFound } from "next/navigation";
import { GetUserDataResponse } from "@/lib/types/dto.types";
import Image from "next/image";

import styles from "./GameProjectOption.module.css";

interface GameProjectOptionProps {
  game: {
    id: number;
    name: string;
  };
  user: GetUserDataResponse;
  teamName: string;
}

export default async function GameProjectOption({ game, user, teamName }: GameProjectOptionProps) {
  const gameData = await getGame(game.id);
  if (!gameData) {
    notFound();
  }

  const rules = await getUserPermissions(user, game.id);
  const hasFinalSay = rules.hasFinalSay;

  const teamNameString = gameData.teams.reduce((accumulator, current, index) => {
    if (index === 0) return current;
    if (index === gameData.teams.length - 1) return `${accumulator}, and ${current}`;
    return `${accumulator}, ${current}`;
  }, "");

  return (
    <Link href={`/game/${game.id}`} className={styles.game_option_card}>
      <div className={styles.banner_image_container}>
        <Image
          src={gameData.banner}
          alt="Game Banner"
          width={1920}
          height={1080}
          className={`object-fit ${styles.banner_image}`}
        />
      </div>

      <div className={styles.callouts}>
        <span className={`callout ${styles.role_callout}`}>
          {user.role.toUpperCase()}
        </span>
        {hasFinalSay && <span className={styles.final_say_callout}>You have final say!</span>}
      </div>

      <div className={styles.game_info_container}>
        <span className={styles.current_game}>{game.name}</span>
        <span className={styles.current_team}>
          {teamName}
        </span>
      </div>
      <span className={styles.collaboration_description}>
        {`There are currently `}
        <span className={styles.collaboration_number}>
          {gameData.totalCollaborators}
        </span>
        {` collaborators working on this project from ${teamNameString}.`}
      </span>

      <div className={styles.fake_button}>
        Enter Project
      </div>
    </Link>
  );
}