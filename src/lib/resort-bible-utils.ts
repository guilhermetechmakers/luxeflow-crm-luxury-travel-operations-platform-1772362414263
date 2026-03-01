/**
 * Resort Bible utility helpers - Runtime-safe array and data access
 * CRITICAL: Use these helpers to prevent null/undefined runtime crashes
 */

/**
 * Returns a safe array from data - uses (data ?? []) and Array.isArray checks
 */
export function safeArrayAccess<T>(data: T[] | null | undefined): T[] {
  if (data == null) return []
  return Array.isArray(data) ? data : []
}

/**
 * Ensures input is an array - returns input if valid array, else empty array
 */
export function ensureArray<T>(input: T[] | null | undefined): T[] {
  return Array.isArray(input) ? input : []
}

/**
 * Handles possible nulls defensively - returns array or empty array
 */
export function toNullableArray<T>(data: T[] | null | undefined): T[] {
  return (data ?? []) as T[]
}
