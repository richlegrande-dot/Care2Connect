import { test, expect, Page } from "@playwright/test";

// Mock audio recording for tests
async function mockAudioRecording(page: Page) {
  await page.addInitScript(() => {
    // Mock MediaRecorder
    class MockMediaRecorder {
      static isTypeSupported() {
        return true;
      }

      constructor(stream: MediaStream) {
        this.stream = stream;
        this.state = "inactive";
      }

      start() {
        this.state = "recording";
        if (this.onstart) this.onstart({} as Event);

        // Simulate data after a short delay
        setTimeout(() => {
          if (this.ondataavailable) {
            const mockBlob = new Blob(["mock audio data"], {
              type: "audio/wav",
            });
            this.ondataavailable({ data: mockBlob } as BlobEvent);
          }
        }, 100);
      }

      stop() {
        this.state = "inactive";
        if (this.onstop) this.onstop({} as Event);
      }

      ondataavailable: ((event: BlobEvent) => void) | null = null;
      onstart: ((event: Event) => void) | null = null;
      onstop: ((event: Event) => void) | null = null;
      stream: MediaStream;
      state: string;
    }

    (window as any).MediaRecorder = MockMediaRecorder;

    // Mock getUserMedia
    navigator.mediaDevices.getUserMedia = async () => {
      return {
        getTracks: () => [{ stop: () => {}, kind: "audio" }],
      } as MediaStream;
    };
  });
}

test.describe("Complete Demo Flow", () => {
  test.beforeEach(async ({ page }) => {
    await mockAudioRecording(page);
  });

  test("Complete happy path: Record → Extract → Review → Donate", async ({
    page,
  }) => {
    // Start at the main page
    await page.goto("/");

    // Step 1: Recording Interface
    await expect(page.getByText(/press.*record/i)).toBeVisible();

    // Mock API responses for this test
    await page.route("/api/transcription", async (route) => {
      await route.fulfill({
        json: {
          success: true,
          transcript:
            "I am John Smith from California. I need $5000 to help with medical expenses after my cancer diagnosis. The treatment costs are overwhelming and I need community support.",
          processingMethod: "audio",
        },
      });
    });

    await page.route("/api/story-extraction", async (route) => {
      await route.fulfill({
        json: {
          success: true,
          draft: {
            name: { value: "John Smith", confidence: 0.95 },
            location: {
              value: {
                country: "United States",
                state: "California",
                city: "",
                zip: "",
              },
              confidence: 0.8,
            },
            category: { value: "Medical", confidence: 0.9 },
            goalAmount: { value: 5000, confidence: 0.85 },
            title: {
              value: "Help John Smith with Cancer Treatment",
              confidence: 0.8,
            },
            storyBody: {
              value: "I am facing overwhelming medical expenses...",
              confidence: 0.9,
            },
            shortSummary: {
              value: "Support for cancer treatment costs",
              confidence: 0.8,
            },
            beneficiary: { value: "myself", confidence: 0.9 },
            contact: { value: { email: "", phone: "" }, confidence: 0.0 },
            missingFields: ["contact"],
            followUpQuestions: [
              {
                field: "contact",
                question: "What is the best email to contact you?",
                context: "This helps donors and GoFundMe reach you.",
                suggestions: [],
              },
            ],
            consentToPublish: false,
            transcript: "Full transcript here...",
            extractedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          },
        },
      });
    });

    // Click record button
    await page.getByRole("button", { name: /start recording|record/i }).click();

    // Wait for recording to start
    await expect(page.getByText(/recording/i)).toBeVisible();
    await expect(page.getByText(/00:0/)).toBeVisible();

    // Stop recording after a moment
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: /stop/i }).click();

    // Wait for processing
    await expect(page.getByText(/processing/i)).toBeVisible();

    // Should navigate to extraction page automatically
    await expect(page).toHaveURL(/\/gfm\/extract/);

    // Step 2: Story extraction page
    await expect(page.getByText(/analyzing your story/i)).toBeVisible();

    // Wait for extraction to complete
    await expect(page.getByText(/John Smith/)).toBeVisible();
    await expect(page.getByText(/Medical/)).toBeVisible();
    await expect(page.getByText(/\$5,000/)).toBeVisible();

    // Should show follow-up questions
    await expect(page.getByText(/follow-up questions/i)).toBeVisible();

    // Answer the follow-up question
    await page.getByRole("textbox").fill("john.smith@email.com");
    await page.getByRole("button", { name: /finish|complete/i }).click();

    // Proceed to review
    await page.getByRole("button", { name: /continue to review/i }).click();

    // Step 3: Review page
    await expect(page).toHaveURL(/\/gfm\/review/);

    // Mock the QR generation and donation setup
    await page.route("/api/qr", async (route) => {
      await route.fulfill({
        json: {
          success: true,
          qrCode:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
          donationUrl: "https://donate.example.com/john-smith-campaign",
          slug: "john-smith-campaign",
        },
      });
    });

    // Verify all fields are populated
    await expect(page.getByText("John Smith")).toBeVisible();
    await expect(page.getByText("john.smith@email.com")).toBeVisible();
    await expect(page.getByText("$5,000")).toBeVisible();
    await expect(
      page.getByText("Help John Smith with Cancer Treatment"),
    ).toBeVisible();

    // Generate QR code
    await page.getByRole("button", { name: /generate qr code/i }).click();

    // Should show QR code
    await expect(page.getByAltText(/qr code/i)).toBeVisible();
    await expect(page.getByText(/scan to donate/i)).toBeVisible();

    // Step 4: Export Word document
    await page.route("/api/exports/gofundme-docx", async (route) => {
      const mockDocBuffer = Buffer.from("mock document content");
      await route.fulfill({
        body: mockDocBuffer,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": 'attachment; filename="GoFundMe_Draft.docx"',
        },
      });
    });

    // Export document
    await page.getByRole("button", { name: /export.*document/i }).click();

    // Should initiate download (can't verify actual download in Playwright easily, but can verify the request)

    // Step 5: Visit donation page
    await page.goto("/donate/john-smith-campaign");

    // Mock Stripe checkout session
    await page.route("/api/donations/checkout", async (route) => {
      await route.fulfill({
        json: {
          success: true,
          checkoutUrl: "https://checkout.stripe.com/pay/mock-session",
        },
      });
    });

    // Should show donation interface
    await expect(
      page.getByText(/Help John Smith with Cancer Treatment/i),
    ).toBeVisible();
    await expect(
      page.getByText(/Support for cancer treatment costs/i),
    ).toBeVisible();

    // Test donation amounts
    await page.getByRole("button", { name: "$25" }).click();
    await expect(page.getByDisplayValue("25")).toBeVisible();

    // Test custom amount
    const customAmountInput = page.getByLabelText(/custom amount/i);
    await customAmountInput.fill("100");

    // Proceed to checkout
    await page.getByRole("button", { name: /donate now/i }).click();

    // Should redirect to Stripe (mocked)
    await expect(page).toHaveURL(/checkout\.stripe\.com/);
  });

  test("Fallback flow: Manual input when recording fails", async ({ page }) => {
    await page.goto("/");

    // Mock transcription failure
    await page.route("/api/transcription", async (route) => {
      await route.fulfill({
        status: 500,
        json: {
          success: false,
          error: "Transcription service unavailable",
        },
      });
    });

    // Try recording first
    await page.getByRole("button", { name: /start recording|record/i }).click();
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: /stop/i }).click();

    // Should offer manual input
    await expect(page.getByText(/couldn't process/i)).toBeVisible();
    await expect(
      page.getByRole("button", { name: /type manually/i }),
    ).toBeVisible();

    // Switch to manual input
    await page.getByRole("button", { name: /type manually/i }).click();

    // Should show text area
    await expect(page.getByRole("textbox")).toBeVisible();

    // Mock successful manual processing
    await page.route("/api/transcription", async (route) => {
      await route.fulfill({
        json: {
          success: true,
          transcript: "Manual input story about needing help",
          processingMethod: "manual",
        },
      });
    });

    // Type story manually
    await page
      .getByRole("textbox")
      .fill(
        "I am Sarah from Texas and I need help with housing costs after losing my job.",
      );

    // Submit manual story
    await page.getByRole("button", { name: /analyze story/i }).click();

    // Should proceed to extraction
    await expect(page).toHaveURL(/\/gfm\/extract/);
  });

  test("Error handling: Network failures and retries", async ({ page }) => {
    await page.goto("/");

    // Mock network failure followed by success
    let requestCount = 0;
    await page.route("/api/transcription", async (route) => {
      requestCount++;
      if (requestCount === 1) {
        // First request fails
        await route.abort("failed");
      } else {
        // Second request succeeds
        await route.fulfill({
          json: {
            success: true,
            transcript: "Retry successful story",
            processingMethod: "manual",
          },
        });
      }
    });

    // Switch to manual input
    await page
      .getByRole("button", { name: /type story|manual input/i })
      .click();
    await page.getByRole("textbox").fill("Test story for retry");

    // Submit - first attempt should fail
    await page.getByRole("button", { name: /analyze story/i }).click();

    // Should show error and retry option
    await expect(page.getByText(/connection error/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /retry/i })).toBeVisible();

    // Retry should succeed
    await page.getByRole("button", { name: /retry/i }).click();

    // Should navigate to extraction page
    await expect(page).toHaveURL(/\/gfm\/extract/);
  });

  test("Accessibility: Keyboard navigation and screen reader support", async ({
    page,
  }) => {
    await page.goto("/");

    // Test keyboard navigation
    await page.keyboard.press("Tab"); // Should focus record button
    await expect(
      page.getByRole("button", { name: /start recording|record/i }),
    ).toBeFocused();

    // Test ARIA labels
    const recordButton = page.getByRole("button", {
      name: /start recording|record/i,
    });
    await expect(recordButton).toHaveAttribute("aria-label");

    // Test focus management during state changes
    await recordButton.click();

    // Stop button should be focusable
    await page.keyboard.press("Tab");
    const stopButton = page.getByRole("button", { name: /stop/i });
    await expect(stopButton).toBeFocused();

    // Test skip to manual input via keyboard
    await page.keyboard.press("Escape"); // Should cancel recording
    await page.keyboard.press("Tab"); // Navigate to manual option
    await page.keyboard.press("Enter"); // Should activate manual input

    const textArea = page.getByRole("textbox");
    await expect(textArea).toBeFocused();
    await expect(textArea).toHaveAttribute("aria-label");
  });

  test("Data protection: Sensitive information handling", async ({ page }) => {
    await page.goto("/");

    // Mock API with data protection checks
    await page.route("/api/transcription", async (route) => {
      const body = await route.request().postData();
      const data = JSON.parse(body || "{}");

      // Simulate backend data protection
      if (data.transcript?.includes("123-45-6789")) {
        await route.fulfill({
          json: {
            success: false,
            error:
              "Story contains sensitive information (SSN). Please remove personal identifiers and try again.",
            sensitiveDataDetected: true,
          },
        });
      } else {
        await route.fulfill({
          json: {
            success: true,
            transcript: data.transcript,
            processingMethod: "manual",
          },
        });
      }
    });

    // Switch to manual input
    await page.getByRole("button", { name: /type story/i }).click();

    // Enter story with SSN
    await page
      .getByRole("textbox")
      .fill("My SSN is 123-45-6789 and I need help.");
    await page.getByRole("button", { name: /analyze story/i }).click();

    // Should show data protection error
    await expect(page.getByText(/sensitive information/i)).toBeVisible();
    await expect(page.getByText(/SSN/i)).toBeVisible();

    // Fix the story
    await page.getByRole("textbox").fill("I need help with medical expenses.");
    await page.getByRole("button", { name: /analyze story/i }).click();

    // Should proceed successfully
    await expect(page).toHaveURL(/\/gfm\/extract/);
  });
});
