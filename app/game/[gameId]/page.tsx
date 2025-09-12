import NotAuthorized from "@/components/ErrorPages/NotAuthorized";
import AssetFeed from "@/components/Home/AssetFeed/AssetFeed";
import FeedToggle from "@/components/Home/AssetFeed/FeedToggle/FeedToggle";
import { getGame, getUser, getUserPermissions } from "@/lib/data/index";
import { notFound } from "next/navigation";
import { FeedType } from "@/lib/types/feed.types";

import styles from "./GamePage.module.css";

interface GamePageProps {
  params: {
    gameId: string;
  };
  searchParams: {
    feed?: FeedType;
  };
}

export default async function GamePage({ params, searchParams }: GamePageProps) {
  const { gameId } = await params;
  const { feed } = await searchParams;
  const feedType = feed || "user";

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
    <div className={styles.game_page_container}>
      <div className={styles.feed_toggle_container}>
        <FeedToggle gameId={Number(gameId)} currentFeed={feedType}/>
      </div>
      {feedType === "game" && (
        <span className={styles.feed_note}>
          Voting phase has ended for assets in color. Assets in white are trending.
        </span>
      )}
      <AssetFeed
        user={user}
        gameId={Number(gameId)}
        hasFinalSay={rules.hasFinalSay}
        feedType={feedType}
      />
    </div>
  );
}