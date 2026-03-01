/**
 * useResortPresets - fetches and mutates saved filter presets
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { resortBibleApi } from '@/api/resort-bible'
import type { PresetInput } from '@/types/resort-bible'

const QUERY_KEY = ['resort-presets'] as const

export function useResortPresets() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => resortBibleApi.getPresets(),
    staleTime: 5 * 60 * 1000,
  })

  const items = Array.isArray(query.data) ? query.data : []

  const saveMutation = useMutation({
    mutationFn: (input: PresetInput) => resortBibleApi.savePreset(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => resortBibleApi.deletePreset(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  return {
    ...query,
    presets: items,
    savePreset: saveMutation.mutateAsync,
    deletePreset: deleteMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  }
}
