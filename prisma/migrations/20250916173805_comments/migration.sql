-- CreateEnum
CREATE TYPE "public"."SubscriptionType" AS ENUM ('VOTED', 'COMMENTED');

-- CreateTable
CREATE TABLE "public"."AssetComment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."asset_subscriptions" (
    "id" SERIAL NOT NULL,
    "asset_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "subscription_type" "public"."SubscriptionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pending_comment_notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "comment_id" INTEGER NOT NULL,
    "is_dismissed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_comment_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "asset_subscriptions_asset_id_user_id_key" ON "public"."asset_subscriptions"("asset_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pending_comment_notifications_user_id_comment_id_key" ON "public"."pending_comment_notifications"("user_id", "comment_id");

-- AddForeignKey
ALTER TABLE "public"."AssetComment" ADD CONSTRAINT "AssetComment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssetComment" ADD CONSTRAINT "AssetComment_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_subscriptions" ADD CONSTRAINT "asset_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."asset_subscriptions" ADD CONSTRAINT "asset_subscriptions_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pending_comment_notifications" ADD CONSTRAINT "pending_comment_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pending_comment_notifications" ADD CONSTRAINT "pending_comment_notifications_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."AssetComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
