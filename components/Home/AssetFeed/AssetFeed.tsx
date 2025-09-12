import { UserRole } from "@/app/generated/prisma";
import { getAssetFeedForArtist, getAssetFeedForGame, getAssetFeedForVoter } from "@/lib/data";
import { GetUserDataResponse } from "@/lib/types/dto.types";
import ColumnListView from "./ColumnListView/ColumnListView";

import styles from "./AssetFeed.module.css";
import { FeedType } from "@/lib/types/feed.types";
import { notFound } from "next/navigation";

// date will be the createdAt converted to timeago
// const sampleData = {
//   approved: [
//     { id: 1, title: "Soccer Player Head #1", status: "PHASE1_APPROVED", category: "Heads", date: "2 hours ago", uploader_id: 12, imageUrl: "https://coffee-decent-gecko-899.mypinata.cloud/ipfs/bafybeide3f2fodxqe6npsikasm6yj4lnj2scnlutaq3ujdmr26a363a" },
//     { id: 2, title: "Cleats Design V2", status: "PHASE1_APPROVED", category: "Cleats", date: "1 day ago", uploader_id: 12, imageUrl: "https://coffee-decent-gecko-899.mypinata.cloud/ipfs/bafybeide3f2fodxqe6npsikasm6yj4lnj2scnlutaq3ujdmr26a363uwga" },
//     { id: 3, title: "Messi", status: "PHASE2_APPROVED", category: "Full Asset", date: "2 days ago", uploader_id: 12, imageUrl: "https://coffee-decent-gecko-899.mypinata.cloud/ipfs/bafybeide3f2fodxqe6npsikasm6yj4lnj2scnlutaq3ujdmr26a363uwga" }
//   ],
//   pending: [
//     { id: 4, title: "Stadium Background", status: "PENDING", cateogry: "Full Asset", date: "Just now", uploader_id: 12, imageUrl: "https://coffee-decent-gecko-899.mypinata.cloud/ipfs/bafybeide3f2fodxqe6npsikasm6yj4lnj2scnlutaq3ujdmr26a363uwga" },
//     { id: 5, title: "Goalkeeper Gloves", status: "PENDING", category:"Clothing", date: "30 min ago", uploader_id: 12, imageUrl: "https://coffee-decent-gecko-899.mypinata.cloud/ipfs/bafybeide3f2fodxqe6npsikasm6yj4lnj2scnlutaq3ujdmr26a363uwga" },
//     { id: 6, title: "Ball Physics Model", status: "PENDING", date: "1 hour ago", category: "Clothing", uploader_id: 12, imageUrl: "https://coffee-decent-gecko-899.mypinata.cloud/ipfs/bafybeide3f2fodxqe6npsikasm6yj4lnj2scnlutaq3ujdmr26a363uwga" },
//     { id: 7, title: "Crowd Animation", status: "PENDING", date: "3 hours ago", category: "Full Asset", uploader_id: 12, imageUrl: "https://coffee-decent-gecko-899.mypinata.cloud/ipfs/bafybeide3f2fodxqe6npsikasm6yj4lnj2scnlutaq3ujdmr26a363uwga" }
//   ],
//   rejected: [
//     { id: 8, title: "Old Uniform Design", status: "PHASE1_REJECTED", date: "1 day ago", imageUrl: "https://coffee-decent-gecko-899.mypinata.cloud/ipfs/bafybeide3f2fodxqe6npsikasm6yj4lnj2scnlutaq3ujdmr26a363uwga" },
//     { id: 9, title: "Logo Placement", status: "PHASE2_REJECTED", date: "3 days ago", imageUrl: "https://coffee-decent-gecko-899.mypinata.cloud/ipfs/bafybeide3f2fodxqe6npsikasm6yj4lnj2scnlutaq3ujdmr26a363uwga" }
//   ]
// };

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
      <div>Special user pending field</div>
      <ColumnListView
        title="Approved Assets"
        items={assetFeed.approved}
      />
    </div>
  );
}