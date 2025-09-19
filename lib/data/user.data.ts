import prisma from "@/lib/prisma";
import { verifySession } from "../sessions";
import { UserRole, VotePhase } from "@/app/generated/prisma";
import { cache } from "react";
import {
  GetDetailedUserDataResponse,
  GetUserDataResponse,
  GetUserPermissionsResponse
} from "../types/dto.types";

// Fetch user information in a data access layer (protected by auth)
// Wrapping in React's cache so that we can call getUser in multiple components,
// but only one request will be made to the database for the same user during a single render cycle.
export const getUser = cache(async (): Promise<GetUserDataResponse | null> => {
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
    select: {
      id: true,
      firstName: true,
      fullName: true,
      initials: true,
      avatar: true,
      customAvatar: true,
      role: true,
      team_id: true,
      team: {
        select: {
          name: true
        }
      }
    }
  });

  if (!user) {
    console.log("No user found for the given userId, returning null user data.");
    return null;
  }

  return ({
    id: user.id,
    firstName: user.firstName,
    fullName: user.fullName,
    initials: user.initials,
    avatar: user.avatar,
    customAvatar: user.customAvatar,
    team_id: user.team_id,
    role: user.role,
    teamName: user.team.name
  });

});

export async function getDetailedUserData(): Promise<GetDetailedUserDataResponse | null> {
  // 1. Definitely verify, even though we do in middleware. Sensitive info coming back out!
  const session = await verifySession();
  if (!session.userId) {
    console.log("No userId found in session, returning null user data.");
    return null;
  }
  // 2. Fetch user data and nested, related tables
  const user = await prisma.user.findUnique({
    where: { id: Number(session.userId) },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      fullName: true,
      initials: true,
      email: true,
      role: true,
      avatar: true,
      customAvatar: true,
      team_id: true,
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

  // 3. Combine the query results into our desired DTO
  const detailedUserDTO = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    initials: user.initials,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    customAvatar: user.customAvatar || "",
    team_id: user.team_id,
    teamName: user.team.name,
    gamesOwned: user.gameOwners.map(gameOwner => ({
      id: gameOwner.game.id,
      name: gameOwner.game.name
    })),
    teamGames: user.team.gameTeams.map(gameTeam => ({
      id: gameTeam.game.id,
      name: gameTeam.game.name
    }))
  };

  return detailedUserDTO;
}

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
      include: {
        team: true
      }
    });
    return phase1Users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      fullName: user.fullName,
      initials: user.initials,
      avatar: user.avatar,
      customAvatar: user.customAvatar,
      role: user.role,
      team_id: user.team.id,
      teamName: user.team.name
    }));
  } else {
    // Phase 2 is for external IP Owners
    const phase2Users = await prisma.user.findMany({
      where: {
        isActive: true,
        gameOwners: {
          some: { game_id: gameId } // "some" - get any user that owns this game; doesn't matter if they own other games
        }
      },
      include: {
        team: true
      }
    });
    return phase2Users.map((user) => ({
      id: user.id,
      firstName: user.firstName,
      fullName: user.fullName,
      initials: user.initials,
      avatar: user.avatar,
      customAvatar: user.customAvatar,
      role: user.role,
      team_id: user.team.id,
      teamName: user.team.name
    }));
  }
});