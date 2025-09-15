/*
  Warnings:

  - You are about to drop the column `phase1_approval_percentage` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `phase1_approvals` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `phase1_rejections` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `phase1_total_votes` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `phase2_approval_percentage` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `phase2_approvals` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `phase2_rejections` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `phase2_total_votes` on the `assets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."assets" DROP COLUMN "phase1_approval_percentage",
DROP COLUMN "phase1_approvals",
DROP COLUMN "phase1_rejections",
DROP COLUMN "phase1_total_votes",
DROP COLUMN "phase2_approval_percentage",
DROP COLUMN "phase2_approvals",
DROP COLUMN "phase2_rejections",
DROP COLUMN "phase2_total_votes";
