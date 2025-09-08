import prisma from "../prisma";
import { verifySession } from "../sessions";
import { cache } from "react";

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

  const userDTO = {
    initials: `${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}`,
    avatar: user.avatar,
    customAvatar: user.customAvatar,
    role: user.role,
    team_id: user.team_id,
    teamName: team?.name || 'No Team'
  }

  return userDTO;
});