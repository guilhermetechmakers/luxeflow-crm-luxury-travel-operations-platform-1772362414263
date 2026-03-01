/**
 * useBookings - fetches booking list with filters, pagination, sorting
 * Guards against null/undefined per runtime safety rules
 */
import { useQuery } from '@tanstack/react-query'
import { bookingsApi } from '@/api/bookings'
import type { BookingFilters } from '@/types/booking'

const QUERY_KEY = ['bookings'] as const

function buildQueryKey(filters: BookingFilters): readonly [string, BookingFilters] {
  return [...QUERY_KEY, filters] as const
}

export function useBookings(filters: BookingFilters = {}) {
  const query = useQuery({
    queryKey: buildQueryKey(filters),
    queryFn: () => bookingsApi.getBookings(filters),
    staleTime: 60 * 1000,
  })

  const data = query.data ?? null
  const bookings = Array.isArray(data?.data) ? data.data : []
  const count = typeof data?.count === 'number' ? data.count : 0

  return {
    ...query,
    bookings,
    count,
    data,
  }
}
