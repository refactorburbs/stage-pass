import styles from "./NotAuthorized.module.css";

export default function NotAuthorized() {
  return (
    <div className={styles.not_authorized_page}>
      <span>{"403 | Forbidden"}</span>
      <span>User is not authorized for this page</span>
    </div>
  );
}