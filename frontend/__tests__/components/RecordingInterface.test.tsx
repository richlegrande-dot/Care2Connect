import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecordingInterface } from "@/components/RecordingInterface";

// Mock the MediaRecorder API
global.MediaRecorder = class MockMediaRecorder {
  static isTypeSupported = jest.fn(() => true);

  start = jest.fn();
  stop = jest.fn();
  pause = jest.fn();
  resume = jest.fn();

  state = "inactive";
  stream = {} as MediaStream;

  ondataavailable = null;
  onstart = null;
  onstop = null;
  onerror = null;

  addEventListener = jest.fn();
  removeEventListener = jest.fn();
  dispatchEvent = jest.fn();
} as any;

// Mock getUserMedia
Object.defineProperty(navigator, "mediaDevices", {
  writable: true,
  value: {
    getUserMedia: jest.fn(() =>
      Promise.resolve({
        getTracks: () => [
          {
            stop: jest.fn(),
            kind: "audio",
            label: "Mock Audio Track",
          },
        ],
      } as MediaStream),
    ),
  },
});

// Mock fetch for API calls
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("RecordingInterface Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    // Ensure getUserMedia returns the default successful mock for every test
    (navigator.mediaDevices.getUserMedia as jest.Mock).mockImplementation(() =>
      Promise.resolve({
        getTracks: () => [
          { stop: jest.fn(), kind: "audio", label: "Mock Audio Track" },
        ],
      } as MediaStream),
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("Initial State", () => {
    it("should render the record button in inactive state", () => {
      render(<RecordingInterface />);

      const recordButton = screen.getByRole("button", {
        name: /start recording|record/i,
      });
      expect(recordButton).toBeInTheDocument();
      expect(recordButton).not.toBeDisabled();
    });

    it("should show instructions for recording", () => {
      render(<RecordingInterface />);

      expect(screen.getByText(/press.*record/i)).toBeInTheDocument();
      expect(screen.getByText(/tell your story/i)).toBeInTheDocument();
    });

    it("should not show transcription area initially", () => {
      render(<RecordingInterface />);

      expect(screen.queryByText(/transcription/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/processing/i)).not.toBeInTheDocument();
    });
  });

  describe("Recording Flow", () => {
    it("should start recording when button is clicked", async () => {
      const user = userEvent.setup();
      render(<RecordingInterface />);

      const recordButton = screen.getByRole("button", {
        name: /start recording|record/i,
      });
      await user.click(recordButton);

      await waitFor(() => {
        expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
          audio: true,
        });
      });

      expect(screen.getByText(/recording/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
    });

    it("should show recording duration timer", async () => {
      const user = userEvent.setup();
      render(<RecordingInterface />);

      const recordButton = screen.getByRole("button", {
        name: /start recording|record/i,
      });
      await user.click(recordButton);

      await waitFor(() => {
        expect(screen.getByText(/00:00/)).toBeInTheDocument();
      });
    });

    it("should handle microphone permission denial", async () => {
      // Mock permission denial
      (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValue(
        new Error("Permission denied"),
      );

      const user = userEvent.setup();
      render(<RecordingInterface />);

      const recordButton = screen.getByRole("button", {
        name: /start recording|record/i,
      });
      await user.click(recordButton);

      await waitFor(() => {
        expect(screen.getByText(/microphone access/i)).toBeInTheDocument();
        expect(screen.getByText(/permission/i)).toBeInTheDocument();
      });
    });
  });

  describe("Stop Recording and Processing", () => {
    it("should stop recording and process audio", async () => {
      const user = userEvent.setup();

      // Use a deferred promise so we can assert on the processing state
      // before the fetch resolves
      let resolveFetch: (value: any) => void;
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve;
      });

      mockFetch.mockReturnValue(fetchPromise as Promise<Response>);

      render(<RecordingInterface />);

      // Start recording
      const recordButton = screen.getByRole("button", {
        name: /start recording|record/i,
      });
      await user.click(recordButton);

      await waitFor(() => {
        expect(screen.getByText(/recording/i)).toBeInTheDocument();
      });

      // Stop recording
      const stopButton = screen.getByRole("button", { name: /stop/i });
      await user.click(stopButton);

      // While fetch is pending, the UI should show processing state
      await waitFor(() => {
        expect(screen.getByText(/processing/i)).toBeInTheDocument();
      });

      // Now resolve the fetch to complete the flow
      resolveFetch!({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            transcript:
              "Hello, this is my story about needing help with housing.",
            processingMethod: "audio",
          }),
      } as Response);
    });

    it("should show transcription after processing", async () => {
      const user = userEvent.setup();

      const mockTranscript =
        "I need help with medical expenses for my cancer treatment.";
      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            transcript: mockTranscript,
            processingMethod: "audio",
          }),
      } as Response);

      render(<RecordingInterface />);

      // Complete recording flow
      const recordButton = screen.getByRole("button", {
        name: /start recording|record/i,
      });
      await user.click(recordButton);

      await waitFor(() => {
        const stopButton = screen.getByRole("button", { name: /stop/i });
        user.click(stopButton);
      });

      await waitFor(() => {
        expect(screen.getByText(mockTranscript)).toBeInTheDocument();
      });

      expect(screen.getByText(/transcription complete/i)).toBeInTheDocument();
    });

    it("should provide option to continue with manual input on API failure", async () => {
      const user = userEvent.setup();

      // Mock API failure
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () =>
          Promise.resolve({
            success: false,
            error: "Transcription service unavailable",
          }),
      } as Response);

      render(<RecordingInterface />);

      // Complete recording flow
      const recordButton = screen.getByRole("button", {
        name: /start recording|record/i,
      });
      await user.click(recordButton);

      await waitFor(() => {
        const stopButton = screen.getByRole("button", { name: /stop/i });
        user.click(stopButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/couldn't process/i)).toBeInTheDocument();
        expect(screen.getByText(/type your story/i)).toBeInTheDocument();
      });

      // Should show manual input option
      expect(
        screen.getByRole("button", { name: /type manually/i }),
      ).toBeInTheDocument();
    });
  });

  describe("Manual Input Mode", () => {
    it("should switch to manual input when requested", async () => {
      const user = userEvent.setup();
      render(<RecordingInterface />);

      // Look for manual input toggle
      const manualButton = screen.getByRole("button", { name: /type story/i });
      await user.click(manualButton);

      expect(screen.getByRole("textbox")).toBeInTheDocument();
      expect(screen.getByText(/type your story/i)).toBeInTheDocument();
    });

    it("should handle manual text input", async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            transcript: "My typed story here",
            processingMethod: "manual",
          }),
      } as Response);

      render(<RecordingInterface />);

      // Switch to manual mode
      const manualButton = screen.getByRole("button", { name: /type story/i });
      await user.click(manualButton);

      // Type in the text area
      const textArea = screen.getByRole("textbox");
      await user.type(textArea, "My typed story here");

      // Submit the text
      const submitButton = screen.getByRole("button", {
        name: /analyze story/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/transcription",
          expect.objectContaining({
            method: "POST",
            body: expect.stringContaining("My typed story here"),
          }),
        );
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors gracefully", async () => {
      const user = userEvent.setup();

      // Mock network error
      mockFetch.mockRejectedValue(new Error("Network error"));

      render(<RecordingInterface />);

      // Switch to manual and submit
      const manualButton = screen.getByRole("button", { name: /type story/i });
      await user.click(manualButton);

      const textArea = screen.getByRole("textbox");
      await user.type(textArea, "Test story");

      const submitButton = screen.getByRole("button", {
        name: /analyze story/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/connection error/i)).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /retry/i }),
        ).toBeInTheDocument();
      });
    });

    it("should provide retry functionality", async () => {
      const user = userEvent.setup();

      // First call fails, second succeeds
      mockFetch
        .mockRejectedValueOnce(new Error("Network error"))
        .mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              transcript: "Retry successful",
              processingMethod: "manual",
            }),
        } as Response);

      render(<RecordingInterface />);

      // Switch to manual and submit
      const manualButton = screen.getByRole("button", { name: /type story/i });
      await user.click(manualButton);

      const textArea = screen.getByRole("textbox");
      await user.type(textArea, "Test story");

      const submitButton = screen.getByRole("button", {
        name: /analyze story/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/connection error/i)).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole("button", { name: /retry/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText("Retry successful")).toBeInTheDocument();
      });
    });
  });

  describe("Demo Readiness Features", () => {
    it("should always provide a path forward even on failures", async () => {
      const user = userEvent.setup();

      // Mock complete failure
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () =>
          Promise.resolve({
            success: false,
            error: "All services unavailable",
          }),
      } as Response);

      render(<RecordingInterface />);

      // Try recording
      const recordButton = screen.getByRole("button", {
        name: /start recording|record/i,
      });
      await user.click(recordButton);

      await waitFor(() => {
        const stopButton = screen.getByRole("button", { name: /stop/i });
        user.click(stopButton);
      });

      // Should still offer manual input
      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /type manually/i }),
        ).toBeInTheDocument();
      });
    });

    it("should show progress indicators during all operations", async () => {
      const user = userEvent.setup();

      // Mock slow response
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: () =>
                    Promise.resolve({
                      success: true,
                      transcript: "Delayed response",
                      processingMethod: "manual",
                    }),
                } as Response),
              1000,
            ),
          ),
      );

      render(<RecordingInterface />);

      const manualButton = screen.getByRole("button", { name: /type story/i });
      await user.click(manualButton);

      const textArea = screen.getByRole("textbox");
      await user.type(textArea, "Test story");

      const submitButton = screen.getByRole("button", {
        name: /analyze story/i,
      });
      await user.click(submitButton);

      // Should show loading state immediately
      expect(screen.getByText(/processing/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });
});
