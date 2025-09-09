"use client";

import { usePathname } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";

import styles from "./UploadButton.module.css";

export default function UploadButton() {
  const { gameId, assetId } = useParams();
  const currentRoute = usePathname();
  const isOnUploadPage = currentRoute === `/game/${gameId}/upload`;
  const isOnRevisionPage = currentRoute === `/game/${gameId}/asset/${assetId}/upload`;
  const isOnAssetPage = currentRoute.includes(`/game/${gameId}/asset/`) && assetId;

  const handleUploadAsset = () => {
    console.log('upload to pinata!')
  }

  const handleUploadRevision = () => {
    console.log('add a revision to pinata and db!')
  }

  if (isOnUploadPage) {
    return (
      <button
        className={styles.upload_button}
        onClick={handleUploadAsset}
      >
        Upload Asset
      </button>
    );
  }

  if (isOnRevisionPage) {
    return (
      <button
        className={styles.upload_button}
        onClick={handleUploadRevision}
      >
        Add Revision
      </button>
    );
  }

  if (isOnAssetPage) {
    return (
      <Link
        href={`/game/${gameId}/asset/${assetId}/upload`}
        className={styles.upload_button}
      >
        Add Revision
      </Link>
    );
  }

  return (
    <Link
      href={`/game/${gameId}/upload`}
      className={styles.upload_button}
    >
      Upload Asset
    </Link>
  );
}