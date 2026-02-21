/**
 * Provider API Proxy — same-origin cookie relay
 *
 * Proxies /api/provider/* → http://localhost:3001/api/v2/provider/*
 * and forwards Set-Cookie headers back to the browser on the frontend
 * origin, solving the cross-origin cookie issue between care2connects.org
 * (frontend) and api.care2connects.org (backend).
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, "") ?? "http://localhost:3001";

async function proxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join("/");
  const backendUrl = `${BACKEND}/api/v2/provider/${path}`;

  // Forward the browser cookie to the backend
  const cookieHeader = req.headers.get("cookie") ?? "";

  const init: RequestInit = {
    method: req.method,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    try {
      init.body = await req.text();
    } catch {
      // no body
    }
  }

  const upstream = await fetch(backendUrl, init);
  const body = await upstream.text();

  const res = new NextResponse(body, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });

  // Relay Set-Cookie from backend → browser (rewrite to frontend origin)
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      // Strip domain/secure so cookie works on localhost too
      const cleaned = value
        .replace(/;\s*domain=[^;]*/gi, "")
        .replace(/;\s*secure/gi, "")
        .replace(/;\s*samesite=\w+/gi, "; SameSite=Lax");
      res.headers.append("Set-Cookie", cleaned);
    }
  });

  return res;
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
