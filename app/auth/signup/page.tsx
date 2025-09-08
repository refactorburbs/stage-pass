"use client"

import { signup } from "@/app/actions/auth.actions";
import { useActionState, useState } from "react";

import styles from "../auth.module.css";
import { AVATAR_BUBBLE_COLORS } from "@/lib/constants/placeholder.constants";

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
      {state?.errors?.firstName && <span>{state.errors.firstName}</span>}

      <input name="lastName" type="text" placeholder="Last Name" onChange={handleInitialChange}/>
      {state?.errors?.lastName && <span>{state.errors.lastName}</span>}

      <input name="email" type="email" placeholder="Email"/>
      {state?.errors?.email && <span>{state.errors.email}</span>}

      <input name="password" type="password" placeholder="Password"/>
      {state?.errors?.password && <span>{state.errors.password}</span>}

      <input name="confirmPassword" type="password" placeholder="Confirm Password"/>
      {state?.errors?.confirmPassword && <span>{state.errors.confirmPassword}</span>}

      <input name="inviteCode" type="text" placeholder="Invite Code"/>
      {state?.errors?.inviteCode && <span>{state.errors.inviteCode}</span>}

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
        {state?.errors?.avatar && <span>{state.errors.avatar}</span>}
      </div>

      <button disabled={pending} type="submit">
        {pending ? "Submitting..." : "Sign up"}
      </button>
    </form>
  );
}