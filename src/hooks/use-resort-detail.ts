/**
 * useResortDetail - fetches single resort by ID
 */
import { useQuery } from '@tanstack/react-query'
import { resortsApi } from '@/api/resorts'

export function useResortDetail(id: string | undefined) {
  const query = useQuery({
    queryKey: ['resort', id],
    queryFn: () => (id ? resortsApi.getResort(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 60 * 1000,
  })

  return {
    ...query,
    resort: query.data ?? null,
  }
}
