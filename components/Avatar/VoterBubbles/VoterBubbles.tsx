import TooltipHover from "@/components/TooltipHover/TooltipHover";
import AvatarBubble from "@/components/Avatar/AvatarBubble/AvatarBubble";
import { GetUserDataResponse } from "@/lib/types/dto.types";

import styles from "./VoterBubbles.module.css";

interface VoterBubblesProps {
  voters: Array<GetUserDataResponse>;
}

export default function VoterBubbles({ voters }: VoterBubblesProps) {
  // Limit the bubbles we show to maybe 12?
  const truncatedList = voters.slice(0,11);
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