import { UserRole } from "@/app/generated/prisma";

export const USER_VOTE_WEIGHT = {
  [UserRole.ARTIST]: 0.0,
  [UserRole.VOTER]: 1.0,
  [UserRole.LEAD]: 1.2 // 20% higher for team leads
}

export const VOTE_DECISION_THRESHOLD = 60; // 60% of votes required to either approve or reject

export const AVATAR_BUBBLE_COLORS = [
  "#e74c3c",
  "#3498db",
  "#2ecc71",
  "#f1c40f",
  "#9b59b6"
];

export const USER_AVATAR_SELECT_QUERY = {
  id: true,
  firstName: true,
  fullName: true,
  initials: true,
  avatar: true,
  customAvatar: true,
  team: {
    select: { name: true }
  }
}