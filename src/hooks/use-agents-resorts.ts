/**
 * useAgentsResorts - fetches agents and resorts for filter dropdowns
 * Guards against null/undefined per runtime safety rules
 */
import { useQuery } from '@tanstack/react-query'
import { bookingsApi } from '@/api/bookings'

export function useAgents() {
  const query = useQuery({
    queryKey: ['agents'],
    queryFn: () => bookingsApi.getAgents(),
    staleTime: 5 * 60 * 1000,
  })

  const agents = Array.isArray(query.data) ? query.data : []
  return { ...query, agents }
}

export function useResorts() {
  const query = useQuery({
    queryKey: ['resorts'],
    queryFn: () => bookingsApi.getResorts(),
    staleTime: 5 * 60 * 1000,
  })

  const resorts = Array.isArray(query.data) ? query.data : []
  return { ...query, resorts }
}
