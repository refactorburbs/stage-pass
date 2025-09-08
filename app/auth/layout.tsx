import AuthToggle from "./(components)/AuthToggle";
import styles from "./auth.module.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.auth_page}>
      <div className={styles.auth_card}>

        <div className={styles.auth_card_header}>
          <h2>StagePass</h2>
          <span>Part of the pipeline for game art asset approval with Refactor Games</span>
        </div>

        <AuthToggle />

        {children}
      </div>
    </div>
  );
}