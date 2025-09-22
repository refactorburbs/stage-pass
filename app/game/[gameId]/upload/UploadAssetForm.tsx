"use client";

import { ALLOWED_UPLOAD_FILE_TYPES } from "@/lib/constants/placeholder.constants";
import { uploadAssetImage } from "@/app/actions/asset.actions";
import { uploadFileToPinataClient } from "@/lib/pinata-client";
import { GetGameAssetCategoriesResponse } from "@/lib/types/dto.types";
import { useActionState, useEffect, useRef, useState } from "react";

import styles from "./upload.module.css";
import CloudUploadIcon from "@/components/Icons/CloudUploadIcon";

interface UploadAssetFormProps {
  gameData: GetGameAssetCategoriesResponse
}

export default function UploadAssetForm({ gameData }: UploadAssetFormProps) {
  const [state, action, isPending] = useActionState(uploadAssetImage, undefined);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [assetUrls, setAssetUrls] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(function getElementAfterMount() {
    uploadButtonRef.current = document.getElementById("upload-asset-button") as HTMLButtonElement;
  }, [])

  const uploadImagesToPinata = async (files: File[]) => {
    if (!uploadButtonRef.current) return;
    const urls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!ALLOWED_UPLOAD_FILE_TYPES.includes(file.type)) {
        setFileError(`File type "${file.type}" is not supported. Allowed: ${ALLOWED_UPLOAD_FILE_TYPES.join(", ")}`);
        return false;
      }

      uploadButtonRef.current.disabled = true;
      uploadButtonRef.current.classList.add("disabled");
      setUploading(true);
      try {
        const url = await uploadFileToPinataClient(file);
        urls.push(url);
      } catch (error) {
        console.error("Upload failed:", error);
        return false;
      } finally {
        uploadButtonRef.current.disabled = false;
        uploadButtonRef.current.classList.remove("disabled");
      }
    }
    setUploading(false);
    setAssetUrls(urls);
    return true;
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Prevent default to allow for the "Drop"
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setFileError("");
    const newFiles = Array.from(e.dataTransfer.files);
    if (files.length + newFiles.length > 4) {
      setFileError(`Up to 4 images can be uploaded for a single asset.`);
      return;
    }
    setFiles((prev) => [...prev, ...newFiles]);
    const isSuccess = await uploadImagesToPinata(newFiles);
    if (!isSuccess) {
      // Clear the invalid files
      setFiles((prev) =>
        prev.filter((file) => !newFiles.includes(file))
      );
    }
  };

  const handlePickFiles = () => {
    setFileError("");
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files|| files.length === 0) return;
    const newFiles = Array.from(files);
    setFiles((prev) => [...prev, ...newFiles]);

    const isSuccess = await uploadImagesToPinata(newFiles);
    if (!isSuccess) {
      setFiles((prev) =>
        prev.filter((file) => !newFiles.includes(file))
      );
    }
  };

  const handleFormSubmit = async (formData: FormData) => {
    formData.delete("image-files");
    console.log("submitting! assetURLs are ", assetUrls)
    assetUrls.forEach((url) => {
      formData.append("image-urls", url);
    })
    // Call the original form action
    action(formData);
  };

  return (
    <div>
      <form id="uploadAssetForm" action={handleFormSubmit} className={styles.upload_form}>
        <div className={styles.column}>
          <span className={styles.input_label}>
            Image Upload
          </span>
          <div
            className={styles.file_upload_box}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handlePickFiles}
          >
            <div className={styles.upload_icon}>
              <CloudUploadIcon />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              name="image-files"
              accept={ALLOWED_UPLOAD_FILE_TYPES.join(",")}
              disabled={uploading}
              onChange={handleFileUpload}
              hidden
            />
          </div>
          {fileError && <span className="error-msg">{fileError}</span>}
        </div>
        <div className={styles.column}>
          <input name="title" type="text" placeholder="Asset Title"/>
          {state?.errors?.title && <span className="error-msg">{state.errors.title}</span>}

          <label className={styles.input_label} htmlFor="categoryDropdown">
            Choose a Category:
          </label>
          <span style={{ fontSize: "14px" }}>
            {'*Uploads in the "Full Asset" category will automatically go to external review once it is approved internally'}
          </span>
          <select id="categoryDropdown" name="category">
            {gameData.assetCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <span className={styles.input_label}>
            Images (up to 4):
          </span>
          <ul className="list-disc pl-6">
            {files.map((file, idx) => (
              <li key={idx} className="text-sm text-gray-700">
                {file.name} ({Math.round(file.size / 1024)} KB)
              </li>
            ))}
          </ul>
          {state?.errors?.imageUrls && <span className="error-msg">{state.errors.imageUrls}</span>}

          {/* Hidden field to submit the associated gameId. UserId is pulled from cookie store */}
          <input type="hidden" name="gameId" value={gameData.game_id} />

          {state?.message && (
            <span className="error-msg">
              {state.message}
            </span>
          )}
        </div>
      </form>
      <span>{isPending ? "Creating Asset..." : uploading ? "Uploading image(s)..." : ""}</span>
    </div>
  );
}