/**
 * Resort Bible utility helpers - runtime safety for array access
 * CRITICAL: Use these to prevent null/undefined crashes
 */

/** Uses (data ?? []) and Array.isArray checks - returns safe array */
export function safeArrayAccess<T>(data: T[] | null | undefined): T[] {
  if (data == null) return []
  return Array.isArray(data) ? data : []
}

/** Return Array.isArray(input) ? input : [] */
export function ensureArray<T>(input: T[] | null | undefined): T[] {
  return Array.isArray(input) ? input : []
}

/** Handle possible nulls defensively - returns array or empty array */
export function toNullableArray<T>(data: T[] | null | undefined): T[] {
  if (data == null) return []
  if (Array.isArray(data)) return data
  return []
}
