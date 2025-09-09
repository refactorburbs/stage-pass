import { AVATAR_BUBBLE_COLORS } from "@/lib/constants/placeholder.constants";
import { GetUserDataResponse } from "@/lib/types/dto.types";

import style from "./Avatar.module.css";

interface AvatarProps {
  user: GetUserDataResponse
}

export default function Avatar({ user }: AvatarProps) {
  const isColorOnly = !user.customAvatar;

  if (isColorOnly) {
    const bubbleColor = AVATAR_BUBBLE_COLORS[user.avatar];
    return (
      <span
        className={style.avatar_color_bubble}
        style={{ backgroundColor: bubbleColor }}
      >
        {user.initials}
      </span>
    );
  }

  return (
    <div>IMAGE</div>
  );
}