export class APIError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = "APIError";
  }
}

type FetchOptions = RequestInit & {
  timeout?: number;
};

async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: response.statusText,
    }));
    const errorMessage = error.error || error.message || "Request failed";
    throw new APIError(errorMessage, response.status, error.code);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return {} as T;
}

export async function apiGet<T>(
  url: string,
  options?: FetchOptions
): Promise<T> {
  const response = await fetchWithTimeout(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });
  return handleResponse<T>(response);
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  options?: FetchOptions
): Promise<T> {
  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
  return handleResponse<T>(response);
}

export async function apiPatch<T>(
  url: string,
  data?: unknown,
  options?: FetchOptions
): Promise<T> {
  const response = await fetchWithTimeout(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
  return handleResponse<T>(response);
}

export async function apiDelete<T>(
  url: string,
  data?: unknown,
  options?: FetchOptions
): Promise<T> {
  const response = await fetchWithTimeout(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
  return handleResponse<T>(response);
}
