import Image from "next/image";

import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.logo_wrapper}>
        <Image
          src="/logo/refactor-black.webp"
          alt="Refactor Logo"
          width={1725}
          height={353}
          className="object-fit"
        />
      </div>
    </footer>
  );
}