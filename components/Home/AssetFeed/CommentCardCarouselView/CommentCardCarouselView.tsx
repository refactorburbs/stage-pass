import { UserAssetComment } from "@/lib/types/assets.types";
import CardCarousel from "../CardCarousel/CardCarousel";

import styles from "./CommentCardCarouselView.module.css";

interface AssetCardListViewProps {
  title: string;
  items: Array<UserAssetComment>
}

export default function CommentCardCarouselView({ title, items }: AssetCardListViewProps) {
  return (
    <div className={styles.column}>
      <div className={styles.column_header}>
        {title} ({items.length})
      </div>
      {items.length > 0 ? (
        <CardCarousel items={items} type="comment" />
      ) : (
        <div className={styles.no_items}>
          No items in this category
        </div>
      )}
    </div>
  );
}