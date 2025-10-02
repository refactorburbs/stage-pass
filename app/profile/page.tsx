import NotAuthorized from "@/components/ErrorPages/NotAuthorized";
import { getDetailedUserData } from "@/lib/data";
import AvatarBubble from "@/components/Avatar/AvatarBubble/AvatarBubble";
import UpdateProfileForm from "./UpdateProfileForm";
import { GetUserDataResponse } from "@/lib/types/dto.types";
import Link from "next/link";

import styles from "./ProfilePage.module.css";

export default async function UserProfilePage() {
  const user = await getDetailedUserData();

  if (!user) {
    return <NotAuthorized />
  }

  const filteredUser: GetUserDataResponse = {
    id: user.id,
    firstName: user.firstName,
    fullName: user.fullName,
    initials: user.initials,
    role: user.role,
    team_id: user.team_id,
    avatar: user.avatar,
    customAvatar: user.customAvatar,
    teamName: user.teamName
  }

  return (
    <div className={styles.profile_page}>
      <div className="content-wrapper">
        <div className={styles.profile_avatar}>
          <AvatarBubble size="x-large" user={filteredUser} />
          <h2 className={styles.page_title}>
            {`${user.firstName}'s Profile:`}
          </h2>
        </div>
        <UpdateProfileForm />

        {/* User Info Section */}
        <section className={styles.section}>
          <h2 className={styles.section_title}>Personal Info</h2>
          <div className={styles.info_card}>
            <div className={styles.info_row}>
              <span className={styles.label}>First Name:</span>
              <span className={styles.value}>{user.firstName}</span>
            </div>
            <div className={styles.info_row}>
              <span className={styles.label}>Last Name:</span>
              <span className={styles.value}>{user.lastName}</span>
            </div>
            <div className={styles.info_row}>
              <span className={styles.label}>Email:</span>
              <span className={styles.value}>{user.email}</span>
            </div>
          </div>
        </section>

        {/* Team Affiliation Section */}
        <section className={styles.section}>
          <h2 className={styles.section_title}>Team Affiliation</h2>
          <div className={styles.info_card}>
            <div className={styles.info_row}>
              <span>{user.teamName}</span>
            </div>
          </div>
        </section>

        {/* Games You Work On Section */}
        <section className={styles.section}>
          <h2 className={styles.section_title}>Games You Work On</h2>
          {user.teamGames.length > 0 ? (
            <div className={styles.game_grid}>
              {user.teamGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/game/${game.id}`}
                  className={styles.game_card}
                >
                  <div className={styles.game_card_content}>
                    <h3 className={styles.game_name}>{game.name}</h3>
                    <span className={styles.game_card_arrow}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.empty_state}>
              <p>No games assigned to your team</p>
            </div>
          )}
        </section>

        {/* Games You Own Section */}
        <section className={styles.section}>
          <h2 className={styles.section_title}>Games You Own (Final Say)</h2>
          {user.gamesOwned.length > 0 ? (
            <div className={styles.owned_game_list}>
              {user.gamesOwned.map((game) => (
                <div key={game.id} className={styles.owned_game_item}>
                  <span className={styles.owned_game_name}>{game.name}</span>
                  <Link
                    href={`/game/${game.id}`}
                    className={styles.owned_game_link}
                  >
                    View Game
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty_state}>
              <p>No owned games</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}