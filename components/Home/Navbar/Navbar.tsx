import { GetUserDataResponse } from '@/lib/types/dto.types';
import UserProfileIcon from './UserProfileIcon';

import styles from './Navbar.module.css';

interface NavbarProps {
  gameName: string;
  teamString: string;
  user: GetUserDataResponse
}

export default function Navbar({ gameName, teamString, user }: NavbarProps) {
  return (
    <div className={styles.navbar_container}>
      <div className={styles.game_team_info}>
        <h2>{`${gameName} - `}</h2>
        <span className={styles.team_info}>
          {teamString}
        </span>
      </div>
      <UserProfileIcon user={user}/>
    </div>
  );
}