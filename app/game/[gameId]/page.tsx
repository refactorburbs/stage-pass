import NotAuthorized from "@/components/ErrorPages/NotAuthorized";
import AssetFeed from "@/components/Feed/AssetFeed/AssetFeed";
import BlueprintGrid from "@/components/Layout/BlueprintGrid/BlueprintGrid";
import UploadButton from "@/components/Buttons/UploadButton/UploadButton";
import ToggleButton from "@/components/Buttons/ToggleButton/ToggleButton";
import { getUser, getUserPermissions } from "@/lib/data/index";
import { FeedType } from "@/lib/types/feed.types";
import { UserRole } from "@/app/generated/prisma";

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
  const feedType = feed || FeedType.USER;
  const toggleButtonOptions = [
    { label: "Your Feed", href: `/game/${gameId}?feed=user`, isActive: feedType === FeedType.USER },
    { label: "Game Feed", href: `/game/${gameId}?feed=game`, isActive: feedType === FeedType.GAME },
  ];
  const uploadButtonOptions = {
    text: "Upload Asset",
    href: `/game/${gameId}/upload`
  };

  const user = await getUser();
  if (!user) {
    return <NotAuthorized />
  }
  const rules = await getUserPermissions(user, Number(gameId));

  const getFeedNote = () => {
    if (feedType === FeedType.GAME) {
      return "Voting phase has ended for assets in color. Assets in white are trending.";
    }
    if (user.role === UserRole.ARTIST) {
      return "Your assets under review. Assets in color have reached a final decision."
    }
    return "Your assets to review. Asset votes can be changed until the voting phase ends (when all votes are in).";
  }

  return (
    <BlueprintGrid>
      <div className={`content-wrapper ${styles.game_page_container}`}>
        <div className={styles.feed_toggle_section}>
          <ToggleButton options={toggleButtonOptions}/>
          <span className={styles.feed_note}>
            {getFeedNote()}
          </span>
        </div>
        <AssetFeed
          user={user}
          gameId={Number(gameId)}
          hasFinalSay={rules.hasFinalSay}
          feedType={feedType}
        />
      </div>
      {rules.canUpload &&
        <UploadButton options={uploadButtonOptions}/>
      }
    </BlueprintGrid>
  );
}