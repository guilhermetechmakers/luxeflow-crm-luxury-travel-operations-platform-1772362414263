/**
 * Resorts API - Resort Bible search with filters
 * Uses mock data for local development; swap for Supabase/Edge Function in production
 * Runtime safety: all responses validated with nullish coalescing and Array.isArray checks
 */
import { api } from '@/lib/api'
import type { ResortBibleItem } from '@/types/booking'

export interface ResortSearchFilters {
  query?: string
  kids_policy?: string
  transfer_time_max?: number
  location?: string
  beach_proximity?: string
  room_capacity_min?: number
}

const MOCK_RESORTS: ResortBibleItem[] = [
  {
    id: 'r1',
    name: 'Villa Serenity',
    location: 'Amalfi Coast',
    transfer_time_minutes: 45,
    kids_policy: 'All ages welcome',
    beach_proximity: 'Beachfront',
    room_types: [
      { id: 'rc1', name: 'Deluxe Suite', bed_config: '1 King, 1 Sofa bed', capacity: 4 },
      { id: 'rc2', name: 'Ocean View Villa', bed_config: '2 King', capacity: 6 },
    ],
    seasonality: 'Year-round',
    image_url: undefined,
    inclusions: ['Breakfast', 'Airport transfer', 'Spa access'],
  },
  {
    id: 'r2',
    name: 'Ocean View Resort',
    location: 'Santorini',
    transfer_time_minutes: 25,
    kids_policy: '12+ only',
    beach_proximity: 'Cliff-top',
    room_types: [
      { id: 'rc3', name: 'Cave Suite', bed_config: '1 King', capacity: 2 },
      { id: 'rc4', name: 'Family Suite', bed_config: '2 King', capacity: 4 },
    ],
    seasonality: 'Apr–Oct',
    image_url: undefined,
    inclusions: ['Breakfast', 'Infinity pool', 'Concierge'],
  },
  {
    id: 'r3',
    name: 'Mountain Lodge',
    location: 'Swiss Alps',
    transfer_time_minutes: 90,
    kids_policy: 'All ages welcome',
    beach_proximity: 'N/A',
    room_types: [
      { id: 'rc5', name: 'Alpine Chalet', bed_config: '2 King, 2 Twin', capacity: 6 },
    ],
    seasonality: 'Dec–Apr, Jun–Sep',
    image_url: undefined,
    inclusions: ['Half board', 'Ski storage', 'Spa'],
  },
  {
    id: 'r4',
    name: 'Château des Alpes',
    location: 'France',
    transfer_time_minutes: 60,
    kids_policy: 'All ages welcome',
    beach_proximity: 'N/A',
    room_types: [
      { id: 'rc6', name: 'Grand Suite', bed_config: '1 King', capacity: 3 },
      { id: 'rc7', name: 'Tower Room', bed_config: '1 King', capacity: 2 },
    ],
    seasonality: 'Year-round',
    image_url: undefined,
    inclusions: ['Breakfast', 'Wine tasting', 'Gardens'],
  },
  {
    id: 'r5',
    name: 'Palazzo Riviera',
    location: 'Italy',
    transfer_time_minutes: 35,
    kids_policy: 'All ages welcome',
    beach_proximity: '5 min walk',
    room_types: [
      { id: 'rc8', name: 'Garden View', bed_config: '1 King', capacity: 2 },
      { id: 'rc9', name: 'Terrace Suite', bed_config: '1 King, 1 Sofa', capacity: 4 },
    ],
    seasonality: 'Year-round',
    image_url: undefined,
    inclusions: ['Breakfast', 'Pool', 'Bike rental'],
  },
]

export const resortsApi = {
  /**
   * GET /api/resorts?query=&kids_policy=&transfer_time_max=&location=&beach_proximity=&room_capacity_min=
   */
  async searchResorts(filters: ResortSearchFilters = {}): Promise<ResortBibleItem[]> {
    try {
      const params = new URLSearchParams()
      if (filters.query) params.set('query', filters.query)
      if (filters.kids_policy) params.set('kids_policy', filters.kids_policy)
      if (filters.transfer_time_max != null) params.set('transfer_time_max', String(filters.transfer_time_max))
      if (filters.location) params.set('location', filters.location)
      if (filters.beach_proximity) params.set('beach_proximity', filters.beach_proximity)
      if (filters.room_capacity_min != null) params.set('room_capacity_min', String(filters.room_capacity_min))

      const qs = params.toString()
      const res = await api.get<ResortBibleItem[] | { data?: ResortBibleItem[] }>(`/resorts?${qs}`)
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: ResortBibleItem[] })?.data) ? (res as { data: ResortBibleItem[] }).data : []
      return list ?? []
    } catch {
      return filterResorts(MOCK_RESORTS, filters)
    }
  },

  /**
   * GET /api/resorts/:id
   */
  async getResort(id: string): Promise<ResortBibleItem | null> {
    try {
      const res = await api.get<ResortBibleItem>(`/resorts/${id}`)
      return res ?? null
    } catch {
      return (MOCK_RESORTS ?? []).find((r) => r.id === id) ?? null
    }
  },
}

function filterResorts(
  resorts: ResortBibleItem[],
  filters: ResortSearchFilters
): ResortBibleItem[] {
  let result = [...(resorts ?? [])]

  const query = (filters.query ?? '').toLowerCase().trim()
  if (query) {
    result = result.filter(
      (r) =>
        (r.name ?? '').toLowerCase().includes(query) ||
        (r.location ?? '').toLowerCase().includes(query)
    )
  }

  if (filters.kids_policy) {
    result = result.filter(
      (r) => (r.kids_policy ?? '').toLowerCase().includes(filters.kids_policy!.toLowerCase())
    )
  }

  if (typeof filters.transfer_time_max === 'number') {
    result = result.filter(
      (r) => (r.transfer_time_minutes ?? 999) <= filters.transfer_time_max!
    )
  }

  if (filters.location) {
    result = result.filter(
      (r) => (r.location ?? '').toLowerCase().includes(filters.location!.toLowerCase())
    )
  }

  if (filters.beach_proximity) {
    result = result.filter(
      (r) => (r.beach_proximity ?? '').toLowerCase().includes(filters.beach_proximity!.toLowerCase())
    )
  }

  if (typeof filters.room_capacity_min === 'number') {
    result = result.filter((r) => {
      const rooms = r.room_types ?? []
      return rooms.some((rt) => (rt.capacity ?? 0) >= filters.room_capacity_min!)
    })
  }

  return result
}
