/**
 * useClients - fetches client list with filters, search, pagination
 * Guards against null/undefined per runtime safety rules
 */
import { useQuery } from '@tanstack/react-query'
import { clientsApi } from '@/api/clients'
import type { ClientFilters } from '@/types/client'

const QUERY_KEY = ['clients'] as const

function buildQueryKey(filters: ClientFilters): readonly [string, ClientFilters] {
  return [...QUERY_KEY, filters] as const
}

export function useClients(filters: ClientFilters = {}) {
  const query = useQuery({
    queryKey: buildQueryKey(filters),
    queryFn: () => clientsApi.getClients(filters),
    staleTime: 60 * 1000,
  })

  const data = query.data ?? null
  const clients = Array.isArray(data?.data) ? data.data : []
  const count = typeof data?.count === 'number' ? data.count : 0

  return {
    ...query,
    clients,
    count,
    data,
  }
}
