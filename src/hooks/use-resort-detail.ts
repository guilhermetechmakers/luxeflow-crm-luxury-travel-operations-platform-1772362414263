/**
 * useResortDetail - fetches single resort by ID
 * Uses resortBibleApi for Resort Bible directory consistency (ids r1, r2, etc.)
 */
import { useQuery } from '@tanstack/react-query'
import { resortBibleApi } from '@/api/resort-bible'

export function useResortDetail(id: string | undefined) {
  const query = useQuery({
    queryKey: ['resort', id],
    queryFn: () => (id ? resortBibleApi.getResort(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 60 * 1000,
  })

  return {
    ...query,
    resort: query.data ?? null,
  }
}
