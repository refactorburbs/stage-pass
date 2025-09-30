"use client"

import { signup } from "@/app/actions/auth.actions";
import { useActionState, useRef, useState } from "react";
import { ALLOWED_UPLOAD_FILE_TYPES, AVATAR_BUBBLE_COLORS } from "@/lib/constants/placeholder.constants";
import CloudUploadIcon from "@/components/SVG/Icons/CloudUploadIcon";
import { uploadFileToPinata } from "@/app/actions/pinata.actions";
import Image from "next/image";

import styles from "./Signup.module.css";

export default function SignUpForm () {
  const [state, action, pending] = useActionState(signup, undefined);
  const [firstInitial, setFirstInitial] = useState("");
  const [lastInitial, setLastInitial] = useState("");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [clientError, setClientError] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadFile = async (file: File): Promise<boolean> => {
    // Check file size (0.5MB = 512KB). Keeping profile pics small,
    // but allowing asset uploads to be bigger (more cost efficient)
    if (file.size > 0.5 * 1024 * 1024) {
      setClientError("File size must be less than 0.5MB (500KB). Please choose a smaller image.");
      return false;
    }
    setUploading(true);
    try {
      const url = await uploadFileToPinata(file);
      setCustomAvatarUrl(url);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
    return true;
  }

  const handleInitialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientError("");

    if (name === "firstName") setFirstInitial(value.charAt(0).toUpperCase());
    if (name === "lastName") setLastInitial(value.charAt(0).toUpperCase());
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setClientError("");
    const success = await uploadFile(file);
    if (!success) e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Prevent default to allow for the "Drop"
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setClientError("");
    const file = Array.from(e.dataTransfer.files)[0];
    await uploadFile(file);
  };

  const handlePickFiles = () => {
    setClientError("");
    fileInputRef.current?.click();
  };

  const handleFormSubmit = async (formData: FormData) => {
    formData.delete("image-upload");
    formData.set("customAvatarUrl", customAvatarUrl);
    // Call the original form action
    await action(formData);
  };

  return (
    <form action={handleFormSubmit} className={styles.auth_form}>
      <input name="firstName" type="text" placeholder="First Name" onChange={handleInitialChange}/>
      {state?.errors?.firstName && <span className="error-msg">{state.errors.firstName}</span>}

      <input name="lastName" type="text" placeholder="Last Name" onChange={handleInitialChange}/>
      {state?.errors?.lastName && <span className="error-msg">{state.errors.lastName}</span>}

      <input name="email" type="email" placeholder="Email"/>
      {state?.errors?.email && <span className="error-msg">{state.errors.email}</span>}

      <input name="password" type="password" placeholder="Password"/>
      {state?.errors?.password && <span className="error-msg">{state.errors.password}</span>}

      <input name="confirmPassword" type="password" placeholder="Confirm Password"/>
      {state?.errors?.confirmPassword && <span className="error-msg">{state.errors.confirmPassword}</span>}

      <input name="inviteCode" type="text" placeholder="Invite Code"/>
      {state?.errors?.inviteCode && <span className="error-msg">{state.errors.inviteCode}</span>}

      {/* Avatar selection */}
      <div className={styles.avatar_selection_group}>
        <span>Select an avatar:</span>
        <div className={styles.avatar_options}>
          {AVATAR_BUBBLE_COLORS.map((color, index) => (
            <label key={color} className={styles.avatar_label}>
              <input
                type="radio"
                name="avatar"
                value={index}
                defaultChecked={index === 0}
                className={styles.radio_input}
              />
              <span
                className={styles.avatar_circle}
                style={{ backgroundColor: color }}
              >

                {`${firstInitial}${lastInitial}`}
              </span>
            </label>
          ))}
          {/* Custom Avatar Drag/Drop Bubble */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={handlePickFiles}
          >
            {customAvatarUrl ? (
              <div className={styles.avatar_circle}>
                <Image
                  src={customAvatarUrl}
                  alt="Custom Avatar"
                  className={styles.avatar_image}
                  width={48}
                  height={48}
                />
              </div>
            ) : (
                <div className={`${styles.avatar_circle} ${styles.avatar_upload_circle}`}>
                  {uploading ? (
                    <div className={styles.uploading_spinner} />
                    ) : (
                      <CloudUploadIcon color="var(--color-primary)"/>
                    )
                  }
                </div>
              )
            }
            <input
              ref={fileInputRef}
              type="file"
              name="image-upload"
              accept={ALLOWED_UPLOAD_FILE_TYPES.join(",")}
              disabled={uploading}
              onChange={handleFileUpload}
              hidden
            />
          </div>
        </div>
        {state?.errors?.avatar && <span className="error-msg">{state.errors.avatar}</span>}
        {clientError && (
          <span className="error-msg">{clientError}</span>
        )}
      </div>

      {state?.message && (
        <span className="error-msg">
          {state.message}
        </span>
      )}

      <button disabled={pending} type="submit" className={styles.signup_button}>
        {pending ? "Submitting..." : "Let's Start!"}
      </button>
    </form>
  );
}