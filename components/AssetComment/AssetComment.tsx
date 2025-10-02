import { UserAssetComment } from "@/lib/types/comments.types";
import AvatarBubble from "../Avatar/AvatarBubble/AvatarBubble";
import { timeAgo } from "@/lib/utils";

import styles from "./AssetComment.module.css";

interface AssetCommentProps {
  comment: UserAssetComment;
}

export default function AssetComment({ comment }: AssetCommentProps) {
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