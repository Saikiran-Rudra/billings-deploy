import { useLoaderStore } from '@/store/useLoaderStore';

interface ApiRequestOptions extends RequestInit {
  skipLoader?: boolean;
  timeout?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Generate unique request ID for tracking
 */
const generateRequestId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

/**
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') || localStorage.getItem('auth_token');
};

/**
 * Create AbortController with timeout fallback
 */
const createAbortController = (timeout: number = 30000): AbortController => {
  const controller = new AbortController();

  // Timeout fallback (30s default, prevents hung requests)
  setTimeout(() => {
    if (!controller.signal.aborted) {
      controller.abort();
    }
  }, timeout);

  return controller;
};

/**
 * Core API client with automatic loader management
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { skipLoader = false, timeout = 30000, ...fetchOptions } = options;

  const requestId = generateRequestId();
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  console.log(`[API] ${fetchOptions.method || 'GET'} ${url}`);

  // Increment loader unless skipped
  if (!skipLoader) {
    useLoaderStore.getState().increment(requestId);
  }

  try {
    const controller = createAbortController(timeout);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...fetchOptions.headers,
      },
      ...fetchOptions,
      signal: controller.signal,
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message || `API Error: ${response.status} ${response.statusText}`;

      if (!skipLoader) {
        useLoaderStore.getState().decrement(requestId);
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!skipLoader) {
      useLoaderStore.getState().decrement(requestId);
    }
console.log('API Response:', data);
    return data as T;

  } catch (error) {
    // Always decrement on error
    if (!skipLoader) {
      useLoaderStore.getState().decrement(requestId);
    }

    // Handle abort/timeout
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error(`[API ERROR] Request timeout: ${url}`);
        throw new Error('Request timeout - please try again');
      }
      console.error(`[API ERROR] ${error.message} - URL: ${url}`);
      throw error;
    }

    console.error(`[API ERROR] Unexpected error: ${error} - URL: ${url}`);
    throw new Error('An unexpected error occurred');
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, data?: unknown, options?: ApiRequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T = unknown>(endpoint: string, data?: unknown, options?: ApiRequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T = unknown>(endpoint: string, data?: unknown, options?: ApiRequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Utility for making multiple concurrent requests
 */
export async function apiConcurrent<T = unknown>(
  requests: Array<() => Promise<T>>
): Promise<T[]> {
  return Promise.all(requests.map((req) => req()));
}

/**
 * Utility for polling with auto-retry
 */
export async function apiPoll<T = unknown>(
  endpoint: string,
  options: {
    interval?: number;
    maxAttempts?: number;
    shouldStop?: (data: T) => boolean;
  } & ApiRequestOptions = {}
): Promise<T> {
  const { interval = 2000, maxAttempts = 10, shouldStop = () => false, ...apiOptions } = options;

  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const data = await api.get<T>(endpoint, apiOptions);

      if (shouldStop(data)) {
        return data;
      }

      attempts++;
      await new Promise((resolve) => setTimeout(resolve, interval));
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }

  throw new Error(`Polling failed after ${maxAttempts} attempts`);
}
