import { AssetRevisionDetails, RawAssetRevisionDetails } from "../types/assets.types";
import { RawUserAvatarData, UserAvatarData } from "../types/users.types";
import { z } from "zod";

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

/**
 * Zod schema that accepts a string and transforms it into a number.
 *
 * This is useful for form fields, since HTML form inputs always return values as strings.
 * If the value cannot be parsed into a number, validation will fail.
 *
 */
export const transformZodStringToNumber = z.string().transform((id) => {
  const num = parseInt(id);
  if (isNaN(num)) throw new Error("Could not parse Id into a number");
  return num;
});