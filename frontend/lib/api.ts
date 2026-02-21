/**
 * Centralized API helper for same-origin requests
 * All API calls must use /api/* paths (no hardcoded localhost or api. URLs)
 */

interface ApiError extends Error {
  status?: number;
  data?: any;
}

class ApiClient {
  private baseUrl = '/api';

  /**
   * Generic fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      if (!response.ok) {
        const error: ApiError = new Error(
          isJson ? (await response.json()).error : response.statusText
        );
        error.status = response.status;
        throw error;
      }

      return (isJson ? await response.json() : await response.text()) as T;
    } catch (error: any) {
      // Network errors or parsing errors
      if (!error.status) {
        error.status = 0; // Network error
      }
      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Check system health
   */
  async checkHealth(): Promise<{
    status: string;
    services: Record<string, { healthy: boolean }>;
  }> {
    return this.get('/health/status');
  }

  /**
   * Check database health specifically
   */
  async checkDbHealth(): Promise<{ ready: boolean; message: string }> {
    return this.get('/health/db');
  }
}

// Export singleton instance
export const api = new ApiClient();

// Type exports for common API responses
export interface RecordingTicket {
  id: string;
  displayName?: string;
  contactValue?: string;
  contactType?: 'EMAIL' | 'PHONE' | 'SMS';
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicket {
  id: string;
  reporterName: string;
  isGuest: boolean;
  message: string;
  status: string;
  createdAt: string;
  recordingTicketId?: string;
}

export interface DonationTotal {
  totalPaid: number;
  totalRefunded: number;
  netTotal: number;
  currency: string;
  lastDonationAt?: string;
}

export interface Donation {
  id: string;
  amount: number;
  currency: string;
  status: 'PAID' | 'REFUNDED' | 'DISPUTED' | 'EXPIRED';
  donorLastName?: string;
  donorCountry?: string;
  paidAt?: string;
  refundedAt?: string;
  createdAt: string;
}
