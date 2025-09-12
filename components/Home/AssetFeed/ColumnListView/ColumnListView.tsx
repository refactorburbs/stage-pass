import ColumnListViewItem from "../ColumnListViewItem/ColumnListViewItem";
import styles from "./ColumnListView.module.css";

interface ColumnListViewProps {
  title: string;
  items: any;
}
export default function ColumnListView({ title, items }: ColumnListViewProps) {
  return (
    <div className={styles.column}>
      <div className={styles.column_header}>
        {title} ({items.length})
      </div>
      <div className={styles.column_content}>
        {items.length > 0 ? (
          items.map(item => (
            <ColumnListViewItem key={item.id} item={item} />
          ))
        ) : (
          <div style={{
            textAlign: 'center',
            color: '#94a3b8',
            marginTop: '20px',
            fontStyle: 'italic'
          }}>
            No items in this category
          </div>
        )}
      </div>
    </div>
  );
}