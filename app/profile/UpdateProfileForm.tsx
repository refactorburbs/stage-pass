"use client";

import { useActionState, useState } from "react";
import { updateUserProfile } from "../actions/user.actions";

// So far it's just the profile image. Would have to refactor other elements
// into the form/re-deign the page if other fields should be editable.
export default function UpdateProfileForm() {
  const [state, action, pending] = useActionState(updateUserProfile, undefined);
  const [clientError, setClientError] = useState("");

  // Nextjs has a limit on file upload size, gotta catch it before it hits the server
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setClientError("");

    if (file) {
      // Check file size (0.5MB = 512KB)
      if (file.size > 0.5 * 1024 * 1024) {
        setClientError("File size must be less than 0.5MB (500KB). Please choose a smaller image.");
        event.target.value = ""; // Clear the file input
        return;
      }
    }
  };
  return (
    <form action={action}>
      <input
        type="file"
        name="customAvatar"
        accept=".png,.jpg,.jpeg"
        onChange={handleFileChange}
      />
      {clientError && (
        <span className="error-msg">{clientError}</span>
      )}
      <button type="submit" disabled={pending}>
        {pending ? "Updating...." : "Save Changes"}
      </button>

      {state?.message && (
        <span className="error-msg">
          {state.message}
        </span>
      )}
    </form>
  );
}