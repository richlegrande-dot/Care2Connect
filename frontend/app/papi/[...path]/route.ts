/**
 * Provider API Proxy -- same-origin cookie relay
 *
 * Proxies /papi/* -> http://localhost:3001/api/v2/provider/*
 *
 * Lives at /papi/* (not /api/provider/*) because next.config.js rewrites
 * all /api/* requests directly to the backend, bypassing App Router routes.
 *
 * Forwards Set-Cookie headers back to the browser on the frontend origin,
 * solving the cross-origin cookie issue between care2connects.org (frontend)
 * and api.care2connects.org (backend).
 *
 * Hardening (deploy-guardrails):
 *   - 8 s AbortController timeout (prevents infinite hang if backend dies)
 *   - X-C2C-Proxy / X-C2C-Request-Id / X-C2C-Upstream headers for tracing
 *   - All error responses guaranteed JSON with requestId
 */

import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

// Backend base URL (server-side only -- never exposed to browser)
const BACKEND =
  process.env.BACKEND_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ??
  "http://localhost:3001";

/** Upstream timeout in milliseconds */
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

    console.log(
      `[papi proxy] ${req.method} ${backendUrl} rid=${requestId}`,
    );

    // Forward the browser cookie to the backend
    const cookieHeader = req.headers.get("cookie") ?? "";

    // 8 s abort controller -- prevents infinite hang if backend is down
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      UPSTREAM_TIMEOUT_MS,
    );

    const init: RequestInit = {
      method: req.method,
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-c2c-proxy": "papi",
        "x-c2c-request-id": requestId,
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
      },
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      try {
        const text = await req.text();
        if (text) init.body = text;
      } catch {
        // no body -- ok
      }
    }

    const upstream = await fetch(backendUrl, init);
    clearTimeout(timer);

    const body = await upstream.text();

    const res = new NextResponse(body, {
      status: upstream.status,
      headers: {
        "content-type": "application/json",
        "x-c2c-request-id": requestId,
        "x-c2c-upstream": String(upstream.status),
      },
    });

    // Relay Set-Cookie from backend -> browser (rewrite to frontend origin)
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
    const isTimeout =
      err instanceof DOMException && err.name === "AbortError";

    console.error(
      `[papi proxy] ${isTimeout ? "TIMEOUT" : "Fatal error"} rid=${requestId}:`,
      message,
    );

    return NextResponse.json(
      {
        error: isTimeout ? "Upstream timeout" : "Proxy error",
        detail: message,
        requestId,
      },
      {
        status: isTimeout ? 504 : 502,
        headers: { "x-c2c-request-id": requestId },
      },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
