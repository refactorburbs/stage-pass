import { UserRole } from "@/app/generated/prisma";
import { getAssetFeedForArtist, getAssetFeedForGame, getAssetFeedForVoter, getUserPendingComments } from "@/lib/data";
import { GetUserDataResponse } from "@/lib/types/dto.types";
import ColumnListView from "./ColumnListView/ColumnListView";
import AssetCardCarouselView from "./AssetCardCarouselView/AssetCardCarouselView";
import CommentCardCarouselView from "./CommentCardCarouselView/CommentCardCarouselView";
import { FeedType } from "@/lib/types/feed.types";
import { notFound } from "next/navigation";

import styles from "./AssetFeed.module.css";

interface AssetFeedProps {
  user: GetUserDataResponse;
  gameId: number;
  hasFinalSay: boolean;
  feedType: FeedType;
}

async function getFeedData (
  feedType: FeedType,
  userId: number,
  gameId: number,
  userRole: UserRole,
  hasFinalSay: boolean
) {
  if (feedType === "user") {
    return userRole === UserRole.ARTIST
      ? await getAssetFeedForArtist(userId, gameId)
      : await getAssetFeedForVoter(userId, gameId, hasFinalSay);
  } else {
    return await getAssetFeedForGame(gameId, hasFinalSay)
  }
}

export default async function AssetFeed({ user, gameId, hasFinalSay, feedType }: AssetFeedProps) {
  const assetFeed = await getFeedData(feedType, user.id, gameId, user.role, hasFinalSay);
  const pendingComments = await getUserPendingComments(user.id);

  if (!assetFeed) {
    notFound();
  }

  // Artists see 3 columns no matter what - both user and game feed
  // These are staic, not much interaction other than clicking on more details.
  if (user.role === UserRole.ARTIST || feedType === "game") {
    return (
      <div className={styles.feed_container}>
        <ColumnListView
          title="Rejected Assets"
          items={assetFeed.rejected}
        />
        <ColumnListView
          title="Pending Review"
          items={assetFeed.pending}
          notifications={pendingComments}
        />
        <ColumnListView
          title="Approved Assets"
          items={assetFeed.approved}
        />
      </div>
    );
  }

  return (
    <div className={styles.feed_container}>
      <ColumnListView
        title="Rejected Assets"
        items={assetFeed.rejected}
      />
      <div className={styles.pending_column}>
        <AssetCardCarouselView title="Pending Assets" items={assetFeed.pending}/>
        <CommentCardCarouselView title="Pending Comments" items={pendingComments}/>
      </div>
      <ColumnListView
        title="Approved Assets"
        items={assetFeed.approved}
      />
    </div>
  );
}