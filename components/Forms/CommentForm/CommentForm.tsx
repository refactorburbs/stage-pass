import { createCommentAndNotify } from "@/app/actions/comment.actions";

import styles from "./CommentForm.module.css";

interface CommentFormProps {
  gameId: number;
  assetId: number;
  userId: number;
}

export default async function CommentForm({ gameId, assetId, userId }: CommentFormProps) {
  return (
    <form action={createCommentAndNotify} className={styles.comment_form}>
      <input type="text" name="content" placeholder="Add a comment"/>
      <input type="hidden" name="gameId" value={gameId} />
      <input type="hidden" name="assetId" value={assetId} />
      <input type="hidden" name="userId" value={userId} />
      <button type="submit">
        Comment
      </button>
    </form>
  )
}