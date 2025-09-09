"use client";

import { useActionState } from "react";
import { uploadAssetImage } from "@/app/actions/asset.actions";
import { useParams } from "next/navigation";

import styles from "./upload.module.css";

export default function UploadPage() {
  const [state, action, pending] = useActionState(uploadAssetImage, undefined);
  const { gameId } = useParams();

  return (
    <div className={styles.upload_page}>
      <div className={styles.upload_card}>

        <p>{`Asset uploads go through 3 stages of review:
        The first round is internal, and is for approving individual parts such as heads or tattoos.
        The second round is also internal, but is for approving complete, full assets such as an entire football player character.
        The third round is external, and happens once a full asset is approved internally. IP owners will go through their own
        voting approval phase. Finally, when the asset is approved externally, it is ready to be put in the game!
        `}</p>

        <form id="uploadAssetForm" action={action} className={styles.upload_form}>
          <div className={styles.choose_image_field}>
            <label htmlFor="screenshot">
              Image or Screenshot *
            </label>
            <input
              type="file"
              name="screenshot"
              accept=".png,.jpg,.jpeg,.gif,.svg"
              required
            />
            {state?.errors?.screenshot && <span className="error-msg">{state.errors.screenshot}</span>}
          </div>

          <input name="title" type="text" placeholder="Asset Title"/>
          {state?.errors?.title && <span className="error-msg">{state.errors.title}</span>}

          <label htmlFor="categoryDropdown">Choose a Category:</label>
          <select id="categoryDropdown" name="category">
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </select>
          {/* Hidden field to submit the associated gameId. UserId is pulled from cookie store */}
          <input type="hidden" name="gameId" value={gameId} />

          {state?.message && (
            <span className="error-msg">
              {state.message}
            </span>
          )}

        </form>
      </div>
      <span>{pending ? "Uploading Asset..." : ""}</span>
    </div>
  );
}