import prisma from "@/lib/prisma";
import { verifySession } from "../sessions";
import { UserRole } from "../constants/placeholder.constants";
import { cache } from "react";
import { GetGameDataResponse, GetUserDataResponse } from "../types/dto.types";

// Fetch user information in a data access layer (protected by auth)
// Wrapping in React's cache so that we can call getUser in multiple components,
// but only one request will be made to the database for the same user during a single render cycle.
export const getUser = cache(async () => {
  // Verify user's session
  const session = await verifySession();
  if (!session.userId) {
    console.log("No userId found in session, returning null user data.");
    return null;
  }
  // Fetch user data
  const user = await prisma.user.findUnique({
    where: { id: Number(session.userId) },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      avatar: true,
      customAvatar: true,
      role: true,
      team_id: true
    }
  });

  if (!user) {
    console.log("No user found for the given userId, returning null user data.");
    return null;
  }

  // Extract the team name from team id for more user-friendly info display in the UI
  const team = await prisma.team.findUnique({
    where: { id: user.team_id },
    select: { name: true }
  });

  const userDTO: GetUserDataResponse = {
    id: user.id,
    initials: `${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}`,
    avatar: user.avatar,
    customAvatar: user.customAvatar,
    role: user.role,
    team_id: user.team_id,
    teamName: team?.name || 'No Team'
  }

  return userDTO;
});

export const getUserPermissions = cache(async (user: GetUserDataResponse, game: GetGameDataResponse) => {
  const isIPOwner = await prisma.gameOwner.findFirst({
    where: {
      game_id: game.id,
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