import { getUser } from "@/lib/DAL_DAO/user.data";

import styles from "./page.module.css";

export default async function Home() {
  const user = await getUser();

  if (!user) {
    return (
      <div className={styles.page}>
        No user data found. You might not be logged in.
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1>Protected Home Dashboard</h1>
      <div>
        <strong>Initials:</strong> {user.initials}
      </div>
      <div>
        <strong>Avatar:</strong> {user.customAvatar || user.avatar}
      </div>
      <div>
        <strong>Role:</strong> {user.role}
      </div>
      <div>
        <strong>Team:</strong> {user.teamName}
      </div>
    </div>
  );
}
