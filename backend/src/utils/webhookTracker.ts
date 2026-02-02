type WebhookState = {
  lastWebhookReceivedAt?: string | null;
  lastWebhookEventType?: string | null;
  lastWebhookVerified?: boolean | null;
  lastWebhookError?: string | null;
};

const state: WebhookState = {
  lastWebhookReceivedAt: null,
  lastWebhookEventType: null,
  lastWebhookVerified: null,
  lastWebhookError: null,
};

export function updateWebhookReceived(eventType: string, verified: boolean, error?: string) {
  state.lastWebhookReceivedAt = new Date().toISOString();
  state.lastWebhookEventType = eventType || null;
  state.lastWebhookVerified = !!verified;
  state.lastWebhookError = error ? String(error).slice(0, 512) : null; // sanitize/limit
}

export function getWebhookState(): WebhookState {
  return { ...state };
}

export default { updateWebhookReceived, getWebhookState };
