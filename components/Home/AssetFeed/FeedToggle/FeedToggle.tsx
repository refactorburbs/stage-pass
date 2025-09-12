"use client";

import { FeedType } from "@/lib/types/feed.types";
import Link from "next/link";

import styles from "./FeedToggle.module.css";

interface FeedToggleProps {
  gameId: number;
  currentFeed: FeedType;
}

export default function FeedToggle({ gameId, currentFeed }: FeedToggleProps) {
  return (
    <div className={styles.feed_toggle_button_container}>
      <Link
        href={`/game/${gameId}`}
        className={`${currentFeed === "user" && styles.active} ${styles.feed_option}`}
      >
        Your Feed
      </Link>
      <Link
        href={`/game/${gameId}?feed=game`}
        className={`${currentFeed === "game" && styles.active} ${styles.feed_option}`}
      >
        Game Feed
      </Link>
    </div>
  );
}