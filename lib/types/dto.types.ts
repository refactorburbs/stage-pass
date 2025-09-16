import { UserRole } from "@/app/generated/prisma";
import { AssetItemForArtistFeed, AssetItemForGameFeed, AssetItemForVoterFeed } from "./assets.types";

export interface GetUserDataResponse {
  id: number;
  firstName: string;
  fullName: string;
  initials: string;
  avatar: number;
  customAvatar: string | null;
  role: UserRole;
  team_id: number;
  teamName: string;
}

export interface GetDetailedUserDataResponse {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  role: UserRole
  email: string;
  avatar: number;
  customAvatar: string;
  team_id: number;
  teamName: string;
  gamesOwned: Array<{ id: number, name: string }>; // Games this user is the ip owner of (GameOwner table)
  teamGames: Array<{ id: number, name: string }>; // Games this team is working on, that this user is a part of
}

export interface GetUserPermissionsResponse {
  canVote: boolean;
  canComment: boolean;
  canUpload: boolean;
  hasFinalSay: boolean;
}

export interface GetGameDataResponse {
  id: number;
  name: string;
  teams: Array<string>;
}

export interface GetGameAssetCategoriesResponse {
  game_id: number;
  gameName: string;
  assetCategories: Array<string>;
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

export interface GetAssetFeedForArtistResponse {
  rejected: Array<AssetItemForArtistFeed>;
  approved: Array<AssetItemForArtistFeed>;
  pending: Array<AssetItemForArtistFeed>;
}

export interface GetAssetFeedForVoterResponse {
  rejected: Array<AssetItemForVoterFeed>;
  approved: Array<AssetItemForVoterFeed>;
  pending: Array<AssetItemForVoterFeed>;
}

export interface GetAssetFeedForGameResponse {
  rejected: Array<AssetItemForGameFeed>;
  approved: Array<AssetItemForGameFeed>;
  pending: Array<AssetItemForGameFeed>
}