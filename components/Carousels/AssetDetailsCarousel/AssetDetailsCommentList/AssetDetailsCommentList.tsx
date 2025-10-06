"use client";

import { UserAssetComment } from "@/lib/types/comments.types";
import AssetDetailsComment from "../AssetDetailsComment/AssetDetailsComment";

import styles from "./AssetDetailsCommentList.module.css";

interface AssetDetailsCommentListProps {
  assetCommentHistoryArray: Array<UserAssetComment[]>;
  currentIndex: number;
}

export default function AssetDetailsCommentList({ assetCommentHistoryArray, currentIndex }: AssetDetailsCommentListProps) {
  const comments = assetCommentHistoryArray[currentIndex];
  return (
    <div className={styles.asset_comments}>
      <h3>Comments</h3>
      {comments.map((comment) => <AssetDetailsComment comment={comment} key={comment.id}/>)}
    </div>
  );
}