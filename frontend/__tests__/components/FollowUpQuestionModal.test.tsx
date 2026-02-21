import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FollowUpQuestionModal from "@/components/FollowUpQuestionModal";

const mockFollowUpQuestions = [
  {
    field: "goalAmount",
    question: "How much money do you need to raise?",
    context: "You mentioned needing help but didn't specify an amount.",
    suggestions: ["$1,000", "$5,000", "$10,000", "$25,000"],
  },
  {
    field: "title",
    question: "What would you like to title your campaign?",
    context: "A good title helps people understand your situation quickly.",
    suggestions: [
      "Help [Name] with Medical Bills",
      "Support [Name]'s Recovery",
      "Emergency Fund for [Name]",
    ],
  },
];

const mockDraft = {
  name: { value: "John Smith", confidence: 0.9 },
  storyBody: { value: "I need help with medical expenses", confidence: 0.8 },
  category: { value: "Medical", confidence: 0.7 },
  goalAmount: { value: null, confidence: 0.0 },
  title: { value: null, confidence: 0.0 },
  missingFields: ["goalAmount", "title"],
  followUpQuestions: mockFollowUpQuestions,
  extractedAt: new Date(),
  lastUpdated: new Date(),
};

describe("FollowUpQuestionModal Component", () => {
  const mockOnComplete = jest.fn();
  const mockOnSkip = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    isOpen: true,
    questions: mockFollowUpQuestions,
    currentDraft: mockDraft,
    onComplete: mockOnComplete,
    onSkip: mockOnSkip,
    onClose: mockOnClose,
  };

  describe("Modal Rendering", () => {
    it("should render when open", () => {
      render(<FollowUpQuestionModal {...defaultProps} />);

      expect(screen.getByText(/follow-up questions/i)).toBeInTheDocument();
      expect(screen.getByText(/improve your campaign/i)).toBeInTheDocument();
    });

    it("should not render when closed", () => {
      render(<FollowUpQuestionModal {...defaultProps} isOpen={false} />);

      expect(
        screen.queryByText(/follow-up questions/i),
      ).not.toBeInTheDocument();
    });

    it("should display question progress", () => {
      render(<FollowUpQuestionModal {...defaultProps} />);

      expect(screen.getByText("1 of 2")).toBeInTheDocument();
    });

    it("should show the first question by default", () => {
      render(<FollowUpQuestionModal {...defaultProps} />);

      expect(
        screen.getByText(mockFollowUpQuestions[0].question),
      ).toBeInTheDocument();
      expect(
        screen.getByText(mockFollowUpQuestions[0].context),
      ).toBeInTheDocument();
    });
  });

  describe("Question Navigation", () => {
    it("should navigate to next question when answered", async () => {
      const user = userEvent.setup();
      render(<FollowUpQuestionModal {...defaultProps} />);

      // Answer first question
      const input = screen.getByRole("textbox");
      await user.type(input, "5000");

      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);

      // Should show second question
      expect(
        screen.getByText(mockFollowUpQuestions[1].question),
      ).toBeInTheDocument();
      expect(screen.getByText("2 of 2")).toBeInTheDocument();
    });

    it("should show finish button on last question", async () => {
      const user = userEvent.setup();
      render(<FollowUpQuestionModal {...defaultProps} />);

      // Navigate to last question
      const input = screen.getByRole("textbox");
      await user.type(input, "5000");

      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);

      // Should show finish button
      expect(
        screen.getByRole("button", { name: /finish/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /next/i }),
      ).not.toBeInTheDocument();
    });

    it("should allow going back to previous questions", async () => {
      const user = userEvent.setup();
      render(<FollowUpQuestionModal {...defaultProps} />);

      // Go to second question
      const input = screen.getByRole("textbox");
      await user.type(input, "5000");

      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);

      // Go back
      const backButton = screen.getByRole("button", { name: /back/i });
      await user.click(backButton);

      // Should be back to first question
      expect(
        screen.getByText(mockFollowUpQuestions[0].question),
      ).toBeInTheDocument();
      expect(screen.getByText("1 of 2")).toBeInTheDocument();
    });
  });

  describe("Answer Input Methods", () => {
    it("should accept typed answers", async () => {
      const user = userEvent.setup();
      render(<FollowUpQuestionModal {...defaultProps} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "7500");

      expect(input).toHaveValue("7500");
    });

    it("should show suggestion buttons", () => {
      render(<FollowUpQuestionModal {...defaultProps} />);

      // Should show suggestions for first question
      mockFollowUpQuestions[0].suggestions?.forEach((suggestion) => {
        expect(
          screen.getByRole("button", { name: suggestion }),
        ).toBeInTheDocument();
      });
    });

    it("should populate input when suggestion is clicked", async () => {
      const user = userEvent.setup();
      render(<FollowUpQuestionModal {...defaultProps} />);

      const suggestionButton = screen.getByRole("button", { name: "$5,000" });
      await user.click(suggestionButton);

      const input = screen.getByRole("textbox");
      expect(input).toHaveValue("$5,000");
    });

    it("should handle dynamic suggestions with placeholders", async () => {
      const user = userEvent.setup();
      render(<FollowUpQuestionModal {...defaultProps} />);

      // Navigate to title question
      const input = screen.getByRole("textbox");
      await user.type(input, "5000");

      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);

      // Should show suggestions with name replaced
      expect(
        screen.getByRole("button", {
          name: "Help John Smith with Medical Bills",
        }),
      ).toBeInTheDocument();
    });
  });

  describe("Answer Validation", () => {
    it("should validate numeric input for goalAmount", async () => {
      const user = userEvent.setup();
      render(<FollowUpQuestionModal {...defaultProps} />);

      const input = screen.getByRole("textbox");
      await user.type(input, "not a number");

      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);

      // Should show error and not advance
      expect(
        screen.getByText(/please enter a valid amount/i),
      ).toBeInTheDocument();
      expect(screen.getByText("1 of 2")).toBeInTheDocument(); // Still on first question
    });

    it("should require non-empty answers", async () => {
      const user = userEvent.setup();
      render(<FollowUpQuestionModal {...defaultProps} />);

      // Try to proceed without answering
      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);

      expect(screen.getByText(/please provide an answer/i)).toBeInTheDocument();
    });

    it("should clear validation errors when valid input is provided", async () => {
      const user = userEvent.setup();
      render(<FollowUpQuestionModal {...defaultProps} />);

      const input = screen.getByRole("textbox");

      // Enter invalid input
      await user.type(input, "invalid");
      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);

      expect(
        screen.getByText(/please enter a valid amount/i),
      ).toBeInTheDocument();

      // Fix the input
      await user.clear(input);
      await user.type(input, "5000");

      // Error should clear
      expect(
        screen.queryByText(/please enter a valid amount/i),
      ).not.toBeInTheDocument();
    });
  });

  describe("Modal Actions", () => {
    it("should call onComplete with answers when finished", async () => {
      const user = userEvent.setup();
      render(<FollowUpQuestionModal {...defaultProps} />);

      // Answer first question
      let input = screen.getByRole("textbox");
      await user.type(input, "5000");

      let nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);

      // Answer second question
      input = screen.getByRole("textbox");
      await user.type(input, "Help John with Medical Emergency");

      const finishButton = screen.getByRole("button", { name: /finish/i });
      await user.click(finishButton);

      expect(mockOnComplete).toHaveBeenCalledWith({
        goalAmount: "5000",
        title: "Help John with Medical Emergency",
      });
    });

    it("should call onSkip when skip is clicked", async () => {
      const user = userEvent.setup();
      render(<FollowUpQuestionModal {...defaultProps} />);

      const skipButton = screen.getByRole("button", { name: /skip/i });
      await user.click(skipButton);

      expect(mockOnSkip).toHaveBeenCalled();
    });

    it("should call onClose when close button is clicked", async () => {
      const user = userEvent.setup();
      render(<FollowUpQuestionModal {...defaultProps} />);

      const closeButton = screen.getByRole("button", { name: /close/i });
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should handle escape key to close", async () => {
      const user = userEvent.setup();
      render(<FollowUpQuestionModal {...defaultProps} />);

      await user.keyboard("{Escape}");

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty questions array", () => {
      render(<FollowUpQuestionModal {...defaultProps} questions={[]} />);

      expect(screen.getByText(/no questions available/i)).toBeInTheDocument();
    });

    it("should handle questions without suggestions", () => {
      const questionsWithoutSuggestions = [
        {
          field: "custom",
          question: "Tell us more about your situation",
          context: "Any additional details would be helpful",
        },
      ];

      render(
        <FollowUpQuestionModal
          {...defaultProps}
          questions={questionsWithoutSuggestions}
        />,
      );

      expect(screen.getByRole("textbox")).toBeInTheDocument();
      // Should not show suggestion buttons
      expect(screen.queryByText("Suggestions:")).not.toBeInTheDocument();
    });

    it("should preserve answers when navigating back and forth", async () => {
      const user = userEvent.setup();
      render(<FollowUpQuestionModal {...defaultProps} />);

      // Answer first question
      const input1 = screen.getByRole("textbox");
      await user.type(input1, "7500");

      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);

      // Answer second question
      const input2 = screen.getByRole("textbox");
      await user.type(input2, "Custom Title");

      // Go back
      const backButton = screen.getByRole("button", { name: /back/i });
      await user.click(backButton);

      // First answer should be preserved
      const input1Again = screen.getByRole("textbox");
      expect(input1Again).toHaveValue("7500");

      // Go forward again
      const nextAgain = screen.getByRole("button", { name: /next/i });
      await user.click(nextAgain);

      // Second answer should be preserved
      const input2Again = screen.getByRole("textbox");
      expect(input2Again).toHaveValue("Custom Title");
    });
  });
});
