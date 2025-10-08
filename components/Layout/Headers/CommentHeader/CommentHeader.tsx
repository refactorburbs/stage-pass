import { timeAgo } from "@/lib/utils";
import { GetUserDataResponse } from "@/lib/types/dto.types";
import AvatarBubble from "@/components/Avatar/AvatarBubble/AvatarBubble";

import styles from "./CommentHeader.module.css";

interface CommentHeaderProps {
  commenter: GetUserDataResponse;
  timestamp: Date;
}

export default function CommentHeader({
  commenter,
  timestamp,
}: CommentHeaderProps) {
  return (
    <div className={styles.header}>
      <AvatarBubble size="medium" user={commenter} />
      <div className={styles.title_container}>
        <span className={styles.title}>
          <span>{commenter.fullName}</span>
          <span className={styles.timestamp}>
            {` ● ${timeAgo(timestamp)}`}
          </span>
        </span>
        <span className={styles.subtitle}>
          {commenter.teamName}
        </span>
      </div>
    </div>
  );
}