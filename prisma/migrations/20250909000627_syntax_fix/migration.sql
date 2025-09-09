/*
  Warnings:

  - You are about to drop the column `game_Id` on the `game_owners` table. All the data in the column will be lost.
  - You are about to drop the column `user_Id` on the `game_owners` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[game_id,user_id]` on the table `game_owners` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `game_id` to the `game_owners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `game_owners` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."game_owners" DROP CONSTRAINT "game_owners_game_Id_fkey";

-- DropForeignKey
ALTER TABLE "public"."game_owners" DROP CONSTRAINT "game_owners_user_Id_fkey";

-- DropIndex
DROP INDEX "public"."game_owners_game_Id_user_Id_key";

-- AlterTable
ALTER TABLE "public"."game_owners" DROP COLUMN "game_Id",
DROP COLUMN "user_Id",
ADD COLUMN     "game_id" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "game_owners_game_id_user_id_key" ON "public"."game_owners"("game_id", "user_id");

-- AddForeignKey
ALTER TABLE "public"."game_owners" ADD CONSTRAINT "game_owners_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_owners" ADD CONSTRAINT "game_owners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
