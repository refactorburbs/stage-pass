/*
  Warnings:

  - You are about to drop the column `game_Id` on the `game_teams` table. All the data in the column will be lost.
  - You are about to drop the column `team_Id` on the `game_teams` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[game_id,team_id]` on the table `game_teams` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `game_id` to the `game_teams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `team_id` to the `game_teams` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."game_teams" DROP CONSTRAINT "game_teams_game_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."game_teams" DROP CONSTRAINT "game_teams_team_Id_fkey";

-- DropIndex
DROP INDEX "public"."game_teams_game_Id_team_Id_key";

-- AlterTable
ALTER TABLE "public"."game_teams" DROP COLUMN "game_Id",
DROP COLUMN "team_Id",
ADD COLUMN     "game_id" INTEGER NOT NULL,
ADD COLUMN     "team_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "game_teams_game_id_team_id_key" ON "public"."game_teams"("game_id", "team_id");

-- AddForeignKey
ALTER TABLE "public"."game_teams" ADD CONSTRAINT "game_teams_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_teams" ADD CONSTRAINT "game_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
