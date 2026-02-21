import { GoFundMeDraft, FollowUpAnswer } from "../schemas/gofundmeDraft.schema";

export interface FollowUpSession {
  draftId: string;
  userId: string;
  currentQuestionIndex: number;
  answers: FollowUpAnswer[];
  completedAt?: Date;
  createdAt: Date;
}

export class FollowUpMergeService {
  private sessions: Map<string, FollowUpSession> = new Map();

  /**
   * Start a new follow-up session
   */
  startSession(draftId: string, userId: string): string {
    const sessionId = `session_${draftId}_${Date.now()}`;

    const session: FollowUpSession = {
      draftId,
      userId,
      currentQuestionIndex: 0,
      answers: [],
      createdAt: new Date(),
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * Get current question for session
   */
  getCurrentQuestion(sessionId: string, draft: GoFundMeDraft) {
    const session = this.sessions.get(sessionId);
    if (!session || !draft.followUpQuestions) return null;

    if (session.currentQuestionIndex >= draft.followUpQuestions.length) {
      return null; // No more questions
    }

    return draft.followUpQuestions[session.currentQuestionIndex];
  }

  /**
   * Submit answer and move to next question
   */
  submitAnswer(sessionId: string, answer: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    // Store the answer
    const currentQuestion = session.currentQuestionIndex;
    session.answers.push({
      field: `question_${currentQuestion}`, // Will be mapped to actual field later
      answer,
      confidence: 1.0, // Manual answers have high confidence
    });

    // Move to next question
    session.currentQuestionIndex++;

    return true;
  }

  /**
   * Complete session and return all answers
   */
  completeSession(sessionId: string): FollowUpAnswer[] | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    session.completedAt = new Date();
    const answers = [...session.answers];

    // Clean up session
    this.sessions.delete(sessionId);

    return answers;
  }

  /**
   * Merge answers into draft with proper field mapping
   */
  mergeAnswersIntoDraft(
    draft: GoFundMeDraft,
    answers: Array<{ field: string; answer: string }>,
  ): GoFundMeDraft {
    const updatedDraft = JSON.parse(JSON.stringify(draft)); // Deep clone

    for (const answer of answers) {
      const fieldPath = answer.field.split(".");
      const parsedValue = this.parseAnswerByField(answer.field, answer.answer);

      // Update the field in draft
      this.setNestedField(updatedDraft, fieldPath, {
        value: parsedValue,
        confidence: 1.0,
        source: "followup",
      });
    }

    // Recalculate missing fields
    updatedDraft.missingFields = this.checkMissingFields(updatedDraft);
    updatedDraft.followUpQuestions =
      updatedDraft.missingFields.length > 0
        ? this.generateFollowUpQuestions(updatedDraft.missingFields)
        : [];
    updatedDraft.lastUpdated = new Date();

    return updatedDraft;
  }

  /**
   * Set nested field value
   */
  private setNestedField(obj: any, path: string[], value: any) {
    const lastKey = path.pop()!;
    const target = path.reduce((current, key) => {
      if (!current[key]) current[key] = {};
      return current[key];
    }, obj);

    target[lastKey] = value;
  }

  /**
   * Parse answer based on field type
   */
  private parseAnswerByField(field: string, answer: string): any {
    switch (field) {
      case "goalAmount":
        const amount = parseFloat(answer.replace(/[^\d.]/g, ""));
        return isNaN(amount) ? null : amount;

      case "dateOfBirth":
        // Validate MM/DD/YYYY format
        const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        if (dateRegex.test(answer.trim())) {
          return answer.trim();
        }
        return null;

      case "location.zip":
      case "zip":
        // Extract 5-digit ZIP
        const zipMatch = answer.match(/\d{5}/);
        return zipMatch ? zipMatch[0] : answer.trim();

      case "category":
        const validCategories = [
          "Medical",
          "Emergency",
          "Memorial",
          "Education",
          "Nonprofit",
          "Housing",
          "Animal",
          "Environment",
          "Community",
          "Sports",
          "Creative",
          "Travel",
          "Family",
          "Business",
          "Dreams",
          "Faith",
          "Competitions",
          "Other",
        ];

        const matchedCategory = validCategories.find(
          (cat) => cat.toLowerCase() === answer.toLowerCase(),
        );
        return matchedCategory || "Other";

      case "beneficiary":
        const beneficiaryMap: Record<string, string> = {
          myself: "myself",
          me: "myself",
          self: "myself",
          "someone else": "someone-else",
          "another person": "someone-else",
          charity: "charity",
          organization: "charity",
        };

        const normalizedAnswer = answer.toLowerCase();
        return beneficiaryMap[normalizedAnswer] || "myself";

      default:
        return answer.trim();
    }
  }

  /**
   * Check which fields are still missing
   */
  private checkMissingFields(draft: GoFundMeDraft): string[] {
    const requiredFields = [
      "name",
      "dateOfBirth",
      "location.zip",
      "category",
      "goalAmount",
      "title",
      "storyBody",
      "shortSummary",
    ];

    const missing: string[] = [];

    for (const field of requiredFields) {
      const value = this.getNestedFieldValue(draft, field.split("."));
      if (
        !value ||
        (typeof value === "object" && (!value.value || value.confidence < 0.3))
      ) {
        missing.push(field);
      }
    }

    return missing;
  }

  /**
   * Get nested field value
   */
  private getNestedFieldValue(obj: any, path: string[]): any {
    return path.reduce((current, key) => current?.[key], obj);
  }

  /**
   * Generate follow-up questions for remaining missing fields
   */
  private generateFollowUpQuestions(missingFields: string[]) {
    const questionMap: Record<
      string,
      {
        question: string;
        type: "text" | "select" | "number" | "date";
        options?: string[];
      }
    > = {
      name: {
        question: "What name would you like to use for your campaign?",
        type: "text",
      },
      dateOfBirth: {
        question: "What is your date of birth? (MM/DD/YYYY)",
        type: "date",
      },
      "location.zip": {
        question: "What ZIP code are you currently in?",
        type: "text",
      },
      category: {
        question: "Which category best fits your situation?",
        type: "select",
        options: [
          "Medical",
          "Emergency",
          "Housing",
          "Education",
          "Family",
          "Community",
          "Memorial",
          "Animal",
          "Creative",
          "Travel",
          "Sports",
          "Business",
          "Dreams",
          "Faith",
          "Nonprofit",
          "Other",
        ],
      },
      goalAmount: {
        question: "What is your fundraising goal amount in dollars?",
        type: "number",
      },
      title: {
        question: "What title would you like for your campaign?",
        type: "text",
      },
      shortSummary: {
        question:
          "Can you provide a brief summary of your story in 1-2 sentences?",
        type: "text",
      },
    };

    return missingFields
      .map((field) => {
        const questionData = questionMap[field];
        if (questionData) {
          return {
            field,
            question: questionData.question,
            type: questionData.type,
            options: questionData.options,
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  /**
   * Get session progress
   */
  getSessionProgress(
    sessionId: string,
    totalQuestions: number,
  ): { current: number; total: number; percentage: number } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      current: session.currentQuestionIndex,
      total: totalQuestions,
      percentage: Math.round(
        (session.currentQuestionIndex / totalQuestions) * 100,
      ),
    };
  }
}

export default FollowUpMergeService;
