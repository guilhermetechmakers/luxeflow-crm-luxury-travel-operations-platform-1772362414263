import { useState, useEffect, useCallback } from 'react'

/**
 * Debounces a value - useful for search inputs
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

/**
 * Returns a debounced callback
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null)

  const debouncedCallback = useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutId) clearTimeout(timeoutId)
      const id = setTimeout(() => callback(...args), delay)
      setTimeoutId(id)
    }) as T,
    [callback, delay, timeoutId]
  ) as T

  useEffect(() => () => {
    if (timeoutId) clearTimeout(timeoutId)
  }, [timeoutId])

  return debouncedCallback
}
