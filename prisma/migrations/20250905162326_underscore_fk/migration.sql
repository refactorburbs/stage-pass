/*
  Warnings:

  - You are about to drop the column `image_url` on the `asset_revisions` table. All the data in the column will be lost.
  - You are about to drop the column `notification_sent` on the `asset_revisions` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `notification_sent` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `game_id` on the `game_owners` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `game_owners` table. All the data in the column will be lost.
  - You are about to drop the column `game_id` on the `game_teams` table. All the data in the column will be lost.
  - You are about to drop the column `team_id` on the `game_teams` table. All the data in the column will be lost.
  - You are about to drop the column `has_commented` on the `user_asset_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `has_voted` on the `user_asset_interactions` table. All the data in the column will be lost.
  - You are about to drop the column `custom_avatar` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[game_Id,user_Id]` on the table `game_owners` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[game_Id,team_Id]` on the table `game_teams` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `imageUrl` to the `asset_revisions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `game_Id` to the `game_owners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_Id` to the `game_owners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `game_Id` to the `game_teams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_Id` to the `game_teams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."game_owners" DROP CONSTRAINT "game_owners_game_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."game_owners" DROP CONSTRAINT "game_owners_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."game_teams" DROP CONSTRAINT "game_teams_game_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."game_teams" DROP CONSTRAINT "game_teams_team_id_fkey";

-- DropIndex
DROP INDEX "public"."game_owners_game_id_user_id_key";

-- DropIndex
DROP INDEX "public"."game_teams_game_id_team_id_key";

-- AlterTable
ALTER TABLE "public"."asset_revisions" DROP COLUMN "image_url",
DROP COLUMN "notification_sent",
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "notificationSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."assets" DROP COLUMN "image_url",
DROP COLUMN "notification_sent",
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "notificationSent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."game_owners" DROP COLUMN "game_id",
DROP COLUMN "user_id",
ADD COLUMN     "game_Id" INTEGER NOT NULL,
ADD COLUMN     "user_Id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."game_teams" DROP COLUMN "game_id",
DROP COLUMN "team_id",
ADD COLUMN     "game_Id" INTEGER NOT NULL,
ADD COLUMN     "team_Id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."user_asset_interactions" DROP COLUMN "has_commented",
DROP COLUMN "has_voted",
ADD COLUMN     "hasCommented" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hasVoted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "custom_avatar",
DROP COLUMN "first_name",
DROP COLUMN "is_active",
DROP COLUMN "last_name",
DROP COLUMN "password_hash",
ADD COLUMN     "customAvatar" TEXT,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "game_owners_game_Id_user_Id_key" ON "public"."game_owners"("game_Id", "user_Id");

-- CreateIndex
CREATE UNIQUE INDEX "game_teams_game_Id_team_Id_key" ON "public"."game_teams"("game_Id", "team_Id");

-- AddForeignKey
ALTER TABLE "public"."game_teams" ADD CONSTRAINT "game_teams_game_Id_fkey" FOREIGN KEY ("game_Id") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_teams" ADD CONSTRAINT "game_teams_team_Id_fkey" FOREIGN KEY ("team_Id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_owners" ADD CONSTRAINT "game_owners_game_Id_fkey" FOREIGN KEY ("game_Id") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_owners" ADD CONSTRAINT "game_owners_user_Id_fkey" FOREIGN KEY ("user_Id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
