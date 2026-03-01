/**
 * API utilities - native fetch wrapper with auth and error handling
 * Used for dashboard and other API calls
 */

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data } = await supabase.auth.getSession()
    const token = data?.session?.access_token
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // No auth - continue without token
  }
  return headers
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const base = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
  const fullUrl = url.startsWith('http') ? url : `${base}${url}`
  const headers = await getAuthHeaders()
  const response = await fetch(fullUrl, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  })
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `HTTP ${response.status}`)
  }
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return response.json() as Promise<T>
  }
  return response.text() as unknown as T
}

/** API client with get/post/put/patch/delete - uses apiFetch */
export const api = {
  get: <T>(endpoint: string) => apiFetch<T>(endpoint),
  post: <T>(endpoint: string, data: unknown) =>
    apiFetch<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data: unknown) =>
    apiFetch<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data: unknown) =>
    apiFetch<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) =>
    apiFetch<T>(endpoint, { method: 'DELETE' }),
}

/**
 * Safe fetch - returns null on error instead of throwing.
 * Use for optional/critical paths where fallback is acceptable.
 */
export async function safeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    return await apiFetch<T>(url, options ?? {})
  } catch {
    return null
  }
}
