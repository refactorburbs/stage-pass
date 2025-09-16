export type UserAvatarData = {
  id: number;
  firstName: string;
  fullName: string;
  initials: string;
  avatar: number;
  customAvatar: string | null;
  team_id?: number;
  teamName: string;
}