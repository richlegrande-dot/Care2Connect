/**
 * Word Export Integration Tests
 * Tests GoFundMeDraftStep and PrintKitStep Word document download
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import GoFundMeDraftStep from "../../components/funding-wizard/GoFundMeDraftStep";
import PrintKitStep from "../../components/funding-wizard/PrintKitStep";

// Mock fetch globally
global.fetch = jest.fn();

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement to track download behavior
const mockClick = jest.fn();
const originalCreateElement = document.createElement.bind(document);
document.createElement = jest.fn((tagName: string) => {
  const element = originalCreateElement(tagName);
  if (tagName === "a") {
    element.click = mockClick;
  }
  return element;
}) as any;

describe("Word Export - GoFundMeDraftStep", () => {
  const mockOnComplete = jest.fn();
  const mockData = {
    clientName: "John Doe",
    story: "Medical emergency story",
    totalNeed: "5000",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    mockClick.mockReset();
    (global.URL.createObjectURL as jest.Mock).mockClear();
    (global.URL.revokeObjectURL as jest.Mock).mockClear();
  });

  it("downloads Word document when button clicked", async () => {
    const mockBlob = new Blob(["mock docx content"], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      blob: jest.fn().mockResolvedValue(mockBlob),
    });

    render(
      <GoFundMeDraftStep
        clientId="test-client-123"
        data={mockData}
        onComplete={mockOnComplete}
        onBack={jest.fn()}
        onHelp={jest.fn()}
      />,
    );

    const downloadButton = screen.getByRole("button", {
      name: /download.*\.docx/i,
    });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/export/word/test-client-123",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: expect.any(String),
        }),
      );
    });

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockClick).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });
  });

  it("shows error state on download failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(
      <GoFundMeDraftStep
        clientId="test-client-123"
        data={mockData}
        onComplete={mockOnComplete}
        onBack={jest.fn()}
        onHelp={jest.fn()}
      />,
    );

    const downloadButton = screen.getByRole("button", {
      name: /download.*\.docx/i,
    });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Verify URL.createObjectURL was NOT called on failure
    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    expect(mockClick).not.toHaveBeenCalled();
  });

  it("handles network errors gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error"),
    );

    render(
      <GoFundMeDraftStep
        clientId="test-client-123"
        data={mockData}
        onComplete={mockOnComplete}
        onBack={jest.fn()}
        onHelp={jest.fn()}
      />,
    );

    const downloadButton = screen.getByRole("button", {
      name: /download.*\.docx/i,
    });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Should not trigger download on error
    expect(global.URL.createObjectURL).not.toHaveBeenCalled();
    expect(mockClick).not.toHaveBeenCalled();
  });

  it("disables button while downloading", async () => {
    const mockBlob = new Blob(["mock docx content"]);

    // Create a promise we can control
    let resolveBlob: any;
    const blobPromise = new Promise((resolve) => {
      resolveBlob = resolve;
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      blob: jest.fn().mockReturnValue(blobPromise),
    });

    render(
      <GoFundMeDraftStep
        clientId="test-client-123"
        data={mockData}
        onComplete={mockOnComplete}
        onBack={jest.fn()}
        onHelp={jest.fn()}
      />,
    );

    const downloadButton = screen.getByRole("button", {
      name: /download.*\.docx/i,
    });

    // Button should be enabled initially
    expect(downloadButton).not.toBeDisabled();

    fireEvent.click(downloadButton);

    // Button should be disabled during download
    await waitFor(() => {
      expect(downloadButton).toBeDisabled();
    });

    // Resolve the blob promise
    resolveBlob(mockBlob);

    // Button should be enabled again after download
    await waitFor(() => {
      expect(downloadButton).not.toBeDisabled();
    });
  });
});

describe("Word Export - PrintKitStep", () => {
  const mockOnComplete = jest.fn();
  const mockData = {
    clientName: "Jane Smith",
    story: "Community support needed",
    totalNeed: "10000",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockReset();
    mockClick.mockReset();
    (global.URL.createObjectURL as jest.Mock).mockClear();
    (global.URL.revokeObjectURL as jest.Mock).mockClear();
  });

  it("downloads Word document from PrintKitStep", async () => {
    const mockBlob = new Blob(["mock docx content"], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      blob: jest.fn().mockResolvedValue(mockBlob),
    });

    render(
      <PrintKitStep
        clientId="test-client-456"
        data={{ ...mockData, qrCodeUrl: "data:image/png;base64,mock" }}
        onComplete={mockOnComplete}
        onBack={jest.fn()}
        onHelp={jest.fn()}
      />,
    );

    const downloadButton = screen.getByRole("button", {
      name: /download.*\.docx/i,
    });
    fireEvent.click(downloadButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/export/word/test-client-456",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }),
      );
    });

    await waitFor(() => {
      expect(mockClick).toHaveBeenCalled();
    });
  });

  it('includes Word doc in "Download All" action', async () => {
    const mockBlob = new Blob(["mock docx content"]);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      blob: jest.fn().mockResolvedValue(mockBlob),
    });

    render(
      <PrintKitStep
        clientId="test-client-456"
        data={{ ...mockData, qrCodeUrl: "data:image/png;base64,mock" }}
        onComplete={mockOnComplete}
        onBack={jest.fn()}
        onHelp={jest.fn()}
      />,
    );

    // Find and click "Download All" button
    const downloadAllButton = screen.getByRole("button", {
      name: /download all files/i,
    });
    fireEvent.click(downloadAllButton);

    // Should trigger Word export fetch
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/export/word/test-client-456",
        expect.any(Object),
      );
    });
  });
});
