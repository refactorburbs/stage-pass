import { AssetFeedItem } from "@/lib/types/assets.types";
import { PendingCommentData } from "@/lib/types/comments.types";
import ColumnListViewItem from "../ColumnListViewItem/ColumnListViewItem";

import styles from "./ColumnListView.module.css";

interface ColumnListViewProps {
  title: string;
  items: Array<AssetFeedItem>;
  notifications?: Array<PendingCommentData>
}

export default function ColumnListView({ title, items, notifications }: ColumnListViewProps) {
  return (
    <div className={styles.column}>
      <div className={styles.column_header}>
        {title} ({items.length})
      </div>
      <div className={styles.column_content}>
        {items.length > 0 ? (
          items.map(item => (
            <ColumnListViewItem key={item.id} item={item} notifications={notifications}/>
          ))
        ) : (
          <div className={styles.no_items}>
            No items in this category
          </div>
        )}
      </div>
    </div>
  );
}