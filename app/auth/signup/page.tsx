"use client"

import { signup } from "@/app/actions/auth.actions";
import { useActionState, useState } from "react";
import { AVATAR_BUBBLE_COLORS } from "@/lib/constants/placeholder.constants";
import DynamicImageAvatarBubble from "@/components/AvatarBubble/DynamicImageAvatarBubble";
import { uploadFileToPinata } from "@/app/actions/pinata.actions";

import styles from "../auth.module.css";

export default function SignUpForm () {
  const [state, action, pending] = useActionState(signup, undefined);
  const [firstInitial, setFirstInitial] = useState("");
  const [lastInitial, setLastInitial] = useState("");
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [clientError, setClientError] = useState("");

  const handleInitialChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setClientError("");

    if (name === "firstName") setFirstInitial(value.charAt(0).toUpperCase());
    if (name === "lastName") setLastInitial(value.charAt(0).toUpperCase());
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setClientError("");
    // Check file size (0.5MB = 512KB). Keeping profile pics small, allowing asset uploads to be bigger (more cost efficient)
    if (file.size > 0.5 * 1024 * 1024) {
      setClientError("File size must be less than 0.5MB (500KB). Please choose a smaller image.");
      event.target.value = "";
      return;
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
  };

  const handleFormSubmit = async (formData: FormData) => {
    if (customAvatarUrl) {
      formData.set("customAvatarUrl", customAvatarUrl);
    }
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
                className={styles.avatar_input}
              />
              <span
                className={styles.avatar_circle}
                style={{ backgroundColor: color }}
              >

                {`${firstInitial}${lastInitial}`}
              </span>
            </label>
          ))}
        </div>
        {state?.errors?.avatar && <span className="error-msg">{state.errors.avatar}</span>}

        <label>
          Or upload a profile image:
        </label>
        <DynamicImageAvatarBubble src={customAvatarUrl}/>
        <input
          type="file"
          name="customAvatar"
          accept=".png,.jpg,.jpeg"
          onChange={handleFileUpload}
          disabled={uploading}
        />
        {clientError && (
          <span className="error-msg">{clientError}</span>
        )}
      </div>

      {state?.message && (
        <span className="error-msg">
          {state.message}
        </span>
      )}

      <button disabled={pending} type="submit">
        {pending ? "Submitting..." : "Sign up"}
      </button>
    </form>
  );
}