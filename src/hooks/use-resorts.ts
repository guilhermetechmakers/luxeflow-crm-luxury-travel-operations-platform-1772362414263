/**
 * useResorts - fetches resort list with filters, pagination (Resort Bible API)
 * Guards against null/undefined per runtime safety rules
 */
import { useQuery } from '@tanstack/react-query'
import { resortBibleApi } from '@/api/resort-bible'
import type { ResortFilters } from '@/types/resort-bible'

const QUERY_KEY = ['resorts'] as const

function buildQueryKey(filters: ResortFilters, page: number, pageSize: number): readonly unknown[] {
  return [...QUERY_KEY, filters, page, pageSize] as const
}

export function useResorts(
  filters: ResortFilters = {},
  page = 1,
  pageSize = 24
) {
  const query = useQuery({
    queryKey: buildQueryKey(filters, page, pageSize),
    queryFn: () => resortBibleApi.getResorts(filters, page, pageSize),
    staleTime: 60 * 1000,
  })

  const data = query.data ?? null
  const resorts = Array.isArray(data?.data) ? data.data : []
  const total = typeof data?.total === 'number' ? data.total : 0

  return {
    ...query,
    resorts,
    total,
    data,
    refetch: query.refetch,
  }
}
