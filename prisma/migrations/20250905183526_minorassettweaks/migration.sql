-- CreateTable
CREATE TABLE "public"."asset_final_review_teams" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "team_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_final_review_teams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asset_final_review_teams_asset_id_team_id_key" ON "public"."asset_final_review_teams"("asset_id", "team_id");

-- AddForeignKey
ALTER TABLE "public"."asset_final_review_teams" ADD CONSTRAINT "asset_final_review_teams_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_final_review_teams" ADD CONSTRAINT "asset_final_review_teams_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
