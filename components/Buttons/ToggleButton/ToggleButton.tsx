"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./ToggleButton.module.css";

type ToggleOption = {
  label: string;
  href: string;
} & (
  // One or the other - either an isActive condition or a pathMatch condition
  | { isActive: boolean; pathMatch?: never }
  | { isActive?: never; pathMatch: string }
);

interface ToggleButtonProps {
  options: ToggleOption[];
}

export default function ToggleButton({ options }: ToggleButtonProps) {
  const pathname = usePathname();

  const isOptionActive = (option: ToggleOption) => {
    return option.isActive || (option.pathMatch ? pathname.includes(option.pathMatch) : pathname === option.href);
  }

  return (
    <div className={styles.toggle_button_container}>
      {options.map((option) => (
        <Link
          href={option.href}
          key={option.label}
          className={`${styles.toggle_option} ${isOptionActive(option) ? styles.active : ""}`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}