import { PendingCommentData } from "@/lib/types/comments.types";
import CardCarousel from "@/components/Carousels/CardCarousel/CardCarousel";

import styles from "./CommentCardCarouselView.module.css";

interface AssetCardListViewProps {
  title: string;
  items: Array<PendingCommentData>
}

export default function CommentCardCarouselView({ title, items }: AssetCardListViewProps) {
  return (
    <div className={styles.column}>
      <div className={styles.column_header}>
        {title} ({items.length})
      </div>
      <CardCarousel items={items} type="comment" />
    </div>
  );
}