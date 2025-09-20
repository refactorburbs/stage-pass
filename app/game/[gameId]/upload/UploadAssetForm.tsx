"use client";

import { ALLOWED_UPLOAD_FILE_TYPES } from "@/lib/constants/placeholder.constants";
import { uploadAssetImage } from "@/app/actions/asset.actions";
import { uploadFileToPinataClient } from "@/lib/pinata-client";
import { GetGameAssetCategoriesResponse } from "@/lib/types/dto.types";
import { useActionState, useState } from "react";

import styles from "./upload.module.css";

interface UploadAssetFormProps {
  gameData: GetGameAssetCategoriesResponse
}

export default function UploadAssetForm({ gameData }: UploadAssetFormProps) {
  const [state, action] = useActionState(uploadAssetImage, undefined);
  const [uploading, setUploading] = useState(false);
  const [assetUrl, setAssetUrl] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_UPLOAD_FILE_TYPES.includes(file.type)) {
      setFileError(`File type "${file.type}" is not supported. Allowed: ${ALLOWED_UPLOAD_FILE_TYPES.join(", ")}`);
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const url = await uploadFileToPinataClient(file);
      setAssetUrl(url);
    } catch (error) {
      console.error("Upload failed:", error);
      event.target.value = "";
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (formData: FormData) => {
    formData.delete("screenshot-raw");
    if (assetUrl) {
      formData.set("imageUrl", assetUrl);
    }
    // Call the original form action
    action(formData);
  };

  return (
    <form id="uploadAssetForm" action={handleFormSubmit} className={styles.upload_form}>
      <div className={styles.choose_image_field}>
        <label htmlFor="screenshot-raw">
          Image or Screenshot *
        </label>
        <input
          type="file"
          name="screenshot-raw"
          accept={ALLOWED_UPLOAD_FILE_TYPES.join(",")}
          disabled={uploading}
          onChange={handleFileUpload}
        />
        {fileError && <span className="error-msg">{fileError}</span>}
      </div>

      <input name="title" type="text" placeholder="Asset Title"/>
      {state?.errors?.title && <span className="error-msg">{state.errors.title}</span>}

      <label htmlFor="categoryDropdown">Choose a Category:</label>
      <span style={{ fontSize: "14px" }}>
        {'*Uploads in the "Full Asset" category will automatically go to external review once it is approved internally'}
      </span>
      <select id="categoryDropdown" name="category">
        {gameData.assetCategories.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      {/* Hidden field to submit the associated gameId. UserId is pulled from cookie store */}
      <input type="hidden" name="gameId" value={gameData.game_id} />

      {state?.message && (
        <span className="error-msg">
          {state.message}
        </span>
      )}
    </form>
  );
}