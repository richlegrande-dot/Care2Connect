/**
 * Playwright-based crash capture for /onboarding/v2
 * Usage: node scripts/debug_onboarding_v2_client_error.mjs
 *
 * Captures page errors, console errors/warnings, and unhandled rejections
 * WITHOUT requiring browser DevTools access.
 */

import { chromium } from 'playwright';

const TARGET_URL = 'http://localhost:3000/onboarding/v2';
const WAIT_MS = 5000;

async function main() {
  const errors = [];
  const consoleMessages = [];

  console.log('[debug] Launching Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture uncaught page errors (thrown during render, hydration, etc.)
  page.on('pageerror', (err) => {
    const entry = `PAGEERROR: ${err.message}\n${err.stack || '(no stack)'}`;
    console.log(entry);
    errors.push(entry);
  });

  // Capture console.error and console.warn from the page
  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      const entry = `CONSOLE ${type.toUpperCase()}: ${msg.text()}`;
      console.log(entry);
      consoleMessages.push(entry);
    }
  });

  // Capture unhandled promise rejections
  page.on('pageerror', (err) => {
    // Already handled above, but log explicitly for unhandled rejections
  });

  console.log(`[debug] Navigating to ${TARGET_URL} ...`);

  try {
    const response = await page.goto(TARGET_URL, {
      waitUntil: 'networkidle',
      timeout: 15000,
    });
    console.log(`[debug] Navigation complete. HTTP status: ${response?.status()}`);
  } catch (navErr) {
    console.log(`[debug] Navigation error: ${navErr.message}`);
    errors.push(`NAVIGATION_ERROR: ${navErr.message}`);
  }

  // Wait additional time for any deferred errors (useEffect, lazy loading, etc.)
  console.log(`[debug] Waiting ${WAIT_MS}ms for deferred errors...`);
  await page.waitForTimeout(WAIT_MS);

  // Try to capture any error boundary content
  try {
    const errorBoundaryText = await page.$eval(
      '[data-testid="error-boundary"], .error-boundary, #v2-error-boundary',
      (el) => el.textContent
    );
    if (errorBoundaryText) {
      console.log(`[debug] Error boundary content: ${errorBoundaryText}`);
    }
  } catch {
    // No error boundary element found - that's fine
  }

  // Check if the Next.js generic error overlay is showing
  try {
    const nextErrorText = await page.$eval(
      '#__next-build-error, [data-nextjs-dialog]',
      (el) => el.textContent
    );
    if (nextErrorText) {
      console.log(`[debug] Next.js error overlay: ${nextErrorText}`);
    }
  } catch {
    // No Next.js error overlay
  }

  // Capture page title and body text for context
  const title = await page.title();
  const bodyText = await page.evaluate(() => {
    const body = document.querySelector('body');
    return body ? body.innerText.substring(0, 2000) : '(no body)';
  });

  console.log(`\n[debug] === SUMMARY ===`);
  console.log(`[debug] Page title: ${title}`);
  console.log(`[debug] Body preview (first 500 chars):\n${bodyText.substring(0, 500)}`);
  console.log(`[debug] Total pageerrors: ${errors.length}`);
  console.log(`[debug] Total console errors/warnings: ${consoleMessages.length}`);

  await browser.close();

  if (errors.length > 0) {
    console.log('\n[debug] FAIL - Page errors detected. See above for stacks.');
    process.exit(1);
  } else {
    console.log('\n[debug] PASS - No page errors detected.');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('[debug] Script failed:', err.message);
  process.exit(2);
});
