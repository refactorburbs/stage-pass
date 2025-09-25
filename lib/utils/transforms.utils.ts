import { AssetItemForVoterFeed, AssetRevisionDetails, RawAssetRevisionQueryData, RawVoterAssetQueryData } from "../types/assets.types";
import { GetUserDataResponse } from "../types/dto.types";
import { RawUserQueryData } from "../types/users.types";
import { z } from "zod";

/**
 * Flattens the team name info of a user from a raw user data query and normalizes undefined
 * customAvatars to null. This is better for UI handling and Avatar display data.
 */
export function transformUserData(user: RawUserQueryData): GetUserDataResponse {
  return {
    ...user,
    customAvatar: user.customAvatar || null,
    teamName: user.team.name,
  };
}

/**
 * Excludes the revision's current phase in the response and flattens the team
 * name info of the uploader (user data)
*/
export function transformRevisionData(revision: RawAssetRevisionQueryData): AssetRevisionDetails {
  return {
    id: revision.id,
    imageUrls: revision.imageUrls,
    createdAt: revision.createdAt,
    status: revision.status,
    revisionNumber: revision.revisionNumber,
    revisionDescription: revision.revisionDescription,
    uploader: transformUserData(revision.uploader)
  };
}

/**
 * Excludes the asset's nested "votes" field in the response and flattens the team
 * name info of the uploader (user data) with additional meta data about the vote_id
 * and when the user voted on this asset (if they have). This allows for the voter to
 * switch their vote back to pending if they change their mind.
*/
export function transformVoterFeedAsset(asset: RawVoterAssetQueryData): AssetItemForVoterFeed {
  return {
    id: asset.id,
    title: asset.title,
    category: asset.category,
    imageUrls: asset.imageUrls,
    createdAt: asset.createdAt,
    status: asset.status,
    currentPhase: asset.currentPhase,
    uploader: transformUserData(asset.uploader),
    vote_id: asset.votes[0]?.id || null, // Used to reference assetVote if user wants to switch vote back to pending
    votedAt: asset.votes[0]?.createdAt || null
  }
};

/**
 * Zod schema that accepts a string and transforms it into a number.
 *
 * This is useful for form fields, since HTML form inputs always return values as strings.
 * If the value cannot be parsed into a number, validation will fail.
 */
export const transformZodStringToNumber = z.string().transform((id) => {
  const num = parseInt(id);
  if (isNaN(num)) throw new Error("Could not parse Id into a number");
  return num;
});