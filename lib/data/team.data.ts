"use server";

import { cache } from "react";
import prisma from "@/lib/prisma";
import { GetTeamDataResponse } from "../types/dto.types";

/**
 * Fetches information about a team, including the team name and games they are working on.
 *
 * Uses React's {@link cache} wrapper to memoize results across
 * identical calls within the same server-rendering cycle.
 * This reduces redundant database queries when multiple
 * components or hooks request the same game data.
 *
 * If no team is found with the given Id, `null` is returned.
*/
export const getTeam = cache(async (team_id: number): Promise<GetTeamDataResponse | null> => {
  const team = await prisma.team.findUnique({
    where: { id: team_id },
    select: {
      id: true,
      name: true,
      gameTeams: { // GameTeams plural - see relationship var in schema for Team model
        select: {
          game: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  });

  if (!team) {
    console.log("No team found with that Id, returning null team data.");
    return null;
  }

  return {
    id: team.id,
    name: team.name,
    games: team.gameTeams.map((gameTeam) => gameTeam.game)
  };
});
