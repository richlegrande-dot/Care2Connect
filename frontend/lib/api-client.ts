export type APIResponse<T> = { success: boolean; data: T };

export class APIClient {
  baseUrl: string;
  profile: any;
  transcription: any;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");

    this.profile = {
      get: async (id: string) => {
        const url = `${this.baseUrl}/profile/${id}`;
        return this._fetchJson(url);
      },
      create: async (data: any) => {
        const url = `${this.baseUrl}/profile`;
        return this._fetchJson(url, {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
        });
      },
      update: async (id: string, data: any, userId?: string) => {
        const url = `${this.baseUrl}/profile/${id}`;
        const headers: any = { "Content-Type": "application/json" };
        if (userId) headers["x-user-id"] = userId;
        return this._fetchJson(url, {
          method: "PUT",
          body: JSON.stringify(data),
          headers,
        });
      },
      search: async ({ query, location, page = 1, limit = 10 }: any) => {
        // Build query using encodeURIComponent to preserve %20 for spaces
        const params = [] as string[];
        if (query) params.push(`query=${encodeURIComponent(query)}`);
        if (location) params.push(`location=${encodeURIComponent(location)}`);
        params.push(`page=${encodeURIComponent(String(page))}`);
        params.push(`limit=${encodeURIComponent(String(limit))}`);
        const url = `${this.baseUrl}/profile?${params.join("&")}`;
        return this._fetchJson(url);
      },
    };

    this.transcription = {
      upload: async (formData: FormData) => {
        const url = `${this.baseUrl}/transcribe`;
        const res = await fetch(url, { method: "POST", body: formData });
        return this._handleResponse(res);
      },
      getStatus: async (audioId: string) => {
        const url = `${this.baseUrl}/transcribe/${audioId}/status`;
        return this._fetchJson(url);
      },
    };
  }

  private async _fetchJson(url: string, opts: any = {}) {
    const headers = opts.headers || { "Content-Type": "application/json" };
    const res = await fetch(url, { ...opts, headers });
    return this._handleResponse(res);
  }

  private async _handleResponse(res: Response) {
    if (!res.ok) {
      let body = "";
      try {
        body = JSON.stringify(await res.json());
      } catch (_) {
        body = "";
      }
      throw new Error(
        `API Error: ${res.statusText}${body ? " - " + body : ""}`,
      );
    }
    return res.json();
  }
}
const base: string =
  typeof process !== "undefined" &&
  process.env &&
  (process.env.NEXT_PUBLIC_API_URL || process.env.API_URL)
    ? ((process.env.NEXT_PUBLIC_API_URL || process.env.API_URL) as string)
    : "http://localhost:3001";

export const api = new APIClient(base);

export default api;
