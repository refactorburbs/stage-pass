import { AssetVoteTrendData } from "@/lib/types/assets.types";
import styles from "./AssetDetailsVoteTrends.module.css";
import VoterBubbles from "@/components/Avatar/VoterBubbles/VoterBubbles";

interface AssetDetailsVoteTrendsProps {
  assetVotes: AssetVoteTrendData;
}

export default function AssetDetailsVoteCarousel({ assetVotes }: AssetDetailsVoteTrendsProps) {
  return (
    <div className={styles.vote_info_container}>
      <div className={styles.vote_info_content}>
        <span>{`Approved (${assetVotes.approvePercentage}%):`}</span>
        <VoterBubbles voters={assetVotes.approved} />
      </div>
      <div className={styles.vote_info_content}>
        <span>{`Rejected (${assetVotes.rejectPercentage}%):`}</span>
        <VoterBubbles voters={assetVotes.rejected} />
      </div>
      <div className={styles.vote_info_content}>
        <span>{`Pending Votes: ${assetVotes.pendingCount}`}</span>
      </div>
    </div>
  );
}