/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `assets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."assets" DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrls" TEXT[];
