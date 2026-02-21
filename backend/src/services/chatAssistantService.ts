/**
 * Chat Assistant Service (Stub)
 * Provides conversation support
 */

export class ChatAssistantService {
  async generateResponse(
    conversationHistory: any[],
    userMessage: string,
    context?: any,
  ): Promise<string> {
    return "This is a stub response. Chat assistant not implemented yet.";
  }

  async generateFollowUpQuestions(
    conversationHistory: any[],
    context?: any,
  ): Promise<string[]> {
    return [
      "Can you tell me more about your situation?",
      "What is your fundraising goal?",
      "Who will this campaign help?",
    ];
  }

  async generateConversationStarters(profile?: any): Promise<string[]> {
    return [
      "Tell me about your fundraising campaign",
      "What challenges are you facing?",
      "How can I help you today?",
    ];
  }
}
