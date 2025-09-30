"use client";

import { login } from "@/app/actions/auth.actions";
import { useActionState } from "react";

import styles from "./Login.module.css";

export default function SignUpForm () {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <div className={styles.login_column}>
      <h2>Welcome back</h2>
      <form action={action} className={styles.auth_form}>

        <input name="email" type="email" placeholder="Email"/>
        {state?.errors?.email && <span className="error-msg">{state.errors.email}</span>}

        <input name="password" type="password" placeholder="Password"/>
        {state?.errors?.password && <span className="error-msg">{state.errors.password}</span>}

        {state?.message && (
          <span className="error-msg">
            {state.message}
          </span>
        )}

        <button disabled={pending} type="submit" className={styles.login_button}>
          {pending ? "Logging in..." : "Let's go!"}
        </button>
      </form>
    </div>
  );
}