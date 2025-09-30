import { GetUserDataResponse } from '@/lib/types/dto.types';
import AvatarDropdownMenu from './AvatarDropdownMenu/AvatarDropdownMenu';
import TooltipHover from '@/components/TooltipHover/TooltipHover';
import Link from "next/link";
import Image from "next/image";

import styles from './Navbar.module.css';

interface NavbarProps {
  user: GetUserDataResponse;
  gameInfo? : {
    gameName: string;
    numTeams: number;
    teamString: string;
    gameId: number;
  }
}

export default function Navbar({ user, gameInfo }: NavbarProps) {
  const gameInfoProvided = gameInfo && gameInfo.gameName && gameInfo.teamString && gameInfo.gameId;
  return (
    <nav className={`content-wrapper ${styles.navbar_container}`}>
      <div className={styles.logo_wrapper}>
        <Link href="/">
          <Image
            src="/logo/stagepass-logo.webp"
            alt="StagePass Logo"
            width={432}
            height={540}
            className={styles.logo_image}
          />
        </Link>
      </div>

      {gameInfoProvided ? (
        <div className={styles.game_team_info}>
          <Link href={`/game/${gameInfo.gameId}`} className={styles.game_name_link}>
            <h2>{`${gameInfo.gameName}`}</h2>
          </Link>
          <TooltipHover text={gameInfo.teamString}>
            <span className={styles.team_info}>
              {`${gameInfo.numTeams} Collaborators`}
            </span>
          </TooltipHover>
        </div>
      ) : ( <span>StagePass (MVP)</span> )}

      <AvatarDropdownMenu user={user}/>
    </nav>
  );
}