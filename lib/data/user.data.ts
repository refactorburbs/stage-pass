import prisma from "@/lib/prisma";
import { verifySession } from "../sessions";
import { UserRole, VotePhase } from "@/app/generated/prisma";
import { cache } from "react";
import {
  GetDetailedUserDataResponse,
  GetUserDataResponse,
  GetUserPermissionsResponse
} from "../types/dto.types";
import { USER_DATA_SELECT_QUERY } from "../constants/query.constants";
import { transformUserData } from "../utils";

/**
 * Fetches the currently authenticated user's data.
 *
 * This function acts as a data-access layer, protected by session-based auth.
 * It verifies the session, queries the database for the active user, and
 * transforms the raw query result into a typed response object.
 *
 * Uses React's {@link cache} wrapper so that multiple components can call
 * `getUser` during a single render cycle without triggering duplicate
 * database queries. The result is memoized for the duration of the cycle.
 *
 * @returns A {@link GetUserDataResponse} object containing the authenticated
 * user's details, or `null` if:
 * - No session userId is present
 * - No active user record is found for the session userId
*/
export const getUser = cache(async (): Promise<GetUserDataResponse | null> => {
  try {
    const session = await verifySession();
    if (!session.userId) {
      console.log("No userId found in session, returning null user data.");
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        id: Number(session.userId),
        isActive: true
      },
      select: USER_DATA_SELECT_QUERY
    });

    if (!user) {
      console.log("No user found for the given userId, returning null user data.");
      return null;
    }

    return transformUserData(user);
  } catch(error) {
    console.error("Error in getUser:", error);
    return null;
  }
});

/**
 * Fetches detailed user data for the user's Profile Page, including team info, owned games, and team games.
 * Ensures session validation before querying, as some information is sensitive (email, owned games).
*/
export async function getDetailedUserData(): Promise<GetDetailedUserDataResponse | null> {
  try {
    const session = await verifySession();
    if (!session.userId) {
      console.log("No userId found in session, returning null user data.");
      return null;
    }
    const user = await prisma.user.findUnique({
      where: { id: Number(session.userId) },
      select: {
        ...USER_DATA_SELECT_QUERY,
        lastName: true,
        email: true,
        team: {
          select: {
            name: true,
            gameTeams: {
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
        },
        gameOwners: {
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

    if (!user) {
      console.log("No user found for the given userId, returning null user data.");
      return null;
    }

    const baseUser = transformUserData(user);

    return {
      ...baseUser,
      lastName: user.lastName,
      email: user.email,
      gamesOwned: user.gameOwners.map(({ game }) => game),
      teamGames: user.team.gameTeams.map(({ game }) => game)
    }
  } catch(error) {
    console.error("Error fetching detailed user data:", error);
    return null;
  }
}

/**
 * Determines the permission set for a given user within a specific game.
 *
 * This function checks the user's role and whether they are an IP Owner
 * of the game, and returns a set of boolean flags representing the actions
 * they are allowed to perform.
 *
 * Uses React's {@link cache} wrapper to memoize results within a single
 * server-rendering cycle, preventing redundant database lookups when
 * multiple components request the same permissions.
 *
*/
export const getUserPermissions = cache(async (
  user: GetUserDataResponse,
  gameId: number,
): Promise<GetUserPermissionsResponse> => {
  const isIPOwner = await prisma.gameOwner.findFirst({
    where: {
      game_id: gameId,
      user_id: user.id
    }
  });

  return {
    canVote: user.role !== UserRole.ARTIST,
    canComment: true, // everyone can comment
    canUpload: user.role !== UserRole.VOTER,
    hasFinalSay: !!isIPOwner
  }
});

/**
 * Retrieves all eligible voters for a given game and voting phase.
 * Can pass in an optional list of user Ids to exclude from results.
 *
 * - **Phase 1**: Internal team members (`LEADS` and `VOTERS`) actively working on the game.
 *   - Excludes: inactive users, game owners of the given game, users not on an active team.
 *
 * - **Phase 2**: External IP Owners who own the given game (regardless of other games owned).
*/
export const getAllEligibleVoters = cache(async (
  gameId: number,
  phase: VotePhase,
  excludeUserIds: Array<number> = []
): Promise<Array<GetUserDataResponse>> => {
  if (phase === VotePhase.PHASE1) {
    // Phase 1 is internal teams (LEADS and VOTERS working on the game)
    const phase1Users = await prisma.user.findMany({
      where: {
        id: { notIn: excludeUserIds },
        isActive: true,
        role: { in: [UserRole.LEAD, UserRole.VOTER] },
        gameOwners: {
          none: { game_id: gameId }, // Exclude any user who owns this game
        },
        team: {
          gameTeams: {
            some: {
              game_id: gameId,
              endedAt: null // Make sure the team is still working on the game
            }
          }
        }
      },
      select: USER_DATA_SELECT_QUERY
    });
    return phase1Users.map(transformUserData);

  } else {
    // Phase 2 is for external IP Owners
    const phase2Users = await prisma.user.findMany({
      where: {
        id: { notIn: excludeUserIds },
        isActive: true,
        gameOwners: {
          some: { game_id: gameId } // "some" - get any user that owns this game; doesn't matter if they own other games
        }
      },
      select: USER_DATA_SELECT_QUERY
    });
    return phase2Users.map(transformUserData);
  }
});