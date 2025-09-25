import { UserRole } from "@/app/generated/prisma";

export type RawUserQueryData = {
  id: number;
  firstName: string;
  fullName: string;
  initials: string;
  avatar: number;
  customAvatar: string | null;
  role: UserRole;
  team_id: number;
  team: {
    name: string;
  }
}