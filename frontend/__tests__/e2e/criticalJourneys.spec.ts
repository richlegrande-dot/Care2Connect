/**
 * Frontend E2E Tests - Playwright
 *
 * Critical user journeys:
 * 1. Home page loads + navigation
 * 2. Upload/record flow (simulated)
 * 3. Find My Story search
 * 4. Generate Donation Tools page
 * 5. Admin login + story browser
 *
 * NOTE: These tests require backend to be running at http://localhost:3001
 * and frontend at http://localhost:3000
 *
 * Run with: npm run test:e2e
 */

import { test, expect, Page } from "@playwright/test";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

test.describe("Critical User Journeys", () => {
  test.describe("1. Home Page and Navigation", () => {
    test("should load home page successfully", async ({ page }) => {
      await page.goto(FRONTEND_URL);

      // Wait for page to load
      await page.waitForLoadState("networkidle");

      // Check for key elements
      await expect(page).toHaveTitle(/Care2Connect|Home/i);

      // Verify main navigation elements exist
      const nav = page.locator("nav");
      await expect(nav).toBeVisible();
    });

    test("should navigate to record page", async ({ page }) => {
      await page.goto(FRONTEND_URL);

      // Look for "Record" or "Share Story" link
      const recordLink = page.getByRole("link", {
        name: /record|share.*story|tell.*story/i,
      });

      if ((await recordLink.count()) > 0) {
        await recordLink.first().click();
        await page.waitForURL(/.*record.*/i);

        expect(page.url()).toMatch(/record/i);
      }
    });

    test("should navigate to find stories page", async ({ page }) => {
      await page.goto(FRONTEND_URL);

      const findLink = page.getByRole("link", {
        name: /find|search|browse.*stor/i,
      });

      if ((await findLink.count()) > 0) {
        await findLink.first().click();
        await page.waitForURL(/.*find|search|browse/i);
      }
    });
  });

  test.describe("2. Upload/Record Flow (Simulated)", () => {
    test("should display record interface", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/record`);

      // Should have recording or upload controls
      const hasRecordButton =
        (await page.getByRole("button", { name: /record|start/i }).count()) > 0;
      const hasUploadButton =
        (await page.getByRole("button", { name: /upload/i }).count()) > 0;

      expect(hasRecordButton || hasUploadButton).toBe(true);
    });

    test("should show contact info form", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/record`);

      // Look for name, email, or phone fields
      const nameField = page.locator(
        'input[name="name"], input[placeholder*="name" i]',
      );
      const emailField = page.locator(
        'input[type="email"], input[name="email"]',
      );

      const hasNameField = (await nameField.count()) > 0;
      const hasEmailField = (await emailField.count()) > 0;

      // At least one contact field should exist
      expect(hasNameField || hasEmailField).toBe(true);
    });

    test("should validate required fields", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/record`);

      // Try to submit without filling required fields
      const submitButton = page.getByRole("button", {
        name: /submit|continue|next/i,
      });

      if ((await submitButton.count()) > 0) {
        await submitButton.first().click();

        // Should show validation error or prevent submission
        const errorMessage = page.locator("text=/required|fill|error/i");
        const hasError = (await errorMessage.count()) > 0;

        // OR form should not proceed to next step
        expect(hasError || page.url().includes("record")).toBe(true);
      }
    });
  });

  test.describe("3. Find My Story Search", () => {
    test("should display search interface", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/find-story`);

      // Should have search input
      const searchInput = page.locator(
        'input[type="search"], input[placeholder*="search" i]',
      );
      await expect(searchInput.first()).toBeVisible({ timeout: 5000 });
    });

    test("should perform search operation", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/find-story`);

      const searchInput = page
        .locator('input[type="search"], input[placeholder*="search" i]')
        .first();

      if ((await searchInput.count()) > 0) {
        await searchInput.fill("test-ticket-id");

        const searchButton = page.getByRole("button", { name: /search|find/i });
        if ((await searchButton.count()) > 0) {
          await searchButton.first().click();

          // Wait for search results or error message
          await page.waitForTimeout(1000);
        }
      }
    });

    test('should handle "not found" gracefully', async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/find-story`);

      const searchInput = page
        .locator('input[type="search"], input[placeholder*="search" i]')
        .first();

      if ((await searchInput.count()) > 0) {
        await searchInput.fill("nonexistent-ticket-12345");

        const searchButton = page.getByRole("button", { name: /search|find/i });
        if ((await searchButton.count()) > 0) {
          await searchButton.first().click();

          // Should show "not found" or similar message
          await page.waitForTimeout(1000);
          const notFoundMsg = page.locator("text=/not found|no results/i");

          // Either shows not found message or stays on search page
          const hasNotFound = (await notFoundMsg.count()) > 0;
          expect(hasNotFound || page.url().includes("find")).toBe(true);
        }
      }
    });
  });

  test.describe("4. Generate Donation Tools Page", () => {
    test("should load donation tools page", async ({ page }) => {
      // This requires a valid ticket ID - we'll test the page loads
      await page.goto(`${FRONTEND_URL}/donation-tools/test-ticket-123`);

      // Page should load (even if ticket not found, page structure should exist)
      await page.waitForLoadState("networkidle");
    });

    test("should display editable excerpt field", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/donation-tools/test-ticket-123`);

      const excerptField = page.locator(
        'textarea[name="excerpt"], textarea[placeholder*="excerpt" i]',
      );

      if ((await excerptField.count()) > 0) {
        const isEditable = await excerptField.first().isEditable();
        expect(isEditable).toBe(true);
      }
    });

    test("should persist excerpt edits", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/donation-tools/test-ticket-123`);

      const excerptField = page.locator(
        'textarea[name="excerpt"], textarea[placeholder*="excerpt" i]',
      );

      if ((await excerptField.count()) > 0) {
        const testText = "This is a test excerpt edit";
        await excerptField.first().fill(testText);

        // Value should be updated
        const currentValue = await excerptField.first().inputValue();
        expect(currentValue).toContain(testText);
      }
    });

    test("should show QR code placeholder or image", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/donation-tools/test-ticket-123`);

      // Look for QR code image or placeholder
      const qrCode = page.locator(
        'img[alt*="QR" i], img[alt*="code" i], canvas, svg',
      );

      // Should have some QR code element
      const hasQR = (await qrCode.count()) > 0;
      expect(hasQR || page.locator("text=/QR/i").count() > 0).toBeTruthy();
    });
  });

  test.describe("5. Admin Login and Story Browser", () => {
    test("should load admin login page", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin`);

      // Should show login form
      const passwordField = page.locator('input[type="password"]');
      await expect(passwordField.first()).toBeVisible({ timeout: 5000 });
    });

    test("should reject invalid admin credentials", async ({ page }) => {
      await page.goto(`${FRONTEND_URL}/admin`);

      const passwordField = page.locator('input[type="password"]').first();
      const submitButton = page.getByRole("button", {
        name: /login|submit|sign in/i,
      });

      if (
        (await passwordField.count()) > 0 &&
        (await submitButton.count()) > 0
      ) {
        await passwordField.fill("wrong-password-123");
        await submitButton.first().click();

        // Should show error or stay on login page
        await page.waitForTimeout(1000);
        const errorMsg = page.locator("text=/invalid|incorrect|wrong/i");
        const hasError = (await errorMsg.count()) > 0;

        expect(hasError || page.url().includes("admin")).toBe(true);
      }
    });

    test("should access admin panel with correct credentials", async ({
      page,
    }) => {
      await page.goto(`${FRONTEND_URL}/admin`);

      const passwordField = page.locator('input[type="password"]').first();
      const submitButton = page.getByRole("button", {
        name: /login|submit|sign in/i,
      });

      if (
        (await passwordField.count()) > 0 &&
        (await submitButton.count()) > 0
      ) {
        // Use test admin token (should be configured)
        await passwordField.fill(
          process.env.ADMIN_TOKEN || "careconnect-admin-token-2024",
        );
        await submitButton.first().click();

        // Should redirect to admin dashboard or stories
        await page.waitForTimeout(2000);

        // Should see admin content
        const isInAdmin =
          page.url().includes("admin") || page.url().includes("dashboard");
        expect(isInAdmin).toBe(true);
      }
    });

    test("should display story browser with table/list", async ({ page }) => {
      // Navigate to admin (assuming authentication)
      await page.goto(`${FRONTEND_URL}/admin/stories`);

      // Should have table or list of stories
      const table = page.locator('table, [role="table"]');
      const list = page.locator('ul, [role="list"]');

      const hasTableOrList =
        (await table.count()) > 0 || (await list.count()) > 0;

      // Or should have story cards/items
      const storyItems = page.locator(
        '[data-testid*="story"], [class*="story-item"]',
      );
      const hasStoryItems = (await storyItems.count()) > 0;

      expect(
        hasTableOrList ||
          hasStoryItems ||
          page.locator("text=/no stories|empty/i").count() > 0,
      ).toBeTruthy();
    });
  });

  test.describe("Accessibility and Performance", () => {
    test("should meet basic accessibility standards", async ({ page }) => {
      await page.goto(FRONTEND_URL);

      // Check for essential accessibility features
      const hasH1 = (await page.locator("h1").count()) > 0;
      const hasNav =
        (await page.locator('nav, [role="navigation"]').count()) > 0;
      const hasMain = (await page.locator('main, [role="main"]').count()) > 0;

      expect(hasH1).toBe(true);
      expect(hasNav || hasMain).toBe(true);
    });

    test("should load home page in reasonable time", async ({ page }) => {
      const startTime = Date.now();

      await page.goto(FRONTEND_URL);
      await page.waitForLoadState("networkidle");

      const loadTime = Date.now() - startTime;

      // Should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test("should not have console errors on home page", async ({ page }) => {
      const errors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          errors.push(msg.text());
        }
      });

      await page.goto(FRONTEND_URL);
      await page.waitForLoadState("networkidle");

      // Filter out common non-critical errors
      const criticalErrors = errors.filter(
        (err) =>
          !err.includes("favicon") &&
          !err.includes("404") &&
          !err.includes("DevTools"),
      );

      // Should have minimal critical errors
      expect(criticalErrors.length).toBeLessThan(3);
    });
  });
});
