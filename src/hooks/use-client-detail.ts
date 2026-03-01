/**
 * useClientDetail - Fetches client detail and related data
 * Uses React Query with proper cache keys and runtime-safe defaults
 */
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { clientDetailApi } from '@/api/client-detail'

const CLIENT_DETAIL_KEY = ['client-detail'] as const

export function useClientDetail(clientId: string | undefined) {
  const id = clientId ?? ''
  const queryClient = useQueryClient()

  const clientQuery = useQuery({
    queryKey: [...CLIENT_DETAIL_KEY, id],
    queryFn: () => clientDetailApi.getClientDetail(id),
    enabled: !!id,
  })

  const documentsQuery = useQuery({
    queryKey: [...CLIENT_DETAIL_KEY, id, 'documents'],
    queryFn: () => clientDetailApi.getDocuments(id),
    enabled: !!id,
  })

  const notesQuery = useQuery({
    queryKey: [...CLIENT_DETAIL_KEY, id, 'notes'],
    queryFn: () => clientDetailApi.getNotes(id),
    enabled: !!id,
  })

  const communicationsQuery = useQuery({
    queryKey: [...CLIENT_DETAIL_KEY, id, 'communications'],
    queryFn: () => clientDetailApi.getCommunications(id),
    enabled: !!id,
  })

  const bookingsQuery = useQuery({
    queryKey: [...CLIENT_DETAIL_KEY, id, 'bookings'],
    queryFn: () => clientDetailApi.getBookings(id),
    enabled: !!id,
  })

  const travelHistoryQuery = useQuery({
    queryKey: [...CLIENT_DETAIL_KEY, id, 'travel-history'],
    queryFn: () => clientDetailApi.getTravelHistory(id),
    enabled: !!id,
  })

  const vipFlagsQuery = useQuery({
    queryKey: [...CLIENT_DETAIL_KEY, id, 'vip-flags'],
    queryFn: () => clientDetailApi.getVipFlags(id),
    enabled: !!id,
  })

  const profile = clientQuery.data ?? null
  const documents = documentsQuery.data ?? []
  const notes = notesQuery.data ?? []
  const communications = communicationsQuery.data ?? []
  const bookings = bookingsQuery.data ?? []
  const travelHistory = travelHistoryQuery.data ?? []
  const vipFlags = vipFlagsQuery.data ?? []

  const isProfileLoading =
    clientQuery.isLoading ||
    documentsQuery.isLoading ||
    notesQuery.isLoading ||
    communicationsQuery.isLoading ||
    bookingsQuery.isLoading ||
    travelHistoryQuery.isLoading ||
    vipFlagsQuery.isLoading

  const error = clientQuery.error

  const invalidateAll = () => {
    void queryClient.invalidateQueries({ queryKey: [...CLIENT_DETAIL_KEY, id] })
  }

  return {
    profile,
    documents,
    notes,
    communications,
    bookings,
    travelHistory,
    vipFlags,
    isProfileLoading,
    error,
    invalidateAll,
    clientDetailApi,
  }
}
