export interface WebhookAssetInfo {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
}

export interface WebhookNotificationResult {
  success: boolean;
  error?: string;
}

