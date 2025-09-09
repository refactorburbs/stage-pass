import { UserRoleType } from "./auth.types";

export interface GetUserDataResponse {
  id: number;
  fullName: string;
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

export interface GetTeamDataResponse {
  id: number;
  name: string;
  games: Array<{ id: number, name: string}>;
}

export interface GetGameDataResponse {
  id: number;
  name: string;
  teams: Array<string>;
}