"use client";

import { useActionState } from "react";
import { updateUserProfile } from "../actions/user.actions";

// So far it's just the profile image. Would have to refactor other elements
// into the form/re-deign the page if other fields should be editable.
export default function UpdateProfileForm() {
  const [state, action, pending] = useActionState(updateUserProfile, undefined);
  return (
    <form action={action}>
      <input
        type="file"
        name="customAvatar"
        accept=".png,.jpg,.jpeg"
      />
      <button type="submit" disabled={pending}>
        {pending ? "Updating...." : "Submit Changes"}
      </button>

      {state?.message && (
        <span className="error-msg">
          {state.message}
        </span>
      )}
    </form>
  );
}