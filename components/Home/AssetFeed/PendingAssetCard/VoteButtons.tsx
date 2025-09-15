"use client";

import { useTransition } from "react";
import { AssetItemForVoterFeed } from "@/lib/types/assets.types";
import { VoteType } from "@/app/generated/prisma";
import { castAssetVote } from "@/app/actions/asset.actions";

import styles from "./PendingAssetCard.module.css";

interface VoteButtonProps {
  asset: AssetItemForVoterFeed;
  gameId: number;
  onVote: (assetId: number) => void;
}

export default function VoteButtons({ asset, gameId, onVote }: VoteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleVote = (voteType: VoteType) => {
    startTransition(async () => {
      onVote(asset.id); // Immediately "removes" from carousel with useOptimistic state
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