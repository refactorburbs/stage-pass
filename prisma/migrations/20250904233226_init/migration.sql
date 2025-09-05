-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('LEAD', 'ARTIST', 'VOTER');

-- CreateEnum
CREATE TYPE "public"."AssetStatus" AS ENUM ('PENDING', 'PHASE1_APPROVED', 'PHASE1_REJECTED', 'PHASE2_APPROVED', 'PHASE2_REJECTED', 'ARCHIVED');

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
CREATE TABLE "public"."games" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "assetCategories" TEXT[],
    "eligiblePhase1Voters" INTEGER NOT NULL DEFAULT 0,
    "eligiblePhase2Voters" INTEGER NOT NULL DEFAULT 0,
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
CREATE TABLE "public"."game_owners" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "avatar" INTEGER NOT NULL DEFAULT 0,
    "custom_avatar" TEXT,
    "role" "public"."UserRole" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(3),
    "team_id" INTEGER NOT NULL,
    "invite_code_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."assets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "game_id" INTEGER NOT NULL,
    "uploader_id" INTEGER NOT NULL,
    "phase1_approvals" INTEGER NOT NULL DEFAULT 0,
    "phase1_rejections" INTEGER NOT NULL DEFAULT 0,
    "phase1_total_votes" INTEGER NOT NULL DEFAULT 0,
    "phase1_completed_at" TIMESTAMP(3),
    "phase2_approvals" INTEGER NOT NULL DEFAULT 0,
    "phase2_rejections" INTEGER NOT NULL DEFAULT 0,
    "phase2_total_votes" INTEGER NOT NULL DEFAULT 0,
    "phase2_completed_at" TIMESTAMP(3),
    "status" "public"."AssetStatus" NOT NULL DEFAULT 'PENDING',
    "notification_sent" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asset_revisions" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "uploader_id" INTEGER NOT NULL,
    "description" TEXT,
    "phase1_approvals" INTEGER NOT NULL DEFAULT 0,
    "phase1_rejections" INTEGER NOT NULL DEFAULT 0,
    "phase1_total_votes" INTEGER NOT NULL DEFAULT 0,
    "phase1_completed_at" TIMESTAMP(3),
    "phase2_approvals" INTEGER NOT NULL DEFAULT 0,
    "phase2_rejections" INTEGER NOT NULL DEFAULT 0,
    "phase2_total_votes" INTEGER NOT NULL DEFAULT 0,
    "phase2_completed_at" TIMESTAMP(3),
    "status" "public"."AssetStatus" NOT NULL DEFAULT 'PENDING',
    "notification_sent" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asset_votes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "vote" "public"."VoteType" NOT NULL,
    "phase" "public"."VotePhase" NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "asset_id" INTEGER,
    "asset_revision_id" INTEGER,

    CONSTRAINT "asset_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_asset_interactions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "asset_id" INTEGER,
    "asset_revision_id" INTEGER,
    "has_voted" BOOLEAN NOT NULL DEFAULT false,
    "has_commented" BOOLEAN NOT NULL DEFAULT false,
    "dismissed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "gameId" INTEGER,

    CONSTRAINT "user_asset_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asset_comments" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."revision_comments" (
    "id" SERIAL NOT NULL,
    "asset_revision_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "revision_comments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "teams_name_key" ON "public"."teams"("name");

-- CreateIndex
CREATE UNIQUE INDEX "invite_codes_code_key" ON "public"."invite_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "game_teams_game_id_team_id_key" ON "public"."game_teams"("game_id", "team_id");

-- CreateIndex
CREATE UNIQUE INDEX "game_owners_game_id_user_id_key" ON "public"."game_owners"("game_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "asset_votes_user_id_asset_id_phase_key" ON "public"."asset_votes"("user_id", "asset_id", "phase");

-- CreateIndex
CREATE UNIQUE INDEX "asset_votes_user_id_asset_revision_id_phase_key" ON "public"."asset_votes"("user_id", "asset_revision_id", "phase");

-- CreateIndex
CREATE UNIQUE INDEX "user_asset_interactions_user_id_asset_id_key" ON "public"."user_asset_interactions"("user_id", "asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_asset_interactions_user_id_asset_revision_id_key" ON "public"."user_asset_interactions"("user_id", "asset_revision_id");

-- AddForeignKey
ALTER TABLE "public"."invite_codes" ADD CONSTRAINT "invite_codes_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_teams" ADD CONSTRAINT "game_teams_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_teams" ADD CONSTRAINT "game_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_owners" ADD CONSTRAINT "game_owners_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."game_owners" ADD CONSTRAINT "game_owners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_invite_code_id_fkey" FOREIGN KEY ("invite_code_id") REFERENCES "public"."invite_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assets" ADD CONSTRAINT "assets_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."assets" ADD CONSTRAINT "assets_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_revisions" ADD CONSTRAINT "asset_revisions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_revisions" ADD CONSTRAINT "asset_revisions_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_votes" ADD CONSTRAINT "asset_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_votes" ADD CONSTRAINT "asset_votes_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_votes" ADD CONSTRAINT "asset_votes_asset_revision_id_fkey" FOREIGN KEY ("asset_revision_id") REFERENCES "public"."asset_revisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_asset_interactions" ADD CONSTRAINT "user_asset_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_asset_interactions" ADD CONSTRAINT "user_asset_interactions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_asset_interactions" ADD CONSTRAINT "user_asset_interactions_asset_revision_id_fkey" FOREIGN KEY ("asset_revision_id") REFERENCES "public"."asset_revisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_asset_interactions" ADD CONSTRAINT "user_asset_interactions_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "public"."games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_comments" ADD CONSTRAINT "asset_comments_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_comments" ADD CONSTRAINT "asset_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."revision_comments" ADD CONSTRAINT "revision_comments_asset_revision_id_fkey" FOREIGN KEY ("asset_revision_id") REFERENCES "public"."asset_revisions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."revision_comments" ADD CONSTRAINT "revision_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
