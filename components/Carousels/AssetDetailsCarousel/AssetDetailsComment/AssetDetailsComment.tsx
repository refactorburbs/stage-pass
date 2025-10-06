import AvatarBubble from "@/components/Avatar/AvatarBubble/AvatarBubble";
import { UserAssetComment } from "@/lib/types/comments.types";
import { timeAgo } from "@/lib/utils";

import styles from "./AssetDetailsComment.module.css";

interface AssetDetailsCommentProps {
  comment: UserAssetComment;
}

export default function AssetDetailsComment({ comment }: AssetDetailsCommentProps) {
  const commenterInfo = `${comment.user.fullName} - ${comment.user.teamName} ● ${timeAgo(comment.createdAt)}`;
  return (
    <div className={styles.comment_container}>
      <div className={styles.commenter}>
        <AvatarBubble size="medium" user={comment.user}/>
        <span>{commenterInfo}</span>
      </div>
      <p>{comment.content}</p>
    </div>
  );
}