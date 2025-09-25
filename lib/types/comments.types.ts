import { GetUserDataResponse } from "./dto.types";

export interface UserAssetComment {
  id: number;
  content: string;
  createdAt: Date,
  user: GetUserDataResponse;
}

export interface PendingCommentData {
  id: number;
  content: string;
  createdAt: Date,
  assetImage: string;
  asset_id: number;
  game_id: number;
  subscriber_id: number;
  commenter: GetUserDataResponse;
}