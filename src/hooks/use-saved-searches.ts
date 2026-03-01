/**
 * useSavedSearches - loads and saves named searches with permissions
 * Runtime-safe array handling
 */
import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientsApi } from '@/api/clients'

const QUERY_KEY = ['saved-searches'] as const

export function useSavedSearches() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => clientsApi.getSavedSearches(),
    staleTime: 5 * 60 * 1000,
  })

  const searches = Array.isArray(query.data) ? query.data : []

  const saveMutation = useMutation({
    mutationFn: ({
      name,
      queryJson,
      isDefault,
    }: {
      name: string
      queryJson: string
      isDefault?: boolean
    }) => clientsApi.saveSearch(name, queryJson, isDefault ?? false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const saveSearch = useCallback(
    (name: string, queryJson: string, isDefault?: boolean) => {
      return saveMutation.mutateAsync({ name, queryJson, isDefault })
    },
    [saveMutation]
  )

  return {
    ...query,
    searches,
    saveSearch,
    isSaving: saveMutation.isPending,
  }
}
