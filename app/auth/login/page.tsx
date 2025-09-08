"use client"

import { login } from "@/app/actions/auth.actions";
import { useActionState } from "react";

import styles from "../auth.module.css";

export default function SignUpForm () {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className={styles.auth_form}>

      <input name="email" type="email" placeholder="Email"/>
      {state?.errors?.email && <span>{state.errors.email}</span>}

      <input name="password" type="password" placeholder="Password"/>
      {state?.errors?.password && <span>{state.errors.password}</span>}

      <button disabled={pending} type="submit">
        {pending ? "Loggin in..." : "Login"}
      </button>
    </form>
  );
}