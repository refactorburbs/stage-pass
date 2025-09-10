import Image from "next/image";

import styles from "./AvatarBubble.module.css";

// Used for displaying live updates when a user uploads or updates
// their profile picture
export default function DynamicImageAvatarBubble({ src }: { src: string }) {
  return (
    <div className={styles.dynamic_avatar_bubble}>
      <Image
        src={src ? src : "/avatar-stock.webp"}
        alt="Custom Avatar"
        className={styles.avatar_image}
        width={48}
        height={48}
      />
    </div>
  );
}