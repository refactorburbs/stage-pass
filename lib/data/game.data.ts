"use server";

import { cache } from "react";
import prisma from "@/lib/prisma";
import { GetGameAssetCategoriesResponse, GetGameDataResponse } from "../types/dto.types";

/**
 * Fetches game data for the Game Project Selection Page, including team info and total collaborator count.
 *
 * Uses React's {@link cache} wrapper to memoize results across
 * identical calls within the same server-rendering cycle.
 * This reduces redundant database queries when multiple
 * components or hooks request the same game data.
 *
 * If no game is found with the given Id, `null` is returned.
*/
export const getGame = cache(async (game_id: number): Promise<GetGameDataResponse | null> => {
  const game = await prisma.game.findUnique({
    where: { id: game_id },
    select: {
      id: true,
      name: true,
      banner: true,
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

  // Count all user records where their team has at least one GameTeam entry with this game_id
  const totalCollaborators = await prisma.user.count({
    where: {
      team: {
        gameTeams: { some: { game_id } },
      },
    },
  });

  return {
    id: game.id,
    name: game.name,
    banner: game.banner,
    teams: game.gameTeams.map(gameTeam => gameTeam.team.name),
    totalCollaborators
  };
});

/**
 * Fetches the Asset Categories for a given game. Each game has a unique list of categories,
 * and is referenced upon new asset uploads.
 *
 * If no game is found with the given Id, `null` is returned.
*/
export async function getGameAssetCategories(game_id: number): Promise<GetGameAssetCategoriesResponse | null> {
  const game = await prisma.game.findUnique({
    where: { id: game_id },
    select: {
      name: true,
      assetCategories: true
    }
  });

  if (!game) {
    console.log("No game found with that Id, returning null game data.");
    return null;
  }

  return {
    game_id,
    gameName: game.name,
    assetCategories: game.assetCategories
  }
}