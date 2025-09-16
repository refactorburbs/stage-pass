"use client";

import { useTransition } from "react";
import { VotePhase, VoteType } from "@/app/generated/prisma";
import { castAssetVote } from "@/app/actions/asset.actions";
import { redirect } from "next/navigation";

import styles from "./PendingAssetCard.module.css";

interface VoteButtonProps {
  assetId: number;
  currentPhase: VotePhase;
  gameId: number;
  onVote?: (assetId: number) => void;
}

export default function VoteButtons({ assetId, currentPhase, gameId, onVote }: VoteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleVote = (voteType: VoteType) => {
    startTransition(async () => {
      if (onVote) {
        onVote(assetId); // Immediately "removes" from carousel with useOptimistic state
        await castAssetVote(assetId, gameId, voteType, currentPhase);
      } else {
        await castAssetVote(assetId, gameId, voteType, currentPhase);
        redirect(`/game/${gameId}`);
      }
    });
  };

  return (
    <div className={styles.vote_buttons}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          handleVote(VoteType.REJECT);
        }}
        disabled={isPending}
        >
          No
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            handleVote(VoteType.APPROVE);
          }}
          disabled={isPending}
        >
          Yes
        </button>
    </div>
  );
}