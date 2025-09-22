import { AssetRevisionDetails, RawAssetRevisionDetails } from "../types/assets.types";
import { RawUserAvatarData, UserAvatarData } from "../types/users.types";

export function transformUserAvatarData(user: RawUserAvatarData): UserAvatarData {
  return {
    id: user.id,
    firstName: user.firstName,
    fullName: user.fullName,
    initials: user.initials,
    avatar: user.avatar,
    customAvatar: user.customAvatar || null,
    teamName: user.team.name
  };
}

export function transformRevisionData(revision: RawAssetRevisionDetails): AssetRevisionDetails {
  return {
    id: revision.id,
    imageUrls: revision.imageUrls,
    createdAt: revision.createdAt,
    status: revision.status,
    revisionNumber: revision.revisionNumber,
    revisionDescription: revision.revisionDescription,
    uploader: transformUserAvatarData(revision.uploader)
  };
}