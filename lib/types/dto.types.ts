import { UserRoleType } from "./auth.types";

export interface GetUserDataResponse {
  id: number;
  initials: string;
  avatar: number;
  customAvatar: string | null;
  role: UserRoleType;
  team_id: number;
  teamName: string;
}

export interface GetGameDataResponse {
  id: number;
  name: string;
  teams: Array<string>;
}

export interface GetUserPermissionsResponse {
  canVote: boolean;
  canComment: boolean;
  canUpload: boolean;
  hasFinalSay: boolean;
}