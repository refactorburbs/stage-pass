-- DropIndex
DROP INDEX "public"."assets_title_key";

-- CreateTable
CREATE TABLE "public"."AssetPendingLock" (
    "id" SERIAL NOT NULL,
    "voteType" "public"."VoteType" NOT NULL,
    "currentPhase" "public"."VotePhase" NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetPendingLock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetPendingLock_asset_id_key" ON "public"."AssetPendingLock"("asset_id");

-- AddForeignKey
ALTER TABLE "public"."AssetPendingLock" ADD CONSTRAINT "AssetPendingLock_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssetPendingLock" ADD CONSTRAINT "AssetPendingLock_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
