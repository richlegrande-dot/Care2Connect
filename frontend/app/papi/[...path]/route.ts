/**
 * Provider API Proxy — same-origin cookie relay
 *
 * Proxies /papi/* → http://localhost:3001/api/v2/provider/*
 *
 * Lives at /papi/* (not /api/provider/*) because next.config.js rewrites
 * all /api/* requests directly to the backend, bypassing App Router routes.
 *
 * Forwards Set-Cookie headers back to the browser on the frontend origin,
 * solving the cross-origin cookie issue between care2connects.org (frontend)
 * and api.care2connects.org (backend).
 *
 * Hardening (deploy-process, Feb 2026):
 *   - AbortController 8s timeout → JSON 502 on hang (not opaque HTML 500)
 *   - X-C2C-Proxy / X-C2C-RequestId response headers for tracing
 *   - X-C2C-Upstream exposes host (no secrets) for diagnostics
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// Backend base URL (server-side only — never exposed to browser)
const BACKEND =
  process.env.BACKEND_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ??
  "http://localhost:3001";

// Upstream fetch timeout (ms). If the backend does not respond in this window,
// the proxy returns a JSON 502 instead of hanging until Next.js kills the request.
const UPSTREAM_TIMEOUT_MS = 8_000;

async function proxy(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const requestId = randomUUID();

  try {
    const pathSegments = params.path ?? [];
    const pathStr = pathSegments.join("/");

    // Forward query string
    const qs = req.nextUrl.search ?? "";
    const backendUrl = `${BACKEND}/api/v2/provider/${pathStr}${qs}`;

    // Extract host for diagnostic header (no credentials, no path)
    const backendHost = (() => {
      try { return new URL(BACKEND).host; } catch { return "unknown"; }
    })();

    console.log(`[papi proxy] ${req.method} ${backendUrl} requestId=${requestId}`);

    // Forward the browser cookie to the backend
    const cookieHeader = req.headers.get("cookie") ?? "";

    // AbortController gives us a hard timeout on the upstream fetch
    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    const init: RequestInit = {
      method: req.method,
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      try {
        const text = await req.text();
        if (text) init.body = text;
      } catch {
        // no body — ok
      }
    }

    let upstream: Response;
    try {
      upstream = await fetch(backendUrl, init);
    } catch (fetchErr: unknown) {
      clearTimeout(timeoutHandle);
      const isTimeout =
        fetchErr instanceof Error &&
        (fetchErr.name === "AbortError" || fetchErr.message.includes("abort"));
      const message = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      const status = isTimeout ? 504 : 502;
      const error = isTimeout
        ? `Upstream timeout after ${UPSTREAM_TIMEOUT_MS}ms`
        : "Upstream fetch failed";
      console.error(`[papi proxy] ${error}: ${message} requestId=${requestId}`);
      return NextResponse.json(
        { error, detail: message, requestId },
        {
          status,
          headers: {
            "X-C2C-Proxy": "papi",
            "X-C2C-RequestId": requestId,
            "X-C2C-Upstream": backendHost,
          },
        },
      );
    }
    clearTimeout(timeoutHandle);

    const body = await upstream.text();

    const res = new NextResponse(body, {
      status: upstream.status,
      headers: {
        "content-type": "application/json",
        // Diagnostic headers — safe to expose (no secrets)
        "X-C2C-Proxy": "papi",
        "X-C2C-RequestId": requestId,
        "X-C2C-Upstream": backendHost,
      },
    });

    // Relay Set-Cookie from backend → browser (rewrite to frontend origin)
    // Node.js native fetch merges duplicate Set-Cookie into one comma-separated
    // value, so we split carefully before cleaning each directive.
    const rawSetCookie = upstream.headers.get("set-cookie");
    if (rawSetCookie) {
      const cookies = rawSetCookie.split(/,(?=[^\s])/);
      for (const c of cookies) {
        const cleaned = c
          .replace(/;\s*domain=[^;]*/gi, "")
          .replace(/;\s*secure/gi, "")
          .replace(/;\s*samesite=\w+/gi, "; SameSite=Lax");
        res.headers.append("set-cookie", cleaned);
      }
    }

    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[papi proxy] Fatal error: ${message} requestId=${requestId}`);
    return NextResponse.json(
      { error: "Proxy error", detail: message, requestId },
      {
        status: 502,
        headers: {
          "X-C2C-Proxy": "papi",
          "X-C2C-RequestId": requestId,
        },
      },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
