import { AssetFeedItem } from "@/lib/types/assets.types";
import CardCarousel from "@/components/Carousels/CardCarousel/CardCarousel";

import styles from "./AssetCardCarouselView.module.css";

interface AssetCardListViewProps {
  title: string;
  items: Array<AssetFeedItem>
}

export default function AssetCardCarouselView({ title, items }: AssetCardListViewProps) {
  return (
    <div className={styles.column}>
      <div className={styles.column_header}>
        {title} ({items.length})
      </div>
      <CardCarousel items={items} type="asset" />
    </div>
  );
}