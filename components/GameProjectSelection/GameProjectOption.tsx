import Link from "next/link";
import { getGame } from "@/lib/data/index";

import styles from "./GameProjectOption.module.css";

interface GameProjectOptionProps {
  game: {
    id: number;
    name: string;
  }
}

export default async function GameProjectOption({ game }: GameProjectOptionProps) {
  const gameData = await getGame(game.id);
  const teamNameString = gameData?.teams.join(" x ") || "No teams associated";

  return (
    <Link href={`/game/${game.id}`} className={styles.game_option_link}>
      <div className={styles.game_option_container}>
        <h2>{game.name}</h2>
        <span>{teamNameString}</span>
      </div>
    </Link>
  );
}