import { cache } from "react";
import prisma from "@/lib/prisma";
import { GetGameDataResponse } from "../types/dto.types";

export const getGame = cache(async (game_id: number): Promise<GetGameDataResponse | null> => {
  const game = await prisma.game.findUnique({
    where: { id: game_id },
    select: {
      id: true,
      name: true,
      gameTeams: {
        select: {
          team: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  if (!game) {
    console.log("No game found with that Id, returning null game data.");
    return null;
  }

  return {
    id: game.id,
    name: game.name,
    teams: game.gameTeams.map(gameTeam => gameTeam.team.name)
  };
});
