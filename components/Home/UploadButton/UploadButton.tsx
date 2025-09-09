"use client";

import { usePathname, useParams } from "next/navigation";
import Link from "next/link";

export default function UploadButton() {
  const { gameId, assetId } = useParams();
  const currentRoute = usePathname();
  const isOnUploadPage = currentRoute === `/game/${gameId}/upload`;
  const isOnRevisionPage = currentRoute === `/game/${gameId}/asset/${assetId}/upload`;
  const isOnAssetPage = currentRoute.includes(`/game/${gameId}/asset/`) && assetId;

  const handleUploadRevision = () => {
    console.log('add a revision to pinata and db!')
  }

  if (isOnUploadPage) {
    // In Nextjs, you can't just reference form buttons outside the form with the native browser/react form="form's Id"
    // Nor can you add a hidden button in the form and simulate a "click" event in here :/ Thus we will remove the layout
    // button and render another one inside the form with equivalent styling (using a global css variable instead of module)
    return ( <></> );
  }

  if (isOnRevisionPage) {
    return (
      <button
        className="upload-button"
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