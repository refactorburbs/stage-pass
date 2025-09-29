"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";

export default function UploadButton() {
  const { gameId, assetId } = useParams();
  const currentRoute = usePathname();
  const isOnUploadPage = currentRoute === `/game/${gameId}/upload`;
  const isOnRevisionPage = currentRoute === `/game/${gameId}/asset/${assetId}/upload`;
  const isOnAssetPage = currentRoute.includes(`/game/${gameId}/asset/`) && assetId;

  if (isOnUploadPage) {
    // Using native browser linking by form id so that
    // layout button can be outside the upload form component.
    return (
      <button
        id="upload-asset-button"
        className="upload-button"
        type="submit"
        form="uploadAssetForm"
      >
        Upload Asset
      </button>
    );
  }

  if (isOnRevisionPage) {
    return (
      <button
        id="upload-asset-revision-button"
        className="upload-button"
        type="submit"
        form="uploadAssetRevisionForm"
      >
        Add Revision
      </button>
    );
  }

  if (isOnAssetPage) {
    return (
      <Link
        href={`/game/${gameId}/asset/${assetId}/upload`}
        className="upload-button"
      >
        Add Revision
      </Link>
    );
  }

  return (
    <Link
      href={`/game/${gameId}/upload`}
      className="upload-button"
    >
      Upload Asset
    </Link>
  );
}
