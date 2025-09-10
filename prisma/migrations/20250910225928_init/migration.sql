-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('LEAD', 'ARTIST', 'VOTER');

-- CreateEnum
CREATE TYPE "public"."AssetStatus" AS ENUM ('PENDING', 'PHASE1_APPROVED', 'PHASE1_REJECTED', 'PHASE2_APPROVED', 'PHASE2_REJECTED', 'ARCHIVED', 'REVISED');

-- CreateEnum
CREATE TYPE "public"."VoteType" AS ENUM ('APPROVE', 'REJECT');

-- CreateEnum
CREATE TYPE "public"."VotePhase" AS ENUM ('PHASE1', 'PHASE2');

-- CreateTable
CREATE TABLE "public"."teams" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."games" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "assetCategories" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."game_teams" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "game_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invite_codes" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "team_id" INTEGER NOT NULL,
    "role" "public"."UserRole" NOT NULL,
    "description" TEXT,
    "owned_game_ids" INTEGER[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invite_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" INTEGER NOT NULL DEFAULT 0,
    "customAvatar" TEXT,
    "role" "public"."UserRole" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "team_id" INTEGER NOT NULL,
    "invite_code_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."game_owners" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assets" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "status" "public"."AssetStatus" NOT NULL DEFAULT 'PENDING',
    "currentPhase" "public"."VotePhase" NOT NULL DEFAULT 'PHASE1',
    "phase1_approvals" INTEGER NOT NULL DEFAULT 0,
    "phase1_rejections" INTEGER NOT NULL DEFAULT 0,
    "phase1_total_votes" INTEGER NOT NULL DEFAULT 0,
    "phase1_approval_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "phase2_approvals" INTEGER NOT NULL DEFAULT 0,
    "phase2_rejections" INTEGER NOT NULL DEFAULT 0,
    "phase2_total_votes" INTEGER NOT NULL DEFAULT 0,
    "phase2_approval_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "game_id" INTEGER NOT NULL,
    "uploader_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "phase1_completed_at" TIMESTAMP(3),
    "phase2_completed_at" TIMESTAMP(3),

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."votes" (
    "id" SERIAL NOT NULL,
    "voteType" "public"."VoteType" NOT NULL,
    "phase" "public"."VotePhase" NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "asset_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "public"."teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "game_teams_game_id_team_id_key" ON "public"."game_teams"("game_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "invite_codes_code_key" ON "public"."invite_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "game_owners_game_id_user_id_key" ON "public"."game_owners"("game_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "assets_title_key" ON "public"."assets"("title");

-- CreateIndex
CREATE INDEX "assets_game_id_status_currentPhase_idx" ON "public"."assets"("game_id", "status", "currentPhase");

-- CreateIndex
CREATE INDEX "assets_status_currentPhase_idx" ON "public"."assets"("status", "currentPhase");

-- CreateIndex
CREATE INDEX "votes_asset_id_phase_idx" ON "public"."votes"("asset_id", "phase");

-- CreateIndex
CREATE INDEX "votes_user_id_idx" ON "public"."votes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_asset_id_user_id_phase_key" ON "public"."votes"("asset_id", "user_id", "phase");

-- AddForeignKey
ALTER TABLE "public"."game_teams" ADD CONSTRAINT "game_teams_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_teams" ADD CONSTRAINT "game_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invite_codes" ADD CONSTRAINT "invite_codes_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_invite_code_id_fkey" FOREIGN KEY ("invite_code_id") REFERENCES "public"."invite_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_owners" ADD CONSTRAINT "game_owners_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_owners" ADD CONSTRAINT "game_owners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assets" ADD CONSTRAINT "assets_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assets" ADD CONSTRAINT "assets_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."votes" ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."votes" ADD CONSTRAINT "votes_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
