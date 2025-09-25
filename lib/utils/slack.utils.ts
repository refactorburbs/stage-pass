// Slack documentation: https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks

import { VotePhase, VoteType } from "@/app/generated/prisma";
import { WebhookAssetInfo, WebhookNotificationResult } from "../types/webhook.types";
import { CreateSlackBlockParams } from "../types/slack.types";

export async function sendSlackVoteResultNotification(
  asset: WebhookAssetInfo,
  phase: VotePhase,
  decision: VoteType,
  shouldMoveToPhase2: boolean
): Promise<WebhookNotificationResult> {
  const decisionText = decision === VoteType.APPROVE ? "Approved" : "Rejected";
  const decisionEmoji = decision === VoteType.APPROVE ? "✅" : "❌";
  const title = `${decisionEmoji} "${asset.title}" was *${decisionText}*.`;
  let actionRequired = true;

  // Generate description based on the following conditions:
  let description;
  if (decision === VoteType.APPROVE) {
    if (phase === VotePhase.PHASE1) {
      if (shouldMoveToPhase2) {
        description = "This asset has been approved internally and \n>has now been sent to external Game/IP owners for final review.";
        actionRequired = false;
      } else {
        description = "This asset piece has been approved internally \n>and is ready to be combined for a Full Asset submission.";
      }
    } else {
      description = "🎉 This asset has passed final approval! 🎉 \n>It is ready to be put in the game!!";
    }
  } else {
    if (phase === VotePhase.PHASE1) {
      description = "This asset was rejected during internal review. \n>Please create a new and improved submission."
    } else {
      description = "This asset was rejected by Game/IP Owners. \n>Please create a new Full Asset submission for internal review."
    }
  }

  const footerText = actionRequired ? "`ACTION REQUIRED`" : "";

  const payload = createSlackBlock ({
    title,
    description,
    footer: footerText,
    image: asset.imageUrl
  });

  const result = await sendSlackNotification(payload);
  return result;
}

export function createSlackBlock(params: CreateSlackBlockParams): string {
  const { title, description, footer, image } = params;
  const combinedText = `${title}\n\n>${description}\n\n${footer}`;
  const slackJSON = {
    "blocks": [
      {
        "type": "image",
        "image_url": image,
        "alt_text": "Asset Preview",
        "title": {
          "type": "plain_text",
          "text": "Asset Preview"
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": combinedText
        }
      }
    ]
  }
  return JSON.stringify(slackJSON);
}

export async function sendSlackNotification(payload: string): Promise<WebhookNotificationResult> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("Slack webhook URL environment variable is not configured");
    return { success: false, error: "Webhook URL not configured" };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`Slack API error: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}