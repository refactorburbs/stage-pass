import { AVATAR_BUBBLE_COLORS } from "@/lib/constants/placeholder.constants";
import { GetUserDataResponse } from "@/lib/types/dto.types";
import Image from "next/image";

import styles from "./AvatarBubble.module.css";

type AvatarBubbleSize = "small" | "medium" | "large" | "x_large";

interface AvatarBubbleProps {
  size: AvatarBubbleSize;
  user: GetUserDataResponse;
}

const generateCSS = (user: GetUserDataResponse) => {
  const isColorOnly = !user.customAvatar;
  if (isColorOnly) {
    const bubbleColor = AVATAR_BUBBLE_COLORS[user.avatar!];
    return {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      backgroundColor: bubbleColor
    }
  }

  // For image based avatar bubbles
  return {
    display: "inline-block",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    overflow: "hidden"
  }
}

export default function AvatarBubble({ size, user }: AvatarBubbleProps) {
  const isColorOnly = !user.customAvatar;
  const css = generateCSS(user);

  if (isColorOnly) {
    return (
      <span
        className={`${styles.avatar_bubble} ${styles[size]}`}
        style={css}
      >
        {user.initials}
      </span>
    );
  }

  return (
    <div
      className={`${styles.avatar_bubble} ${styles[size]}`}
      style={css}
    >
      <Image
        src={user.customAvatar!}
        alt="Custom Avatar"
        className="object-fit"
        width={48} // anticipating largest size (3rem ~ 48px)
        height={48} // and Next can always handle scaling down
      />
    </div>
  );
}