import TooltipHover from "@/components/TooltipHover";
import AvatarBubble from "@/components/AvatarBubble/AvatarBubble";
import { UserAvatarData } from "@/lib/types/users.types";

import styles from "./VoterBubbles.module.css";

interface VoterBubblesProps {
  voters: Array<UserAvatarData>;
}

export default function VoterBubbles({ voters }: VoterBubblesProps) {
  // Limit the bubbles we show to maybe 10?
  const truncatedList = voters.slice(0,9);
  return (
    <div className={styles.voter_bubble_container}>
      {truncatedList.map((voter) => (
        <div className={styles.voter_bubble} key={voter.id}>
          <TooltipHover text={`${voter.fullName} - ${voter.teamName}`}>
            <AvatarBubble size="small" user={voter}/>
          </TooltipHover>
        </div>
      ))}
    </div>
  );
}