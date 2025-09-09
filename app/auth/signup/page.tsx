"use client"

import { signup } from "@/app/actions/auth.actions";
import { useActionState, useState } from "react";
import { AVATAR_BUBBLE_COLORS } from "@/lib/constants/placeholder.constants";

import styles from "../auth.module.css";

export default function SignUpForm () {
  const [state, action, pending] = useActionState(signup, undefined);
  const [firstInitial, setFirstInitial] = useState("");
  const [lastInitial, setLastInitial] = useState("");

  const handleInitialChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.name === "firstName") {
      setFirstInitial(event.target.value.charAt(0).toUpperCase());
    }
    if (event.target.name === "lastName") {
      setLastInitial(event.target.value.charAt(0).toUpperCase());
    }
  }

  return (
    <form action={action} className={styles.auth_form}>
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
        <label htmlFor="customAvatar">
          Or upload a profile image:
        </label>
        <input
          type="file"
          name="customAvatar"
          accept=".png,.jpg,.jpeg"
        />
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