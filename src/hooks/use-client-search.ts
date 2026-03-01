/**
 * useClientSearch - debounced search for autosuggest
 * Runtime-safe: guards array access
 */
import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { clientsApi } from '@/api/clients'
import type { SearchSuggestion } from '@/types/client'
import { useDebounce } from '@/hooks/use-debounce'

export function useClientSearch() {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['client-search', debouncedQuery],
    queryFn: () => clientsApi.searchSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000,
  })

  const suggestions: SearchSuggestion[] = Array.isArray(data) ? data : []

  const handleSelect = useCallback(() => {
    setIsOpen(false)
    setQuery('')
  }, [])

  useEffect(() => {
    setIsOpen(debouncedQuery.length >= 2)
  }, [debouncedQuery])

  return {
    query,
    setQuery,
    debouncedQuery,
    suggestions,
    isLoading: isLoading || isFetching,
    isOpen,
    setIsOpen,
    handleSelect,
  }
}
