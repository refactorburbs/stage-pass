import { VotePhase, VoteType } from "@/app/generated/prisma";
import {
  CreateDiscordEmbedParams,
  DiscordAssetInfo,
  DiscordEmbed,
  DiscordNotificationResult,
  DiscordWebhookPayload,
  SendDiscordNotifcationOptions
} from "../types/discord.types";

export async function sendDiscordVoteResultNotification(
  asset: DiscordAssetInfo,
  phase: VotePhase,
  decision: VoteType,
  shouldMoveToPhase2: boolean
): Promise<DiscordNotificationResult> {
  const now = new Date();
  const decisionText = decision === VoteType.APPROVE ? "Approved" : "Rejected";
  const decisionEmoji = decision === VoteType.APPROVE ? "✅" : "❌";
  const color = decision === VoteType.APPROVE ? 0x00ff00 : 0xff0000;
  const title = `${decisionEmoji} "${asset.title}" was **${decisionText}**.`;
  let actionRequired = true;

  // Generate description based on the following conditions:
  let description;
  if (decision === VoteType.APPROVE) {
    if (phase === VotePhase.PHASE1) {
      if (shouldMoveToPhase2) {
        description = "This asset has been approved internally and has now been sent to external Game/IP owners for final review.";
        actionRequired = false;
      } else {
        description = "This asset piece has been approved internally and is ready to be combined for a Full Asset submission.";
      }
    } else {
      description = "🎉 This asset has passed final approval! It is ready to be put in the game!! 🎉";
    }
  } else {
    if (phase === VotePhase.PHASE1) {
      description = "This asset was rejected during internal review. Please create a new and improved submission."
    } else {
      description = "This asset was rejected by Game/IP Owners. Please create a new Full Asset submission for internal review."
    }
  }

  const footerText = `${decisionText} on ${now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  })} ${actionRequired ? "- ACTION REQUIRED" : ""}`;

  const embed = createDiscordEmbed({
    title,
    description,
    color,
    footer: footerText,
    thumbnailUrl: asset.imageUrl
  });

  const result = await sendDiscordNotification("", { embeds: [embed] });
  return result;
}

export function createDiscordEmbed(params: CreateDiscordEmbedParams): DiscordEmbed {
  const {
    title,
    description,
    color = 0xffff00, // Yellow by default
    fields = [],
    footer,
    imageUrl,
    thumbnailUrl
  } = params;

  const embed: DiscordEmbed = {
    title,
    description,
    color,
    fields
  }

  if (footer) {
    embed.footer = { text: footer };
  }

  if (imageUrl) {
    embed.image = { url: imageUrl };
  }

  if (thumbnailUrl) {
    embed.thumbnail = { url: thumbnailUrl };
  }

  return embed;
}

export async function sendDiscordNotification(
  message: string,
  options: SendDiscordNotifcationOptions = {}
): Promise<DiscordNotificationResult> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.error("Discord webhook URL environment variable is not configured");
    return { success: false, error: "Webhook URL not configured" };
  }

  try {
    const payload: DiscordWebhookPayload = {
      content: message,
      username: options.username || "StagePass Notification Bot",
      avatar_url: options.avatarUrl,
      embeds: options.embeds || [],
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send Discord notification:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}