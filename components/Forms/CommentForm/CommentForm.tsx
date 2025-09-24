import { createCommentAndNotify } from "@/app/actions/comment.actions";
import { VotePhase } from "@/app/generated/prisma";

import styles from "./CommentForm.module.css";

interface CommentFormProps {
  gameId: number;
  assetId: number;
  userId: number;
  phase: VotePhase;
}

export default async function CommentForm({ gameId, assetId, userId, phase }: CommentFormProps) {
  return (
    <form id="asset-details-comment-form" action={createCommentAndNotify} className={styles.comment_form}>
      <input type="text" name="content" placeholder="Add a comment"/>
      <input type="hidden" name="gameId" value={gameId} />
      <input type="hidden" name="assetId" value={assetId} />
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="phase" value={phase} />
      <button type="submit">
        Comment
      </button>
    </form>
  )
}