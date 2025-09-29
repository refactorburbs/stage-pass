import { ReactNode } from "react";
import BlueprintGrid from "@/components/Layout/BlueprintGrid/BlueprintGrid";
import ToggleButton from "@/components/Buttons/ToggleButton/ToggleButton";
import TopAndBottomWave from "@/components/SVG/TopAndBottomWave";
import WaveBorder from "@/components/SVG/WaveBorder";
import Image from "next/image";

import styles from "./Auth.module.css";

export default function AuthLayout({ children }: Readonly<{children: ReactNode }>) {
  const toggleButtonOptions = [
    { label: "Login", href: "/auth/login", pathMatch: "login" },
    { label: "Sign Up", href: "/auth/signup", pathMatch: "signup" },
  ];

  return (
    <BlueprintGrid>
      <div className={styles.auth_page}>
        <TopAndBottomWave idPrefix="auth-"/>

        <div className={styles.auth_card}>
          <div className={`${styles.auth_card_section} ${styles.form_section}`}>
            <div className={styles.auth_form_wrapper}>
              <div className={styles.auth_card_header}>
                <h1>StagePass</h1>
                <Image
                  src="/logo/refactor-black.webp"
                  alt="Refactor Logo"
                  width={1725}
                  height={353}
                  className={styles.refactor_logo}
                />
              </div>
              <ToggleButton options={toggleButtonOptions}/>
              {children}
            </div>
          </div>

          <div className={`${styles.auth_card_section} ${styles.image_section}`}>
            <div className={styles.image_container}>
              <div className={styles.logo_wrapper}>
                <Image
                  src="/logo/stagepass-logo-thumbs.webp"
                  alt="StagePass Logo"
                  width={432}
                  height={866}
                  className={styles.logo_image}
                />
              </div>
              <div className={styles.image_text_overlay}>
                <span>An approval tool as part</span>
                <span>of the Refactor Games</span>
                <span>game art pipeline</span>
              </div>
            </div>
            {/* Border SVG positioned relative to the image section */}
            <WaveBorder/>
          </div>
        </div>
      </div>
    </BlueprintGrid>
  );
}