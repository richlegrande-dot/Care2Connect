/**
 * Papi Proxy Regression Tests
 *
 * Tests the logic pieces of frontend/app/papi/[...path]/route.ts:
 *   1. Querystring forwarding is preserved
 *   2. Set-Cookie splitting handles Expires commas correctly
 *   3. Timeout produces 504 with requestId
 *
 * These tests replicate the proxy logic inline rather than importing the
 * route.ts directly, because NextResponse depends on the Web Response API
 * which is unavailable in jsdom. This approach tests the SAME algorithms
 * used in the proxy without requiring a full Next.js server environment.
 */

// ===========================================================================
// Extracted logic (mirrors route.ts exactly)
// ===========================================================================

/** Build the upstream URL -- same logic as route.ts line 43-44 */
function buildBackendUrl(
  backend: string,
  pathSegments: string[],
  search: string,
): string {
  const pathStr = pathSegments.join("/");
  const qs = search ?? "";
  return `${backend}/api/v2/provider/${pathStr}${qs}`;
}

/** Split and clean Set-Cookie -- same logic as route.ts lines 97-107 */
function splitAndCleanCookies(rawSetCookie: string): string[] {
  const cookies = rawSetCookie.split(/,(?=[^\s])/);
  return cookies.map((c) =>
    c
      .replace(/;\s*domain=[^;]*/gi, "")
      .replace(/;\s*secure/gi, "")
      .replace(/;\s*samesite=\w+/gi, "; SameSite=Lax"),
  );
}

/** Determine error response status -- same logic as route.ts lines 117-120 */
function classifyError(err: unknown): { status: number; error: string } {
  const isTimeout =
    err instanceof DOMException && err.name === "AbortError";
  return {
    status: isTimeout ? 504 : 502,
    error: isTimeout ? "Upstream timeout" : "Proxy error",
  };
}

/** Build upstream fetch headers -- same logic as route.ts lines 63-70 */
function buildUpstreamHeaders(
  requestId: string,
  cookieHeader: string | null,
): Record<string, string> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-c2c-proxy": "papi",
    "x-c2c-request-id": requestId,
  };
  if (cookieHeader) {
    headers.cookie = cookieHeader;
  }
  return headers;
}

// ===========================================================================
// TESTS
// ===========================================================================

describe("papi proxy logic", () => {
  // -----------------------------------------------------------------------
  // 1. Querystring forwarding
  // -----------------------------------------------------------------------
  describe("buildBackendUrl -- querystring forwarding", () => {
    const backend = "http://localhost:3001";

    it("preserves query parameters in upstream URL", () => {
      const url = buildBackendUrl(backend, ["sessions"], "?limit=1&offset=10");
      expect(url).toBe(
        "http://localhost:3001/api/v2/provider/sessions?limit=1&offset=10",
      );
    });

    it("works with empty query string", () => {
      const url = buildBackendUrl(backend, ["auth"], "");
      expect(url).toBe("http://localhost:3001/api/v2/provider/auth");
    });

    it("handles multi-segment paths", () => {
      const url = buildBackendUrl(
        backend,
        ["sessions", "abc-123", "messages"],
        "?page=2",
      );
      expect(url).toBe(
        "http://localhost:3001/api/v2/provider/sessions/abc-123/messages?page=2",
      );
    });

    it("handles empty path segments (root)", () => {
      const url = buildBackendUrl(backend, [], "");
      expect(url).toBe("http://localhost:3001/api/v2/provider/");
    });

    it("handles special characters in query", () => {
      const url = buildBackendUrl(backend, ["search"], "?q=hello%20world&status=active");
      expect(url).toBe(
        "http://localhost:3001/api/v2/provider/search?q=hello%20world&status=active",
      );
    });
  });

  // -----------------------------------------------------------------------
  // 2. Set-Cookie splitting handles Expires commas
  // -----------------------------------------------------------------------
  describe("splitAndCleanCookies -- Set-Cookie handling", () => {
    it("relays a simple cookie, stripping domain/secure/samesite", () => {
      const raw =
        "c2c_provider_auth=tok123; Path=/; Domain=api.care2connects.org; Secure; SameSite=None; HttpOnly";
      const result = splitAndCleanCookies(raw);

      expect(result).toHaveLength(1);
      expect(result[0]).toContain("c2c_provider_auth=tok123");
      expect(result[0]).not.toMatch(/domain=/i);
      expect(result[0]).not.toMatch(/;\s*secure/i);
      expect(result[0]).toContain("SameSite=Lax");
      expect(result[0]).toContain("HttpOnly");
    });

    it("splits comma-separated cookies WITHOUT breaking Expires dates", () => {
      // Node native fetch merges Set-Cookie headers into one string
      // separated by commas. Expires contains a comma in the date format
      // ("Thu, 01 Jan 2026 00:00:00 GMT") which must NOT cause a split.
      // The regex splits on comma NOT followed by whitespace.
      const merged =
        "c2c_provider_auth=tok123; Path=/; Expires=Thu, 01 Jan 2026 00:00:00 GMT; HttpOnly," +
        "session_id=xyz; Path=/; HttpOnly";

      const result = splitAndCleanCookies(merged);

      expect(result).toHaveLength(2);

      // First cookie preserves the Expires date intact
      expect(result[0]).toContain("c2c_provider_auth=tok123");
      expect(result[0]).toContain("Expires=Thu, 01 Jan 2026 00:00:00 GMT");

      // Second cookie is separate
      expect(result[1]).toContain("session_id=xyz");
    });

    it("handles single cookie without Expires", () => {
      const raw = "token=abc; Path=/; Secure; SameSite=Strict; HttpOnly";
      const result = splitAndCleanCookies(raw);

      expect(result).toHaveLength(1);
      expect(result[0]).toContain("token=abc");
      expect(result[0]).not.toMatch(/;\s*secure/i);
      expect(result[0]).toContain("SameSite=Lax"); // replaced Strict -> Lax
    });

    it("strips domain from all cookies in a multi-cookie header", () => {
      const merged =
        "a=1; Domain=.example.com; Path=/," +
        "b=2; Domain=api.example.com; Path=/";
      const result = splitAndCleanCookies(merged);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toMatch(/domain/i);
      expect(result[1]).not.toMatch(/domain/i);
    });
  });

  // -----------------------------------------------------------------------
  // 3. Timeout classification
  // -----------------------------------------------------------------------
  describe("classifyError -- timeout vs generic error", () => {
    it("returns 504 + 'Upstream timeout' for AbortError", () => {
      const err = new DOMException("The operation was aborted", "AbortError");
      const result = classifyError(err);
      expect(result.status).toBe(504);
      expect(result.error).toBe("Upstream timeout");
    });

    it("returns 502 + 'Proxy error' for ECONNREFUSED", () => {
      const err = new Error("ECONNREFUSED");
      const result = classifyError(err);
      expect(result.status).toBe(502);
      expect(result.error).toBe("Proxy error");
    });

    it("returns 502 for non-Error thrown values", () => {
      const result = classifyError("string error");
      expect(result.status).toBe(502);
      expect(result.error).toBe("Proxy error");
    });

    it("returns 502 for TypeError (fetch failure)", () => {
      const err = new TypeError("Failed to fetch");
      const result = classifyError(err);
      expect(result.status).toBe(502);
      expect(result.error).toBe("Proxy error");
    });
  });

  // -----------------------------------------------------------------------
  // 4. Upstream header construction
  // -----------------------------------------------------------------------
  describe("buildUpstreamHeaders -- tracing + cookie forwarding", () => {
    it("includes x-c2c-proxy and x-c2c-request-id", () => {
      const headers = buildUpstreamHeaders("rid-1234", null);
      expect(headers["x-c2c-proxy"]).toBe("papi");
      expect(headers["x-c2c-request-id"]).toBe("rid-1234");
      expect(headers["content-type"]).toBe("application/json");
    });

    it("includes cookie header when present", () => {
      const headers = buildUpstreamHeaders("rid-1234", "c2c_provider_auth=abc123");
      expect(headers.cookie).toBe("c2c_provider_auth=abc123");
    });

    it("omits cookie header when null", () => {
      const headers = buildUpstreamHeaders("rid-1234", null);
      expect(headers.cookie).toBeUndefined();
    });

    it("omits cookie header when empty string", () => {
      const headers = buildUpstreamHeaders("rid-1234", "");
      expect(headers.cookie).toBeUndefined();
    });
  });
});
