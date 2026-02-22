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
 */

import { NextRequest, NextResponse } from "next/server";

// Backend base URL (server-side only — never exposed to browser)
const BACKEND =
  process.env.BACKEND_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ??
  "http://localhost:3001";

async function proxy(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  try {
    const pathSegments = params.path ?? [];
    const pathStr = pathSegments.join("/");

    // Forward query string
    const qs = req.nextUrl.search ?? "";
    const backendUrl = `${BACKEND}/api/v2/provider/${pathStr}${qs}`;

    console.log(`[papi proxy] ${req.method} ${backendUrl}`);

    // Forward the browser cookie to the backend
    const cookieHeader = req.headers.get("cookie") ?? "";

    const init: RequestInit = {
      method: req.method,
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

    const upstream = await fetch(backendUrl, init);
    const body = await upstream.text();

    const res = new NextResponse(body, {
      status: upstream.status,
      headers: { "content-type": "application/json" },
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
    console.error(`[papi proxy] Fatal error:`, message);
    return NextResponse.json(
      { error: "Proxy error", detail: message },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
