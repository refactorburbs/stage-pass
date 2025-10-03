import { getAssetFeedData } from "@/lib/utils";
import { UserRole } from "@/app/generated/prisma";
import { getUserPendingComments } from "@/lib/data";
import { GetUserDataResponse } from "@/lib/types/dto.types";
import ColumnListView from "../ColumnListView/ColumnListView";
import AssetCardCarouselView from "@/components/Carousels/AssetCardCarouselView/AssetCardCarouselView";
import CommentCardCarouselView from "@/components/Carousels/CommentCardCarouselView/CommentCardCarouselView";
import { FeedType } from "@/lib/types/feed.types";

import styles from "./AssetFeed.module.css";

interface AssetFeedProps {
  user: GetUserDataResponse;
  gameId: number;
  hasFinalSay: boolean;
  feedType: FeedType;
}

export default async function AssetFeed({ user, gameId, hasFinalSay, feedType }: AssetFeedProps) {
  const assetFeed = await getAssetFeedData(feedType, user.id, gameId, user.role, hasFinalSay);
  const pendingComments = await getUserPendingComments(user.id);

  if (!assetFeed) {
    // Note - can't use notFound() from next/navigation in components other than layout, page, or server actions.
    // if you do, it will corrupt the React flight payload and the component tree doesn't get built correctly.
    return null;
  }

  // Artists see 3 columns no matter what - both user and game feed
  // These are staic, not much interaction other than clicking on more details.
  if (user.role === UserRole.ARTIST || feedType === FeedType.GAME) {
    return (
      <div className={styles.feed_container}>
        <ColumnListView
          title="Rejected"
          items={assetFeed.rejected}
          style={{ gridArea: "col-rejected" }}
        />
        <ColumnListView
          title="Pending Review"
          items={assetFeed.pending}
          notifications={pendingComments}
          style={{ gridArea: "col-pending" }}
        />
        <ColumnListView
          title="Approved"
          items={assetFeed.approved}
          style={{ gridArea: "col-approved" }}
        />
      </div>
    );
  }

  return (
    <div className={styles.feed_container}>
      <ColumnListView
        title="Rejected"
        items={assetFeed.rejected}
        style={{ gridArea: "col-rejected" }}
      />
      <div className={styles.voter_pending_column} style={{ gridArea: "col-pending" }}>
        <AssetCardCarouselView title="Pending" items={assetFeed.pending}/>
        <div>Comment Cards</div>
        {/* <AssetCardCarouselView title="Pending" items={assetFeed.pending}/>
        <CommentCardCarouselView title="Pending Comments" items={pendingComments}/> */}
      </div>
      <ColumnListView
        title="Approved"
        items={assetFeed.approved}
        style={{ gridArea: "col-approved" }}
      />
    </div>
  );
}