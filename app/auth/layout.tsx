import ToggleButton from "@/components/Buttons/ToggleButton/ToggleButton";

import styles from "./auth.module.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const toggleButtonOptions = [
    { label: "Login", href: "/auth/login", pathMatch: "login" },
    { label: "Sign Up", href: "/auth/signup", pathMatch: "signup" },
  ];

  return (
    <div className={styles.auth_page}>
      <div className={styles.auth_card}>

        <div className={styles.auth_card_header}>
          <h2>StagePass</h2>
          <span>Part of the pipeline for game art asset approval with Refactor Games</span>
        </div>

        {/* <AuthToggle /> */}
        <ToggleButton options={toggleButtonOptions}/>

        {children}
      </div>
    </div>
  );
}