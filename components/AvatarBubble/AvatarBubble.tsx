import { AVATAR_BUBBLE_COLORS } from "@/lib/constants/placeholder.constants";
import { GetUserDataResponse } from "@/lib/types/dto.types";
import Image from "next/image";

import styles from "./AvatarBubble.module.css";

type AvatarBubbleSize = "small" | "medium" | "large" | "x-large";

interface AvatarBubbleProps {
  size: AvatarBubbleSize;
  user: GetUserDataResponse;
}

const generateCSS = (size: AvatarBubbleSize, user: GetUserDataResponse) => {
  const isColorOnly = !user.customAvatar;
  const sizeStyles = (() => {
    switch (size) {
      case "small":
        return { width: "1.75rem", height: "1.75rem", fontSize: "10px" };
      case "medium":
        return { width: "2rem", height: "2rem" };
      case "large":
        return { width: "2.5rem", height: "2.5rem" };
      default:
        return { width: "3rem", height: "3rem" }; // Default to x-large ?
    }
  })();

  if (isColorOnly) {
    const bubbleColor = AVATAR_BUBBLE_COLORS[user.avatar!];
    return {
      ...sizeStyles,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      backgroundColor: bubbleColor
    }
  }

  // For image based avatar bubbles
  return {
    ...sizeStyles,
    display: "inline-block",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    overflow: "hidden"
  }
}

export default function AvatarBubble({ size, user }: AvatarBubbleProps) {
  const isColorOnly = !user.customAvatar;
  const css = generateCSS(size, user);

  if (isColorOnly) {
    return (
      <span
        className={styles.avatar_bubble}
        style={css}
      >
        {user.initials}
      </span>
    );
  }

  return (
    <div
      className={styles.avatar_bubble}
      style={css}
    >
      <Image
        src={user.customAvatar!}
        alt="Custom Avatar"
        className={styles.avatar_image}
        width={48} // anticipating largest size (3rem ~ 48px)
        height={48} // and Next can always handle scaling down
      />
    </div>
  );
}