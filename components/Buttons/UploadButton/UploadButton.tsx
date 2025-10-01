"use client";

import Link from "next/link";
import { RefObject } from "react";

type LinkOption = {
  text: string;
  href: string;
};

type FormOption = {
  text: string;
  id?: string;
  formId: string;
  ref?: RefObject<HTMLButtonElement | null>;
};

interface UploadButtonProps {
  options: LinkOption | FormOption;
}

export default function UploadButton({ options }: UploadButtonProps) {
  // const { gameId, assetId } = useParams();
  // const currentRoute = usePathname();
  // const isOnUploadPage = currentRoute === `/game/${gameId}/upload`;
  // const isOnRevisionPage = currentRoute === `/game/${gameId}/asset/${assetId}/upload`;
  // const isOnAssetPage = currentRoute.includes(`/game/${gameId}/asset/`) && assetId;

  const isFormButton = "formId" in options;

  if (isFormButton) {
    return (
      <button
        id={options.id}
        className="upload-button"
        type="submit"
        form={options.formId}
        ref={options.ref}
      >
        {options.text}
      </button>
    );
  }

  return (
    <Link
      href={options.href}
      className="upload-button"
    >
      {options.text}
    </Link>
  );

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
