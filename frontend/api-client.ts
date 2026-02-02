export class APIClient {
  baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '')
  }

  private async request(path: string, opts: RequestInit = {}) {
    const url = `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
    const response = await fetch(url, opts)
    if (!response.ok) {
      let body: any
      try {
        body = await response.json()
      } catch (_e) {
        body = null
      }
      const msg = `${response.statusText}`
      const err = new Error(`API Error: ${msg}`)
      ;(err as any).status = response.status
      ;(err as any).body = body
      throw err
    }
    return response.json()
  }

  profile = {
    get: async (profileId: string) => {
      return this.request(`/profile/${encodeURIComponent(profileId)}`, {
        headers: { 'Content-Type': 'application/json' },
      })
    },
    create: async (data: any) => {
      return this.request(`/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
    },
    update: async (profileId: string, data: any, userId?: string) => {
      const headers: any = { 'Content-Type': 'application/json' }
      if (userId) headers['x-user-id'] = userId
      return this.request(`/profile/${encodeURIComponent(profileId)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data),
      })
    },
    search: async (params: { query?: string; location?: string; page?: number; limit?: number }) => {
      const parts: string[] = []
      if (params.query) parts.push(`query=${encodeURIComponent(params.query)}`)
      if (params.location) parts.push(`location=${encodeURIComponent(params.location)}`)
      if (params.page !== undefined) parts.push(`page=${encodeURIComponent(String(params.page))}`)
      if (params.limit !== undefined) parts.push(`limit=${encodeURIComponent(String(params.limit))}`)
      const url = `${this.baseUrl}/profile${parts.length ? '?' + parts.join('&') : ''}`
      const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } })
      if (!response.ok) throw new Error(response.statusText)
      return response.json()
    },
  }

  transcription = {
    upload: async (formData: FormData) => {
      // Do not set Content-Type header for FormData
      const response = await fetch(`${this.baseUrl}/transcribe`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        let body: any
        try { body = await response.json() } catch (_e) { body = null }
        const err = new Error(response.statusText)
        ;(err as any).body = body
        throw err
      }
      return response.json()
    },
    getStatus: async (audioId: string) => {
      return this.request(`/transcribe/${encodeURIComponent(audioId)}/status`, {
        headers: { 'Content-Type': 'application/json' },
      })
    },
  }
}

// Default export omitted; tests import named `APIClient` or an `api` instance from lib/
