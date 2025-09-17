import { GetUserDataResponse } from '@/lib/types/dto.types';
import UserProfileIcon from './UserProfileIcon';
import Link from "next/link";

import styles from './Navbar.module.css';

interface NavbarProps {
  gameName: string;
  teamString: string;
  user: GetUserDataResponse;
  gameId: number;
}

export default function Navbar({ gameName, teamString, user, gameId }: NavbarProps) {
  return (
    <div className={styles.navbar_container}>
      <div className={styles.game_team_info}>
        <Link href={`/game/${gameId}`}>
          <h2>{`${gameName} - `}</h2>
        </Link>
        <span className={styles.team_info}>
          {teamString}
        </span>
      </div>
      <UserProfileIcon user={user}/>
    </div>
  );
}