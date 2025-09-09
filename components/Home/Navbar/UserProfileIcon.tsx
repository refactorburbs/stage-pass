"use client";

import { useState } from "react";
import Link from "next/link";
import AvatarBubble from "@/components/AvatarBubble/AvatarBubble";
import { GetUserDataResponse } from "@/lib/types/dto.types";
import { logout } from "@/app/actions/auth.actions";

import styles from "./Navbar.module.css";

interface UserProfileProps {
  user: GetUserDataResponse;
}

export default function UserProfileIcon({ user }: UserProfileProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <button
      className={styles.profile_button}
      onClick={() => setIsOpen(!isOpen)}
      onBlur={(e) => {
        // Close if focus moves outside the dropdown
        if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) {
          setIsOpen(false);
        }
      }}
    >
      {/* User Profile Avatar Bubble */}
      <div className={styles.avatar_icon}>
        <AvatarBubble size="large" user={user} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={styles.dropdown}>
          <Link
            href={`/profile/${user.id}`}
            className={styles.menu_item}
            onClick={() => setIsOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            Edit Profile
          </Link>

          <div
            className={styles.menu_item}
            onClick={handleLogout}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
            </svg>
            Logout
          </div>
        </div>
      )}
    </button>
  );
}