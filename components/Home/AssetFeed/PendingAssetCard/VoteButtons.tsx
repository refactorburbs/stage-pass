"use client";

import { useTransition } from "react";
import { AssetItemForVoterFeed } from "@/lib/types/assets.types";
import { VoteType } from "@/app/generated/prisma";
import { castAssetVote } from "@/app/actions/asset.actions";

import styles from "./PendingAssetCard.module.css";

interface VoteButtonProps {
  asset: AssetItemForVoterFeed;
  gameId: number;
}
export default function VoteButtons({ asset, gameId }: VoteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleVote = (voteType: VoteType) => {
    startTransition(async () => {
      await castAssetVote(asset.id, gameId, voteType, asset.currentPhase);
    });
  };

  return (
    <div className={styles.vote_buttons}>
      <button
        onClick={() => handleVote(VoteType.REJECT)}
        disabled={isPending}
        >
          No
        </button>
        <button
          onClick={() => handleVote(VoteType.APPROVE)}
          disabled={isPending}
        >
          Yes
        </button>
    </div>
  );
}