/**
 * Help Modal Support Ticket Tests
 * Tests support ticket submission with SMTP and mailto fallback
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import HelpModal from "../../components/funding-wizard/HelpModal";

// Mock fetch globally
global.fetch = jest.fn();

describe("HelpModal - Support Ticket Submission", () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
  });

  describe("SMTP Email Path (Success)", () => {
    it("submits ticket and shows success message when SMTP configured", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "Support ticket submitted and sent via email.",
          ticket: {
            id: "TICKET-123",
            timestamp: "2024-01-01T00:00:00.000Z",
          },
        }),
      });

      render(
        <HelpModal
          isOpen={true}
          onClose={mockOnClose}
          context="GoFundMe Setup Issues"
          clientId="test-client-789"
        />,
      );

      // Select issue type
      const issueTypeSelect = screen.getByLabelText(/what.*help with/i);
      fireEvent.change(issueTypeSelect, {
        target: { value: "gofundme_blocked" },
      });

      // Enter description
      const descriptionTextarea = screen.getByLabelText(/describe.*problem/i);
      fireEvent.change(descriptionTextarea, {
        target: { value: "I cannot access my GoFundMe account after setup" },
      });

      // Optional: Enter email
      const emailInput = screen.getByLabelText(/email.*optional/i);
      fireEvent.change(emailInput, { target: { value: "user@example.com" } });

      // Submit form
      const submitButton = screen.getByRole("button", {
        name: /send.*message/i,
      });
      fireEvent.click(submitButton);

      // Verify API call
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/support/tickets",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: expect.stringContaining("gofundme_blocked"),
          }),
        );
      });

      // Verify success message displayed
      await waitFor(() => {
        expect(screen.getByText(/message received/i)).toBeInTheDocument();
        expect(screen.getByText(/workflown8n@gmail.com/i)).toBeInTheDocument();
      });
    });

    it("includes context and clientId in submission", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          ticket: { id: "TICKET-456", timestamp: new Date().toISOString() },
        }),
      });

      render(
        <HelpModal
          isOpen={true}
          onClose={mockOnClose}
          context="QR Code Generation Step"
          clientId="test-client-999"
        />,
      );

      const issueTypeSelect = screen.getByLabelText(/what.*help with/i);
      fireEvent.change(issueTypeSelect, { target: { value: "qr_problem" } });

      const descriptionTextarea = screen.getByLabelText(/describe.*problem/i);
      fireEvent.change(descriptionTextarea, {
        target: { value: "QR code is not displaying properly" },
      });

      const submitButton = screen.getByRole("button", {
        name: /send.*message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const callBody = JSON.parse(
        (global.fetch as jest.Mock).mock.calls[0][1].body,
      );
      expect(callBody.context).toBe("QR Code Generation Step");
      expect(callBody.clientId).toBe("test-client-999");
      expect(callBody.issueType).toBe("qr_problem");
    });
  });

  describe("SMTP Not Configured (Mailto Fallback)", () => {
    it("shows mailto fallback when SMTP not configured", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: "Support ticket saved locally.",
          ticket: {
            id: "TICKET-789",
            timestamp: "2024-01-01T00:00:00.000Z",
          },
          fallback: {
            mailto:
              "mailto:workflown8n@gmail.com?subject=Support%20Ticket%20TICKET-789&body=Issue%20details",
            instructions:
              "Click the link below to send via your default email client",
          },
        }),
      });

      render(
        <HelpModal
          isOpen={true}
          onClose={mockOnClose}
          context="Funding Wizard"
          clientId="test-client-fallback"
        />,
      );

      const issueTypeSelect = screen.getByLabelText(/what.*help with/i);
      fireEvent.change(issueTypeSelect, { target: { value: "other" } });

      const descriptionTextarea = screen.getByLabelText(/describe.*problem/i);
      fireEvent.change(descriptionTextarea, {
        target: { value: "General question about the funding process" },
      });

      const submitButton = screen.getByRole("button", {
        name: /send.*message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Verify fallback UI displayed
      await waitFor(() => {
        expect(screen.getByText(/email setup required/i)).toBeInTheDocument();
        expect(screen.getByText(/saved locally/i)).toBeInTheDocument();
      });

      // Verify mailto link exists
      const mailtoLink = screen.getByRole("link", { name: /open.*email/i });
      expect(mailtoLink).toHaveAttribute(
        "href",
        expect.stringContaining("mailto:workflown8n@gmail.com"),
      );
    });
  });

  describe("Validation", () => {
    it("requires description before submission", async () => {
      render(
        <HelpModal
          isOpen={true}
          onClose={mockOnClose}
          context="Test"
          clientId="test-validation"
        />,
      );

      const submitButton = screen.getByRole("button", {
        name: /send.*message/i,
      });

      // Try to submit with empty description
      fireEvent.click(submitButton);

      // Should not call API
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("requires issue type selection", async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          errors: [{ msg: "issueType is required" }],
        }),
      });

      render(
        <HelpModal
          isOpen={true}
          onClose={mockOnClose}
          context="Test"
          clientId="test-validation"
        />,
      );

      // Enter description but don't select issue type
      const descriptionTextarea = screen.getByLabelText(/describe.*problem/i);
      fireEvent.change(descriptionTextarea, {
        target: { value: "Some problem description" },
      });

      const submitButton = screen.getByRole("button", {
        name: /send.*message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/error|failed|problem/i)).toBeInTheDocument();
      });
    });

    it("validates email format when provided", async () => {
      render(
        <HelpModal
          isOpen={true}
          onClose={mockOnClose}
          context="Test"
          clientId="test-email-validation"
        />,
      );

      const issueTypeSelect = screen.getByLabelText(/what.*help with/i);
      fireEvent.change(issueTypeSelect, { target: { value: "other" } });

      const descriptionTextarea = screen.getByLabelText(/describe.*problem/i);
      fireEvent.change(descriptionTextarea, {
        target: { value: "Test description for email validation" },
      });

      // Enter invalid email
      const emailInput = screen.getByLabelText(/email.*optional/i);
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });

      // HTML5 validation should prevent submission or backend will reject
      // This test verifies the email field has type="email"
      expect(emailInput).toHaveAttribute("type", "email");
    });
  });

  describe("Error Handling", () => {
    it("shows error message on network failure", async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error"),
      );

      render(
        <HelpModal
          isOpen={true}
          onClose={mockOnClose}
          context="Test"
          clientId="test-error"
        />,
      );

      const issueTypeSelect = screen.getByLabelText(/what.*help with/i);
      fireEvent.change(issueTypeSelect, {
        target: { value: "transcription_problem" },
      });

      const descriptionTextarea = screen.getByLabelText(/describe.*problem/i);
      fireEvent.change(descriptionTextarea, {
        target: { value: "Transcription is not working correctly" },
      });

      const submitButton = screen.getByRole("button", {
        name: /send.*message/i,
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/error|problem|failed/i)).toBeInTheDocument();
      });
    });

    it("disables submit button while submitting", async () => {
      let resolveRequest: any;
      const requestPromise = new Promise((resolve) => {
        resolveRequest = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(requestPromise);

      render(
        <HelpModal
          isOpen={true}
          onClose={mockOnClose}
          context="Test"
          clientId="test-loading"
        />,
      );

      const issueTypeSelect = screen.getByLabelText(/what.*help with/i);
      fireEvent.change(issueTypeSelect, { target: { value: "other" } });

      const descriptionTextarea = screen.getByLabelText(/describe.*problem/i);
      fireEvent.change(descriptionTextarea, {
        target: { value: "Test loading state" },
      });

      const submitButton = screen.getByRole("button", {
        name: /send.*message/i,
      });

      // Button should be enabled initially
      expect(submitButton).not.toBeDisabled();

      fireEvent.click(submitButton);

      // Button should be disabled during submission
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      // Resolve the request
      resolveRequest({
        ok: true,
        json: async () => ({
          success: true,
          ticket: { id: "TICKET-LOAD", timestamp: new Date().toISOString() },
        }),
      });

      // After completion, success screen should show (with Close button)
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /close/i }),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Modal Behavior", () => {
    it("closes modal when onClose is called", () => {
      render(
        <HelpModal
          isOpen={true}
          onClose={mockOnClose}
          context="Test"
          clientId="test-close"
        />,
      );

      const closeButton = screen.getByRole("button", { name: /×|close/i });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("does not render when isOpen is false", () => {
      const { container } = render(
        <HelpModal
          isOpen={false}
          onClose={mockOnClose}
          context="Test"
          clientId="test-not-open"
        />,
      );

      // Modal should not be visible
      expect(container.querySelector(".modal")).toBeNull();
    });
  });
});
