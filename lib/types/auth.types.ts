export type UserRoleType = "LEAD" | "ARTIST" | "VOTER";

export type SessionPayload = {
  userId: string
  expiresAt: Date
};