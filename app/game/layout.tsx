import styles from "./layout.module.css";

export default function GamePageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.game_layout_page}>
      {children}
    </div>
  );
}