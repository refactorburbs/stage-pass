"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./AuthToggle.module.css";

export default function AuthToggle() {
  const pathname = usePathname();
  const isLogin = pathname.includes("login");

  return (
    <div className={styles.toggle_wrapper}>
      <Link
        href="/auth/login"
        className={`${styles.toggle_option} ${isLogin ? styles.active : ""}`}
      >
        Login
      </Link>
      <Link
        href="/auth/signup"
        className={`${styles.toggle_option} ${!isLogin ? styles.active : ""}`}
      >
        Sign Up
      </Link>
    </div>
  );
}