class APIClient {
  constructor(baseUrl) {
    this.baseUrl = (baseUrl || "").replace(/\/+$/, "");
  }

  async request(path, opts = {}) {
    const url = `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
    const response = await fetch(url, opts);
    if (!response.ok) {
      let body = null;
      try {
        body = await response.json();
      } catch (e) {}
      const err = new Error(`API Error: ${response.statusText}`);
      err.status = response.status;
      err.body = body;
      throw err;
    }
    return response.json();
  }

  profile = {
    get: async (profileId) =>
      this.request(`/profile/${encodeURIComponent(profileId)}`, {
        headers: { "Content-Type": "application/json" },
      }),
    create: async (data) =>
      this.request(`/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    update: async (profileId, data, userId) => {
      const headers = { "Content-Type": "application/json" };
      if (userId) headers["x-user-id"] = userId;
      return this.request(`/profile/${encodeURIComponent(profileId)}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(data),
      });
    },
    search: async (params) => {
      const parts = [];
      if (params.query) parts.push(`query=${encodeURIComponent(params.query)}`);
      if (params.location)
        parts.push(`location=${encodeURIComponent(params.location)}`);
      if (params.page !== undefined)
        parts.push(`page=${encodeURIComponent(String(params.page))}`);
      if (params.limit !== undefined)
        parts.push(`limit=${encodeURIComponent(String(params.limit))}`);
      const url = `${this.baseUrl}/profile${parts.length ? "?" + parts.join("&") : ""}`;
      const response = await fetch(url, {
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(response.statusText);
      return response.json();
    },
  };

  transcription = {
    upload: async (formData) => {
      const response = await fetch(`${this.baseUrl}/transcribe`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        let body = null;
        try {
          body = await response.json();
        } catch (e) {}
        const err = new Error(response.statusText);
        err.body = body;
        throw err;
      }
      return response.json();
    },
    getStatus: async (audioId) =>
      this.request(`/transcribe/${encodeURIComponent(audioId)}/status`, {
        headers: { "Content-Type": "application/json" },
      }),
  };
}

module.exports = { APIClient };
