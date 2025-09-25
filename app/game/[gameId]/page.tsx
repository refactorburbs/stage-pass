import NotAuthorized from "@/components/ErrorPages/NotAuthorized";
import AssetFeed from "@/components/Home/AssetFeed/AssetFeed";
import FeedToggle from "@/components/Home/AssetFeed/FeedToggle/FeedToggle";
import { getUser, getUserPermissions } from "@/lib/data/index";
import { FeedType } from "@/lib/types/feed.types";

import styles from "./GamePage.module.css";
import ToggleButton from "@/components/Buttons/ToggleButton/ToggleButton";

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

  if (!user) {
    return <NotAuthorized />
  }

  const rules = await getUserPermissions(user, Number(gameId));
  const toggleButtonOptions = [
    { label: "Your Feed", href: `/game/${gameId}`, isActive: feedType === "user" },
    { label: "Game Feed", href: `/game/${gameId}?feed=game`, isActive: feedType === "game" },
  ];

  return (
    <div className={styles.game_page_container}>
      <div className={styles.feed_toggle_container}>
        <FeedToggle gameId={Number(gameId)} currentFeed={feedType}/>
        {/* <ToggleButton options={toggleButtonOptions}/> */}
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