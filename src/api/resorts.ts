/**
 * Resorts API - Resort Bible directory CRUD, import/export, presets
 * Uses mock data for local development; swap for Supabase/Edge Function in production
 * Runtime safety: all responses validated with nullish coalescing and Array.isArray checks
 */
import { api } from '@/lib/api'
import type {
  Resort,
  ResortFilters,
  ResortsResponse,
  ResortCreateInput,
  ResortUpdateInput,
  Preset,
  PresetInput,
  MigrationMap,
  RoomType,
} from '@/types/resort'

const MOCK_RESORTS: Resort[] = [
  {
    id: '1',
    name: 'Villa Serenity',
    location: { city: 'Santorini', country: 'Greece', region: 'Cyclades' },
    transferTime: '25 min',
    kidsPolicy: 'Family-friendly, kids club',
    dining: ['Fine dining', 'Pool bar', 'Room service'],
    roomTypes: [
      { id: 'rt1', resortId: '1', name: 'Deluxe Suite', maxOccupancy: 4, bedConfig: '1 King, 1 Sofa' },
      { id: 'rt2', resortId: '1', name: '2-Bedroom Villa', maxOccupancy: 6, bedConfig: '2 King' },
    ],
    media: [
      { id: 'm1', resortId: '1', url: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800', caption: 'Caldera view', order: 0 },
    ],
    perks: ['Spa', 'Infinity pool', 'Private beach access'],
    restrictions: 'No pets',
    internalRatings: [{ id: 'r1', resortId: '1', rating: 9, reviewer: 'Ops', notes: 'Excellent for families' }],
    partners: [{ id: 'p1', name: 'Luxe Partners', contactInfo: 'partners@luxe.com' }],
    tags: ['Family', 'Beach', 'Luxury'],
    beachPresence: true,
    priceBand: 'Premium',
    region: 'Mediterranean',
    resortType: 'Villa',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2025-02-28T10:00:00Z',
  },
  {
    id: '2',
    name: 'Ocean View Resort',
    location: { city: 'Malé', country: 'Maldives', region: 'North Malé Atoll' },
    transferTime: '15 min',
    kidsPolicy: 'Adults only',
    dining: ['Overwater restaurant', 'Beach grill'],
    roomTypes: [
      { id: 'rt3', resortId: '2', name: 'Water Villa', maxOccupancy: 2, bedConfig: '1 King' },
    ],
    media: [
      { id: 'm2', resortId: '2', url: 'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=800', caption: 'Overwater villa', order: 0 },
    ],
    perks: ['Spa', 'Snorkeling', 'Private deck'],
    internalRatings: [{ id: 'r2', resortId: '2', rating: 9.5, reviewer: 'Ops' }],
    partners: [{ id: 'p1', name: 'Luxe Partners' }],
    tags: ['Luxury', 'Spa', 'Honeymoon'],
    beachPresence: true,
    priceBand: 'Ultra-luxury',
    region: 'Indian Ocean',
    resortType: 'Resort',
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2025-02-27T14:00:00Z',
  },
  {
    id: '3',
    name: 'Mountain Lodge',
    location: { city: 'Zermatt', country: 'Switzerland', region: 'Valais' },
    transferTime: '45 min',
    kidsPolicy: 'Family-friendly',
    dining: ['Alpine restaurant', 'Bar', 'Room service'],
    roomTypes: [
      { id: 'rt4', resortId: '3', name: 'Chalet Suite', maxOccupancy: 4, bedConfig: '1 King, 2 Twin' },
      { id: 'rt5', resortId: '3', name: '2-Bedroom Chalet', maxOccupancy: 6, bedConfig: '2 King' },
    ],
    media: [
      { id: 'm3', resortId: '3', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800', caption: 'Mountain view', order: 0 },
    ],
    perks: ['Ski-in/ski-out', 'Wellness', 'Spa'],
    internalRatings: [{ id: 'r3', resortId: '3', rating: 8.5, reviewer: 'Ops' }],
    partners: [],
    tags: ['Ski', 'Wellness', 'Alpine'],
    beachPresence: false,
    priceBand: 'Premium',
    region: 'Alps',
    resortType: 'Lodge',
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2025-02-26T09:00:00Z',
  },
  {
    id: '4',
    name: 'Château des Alpes',
    location: { city: 'Chamonix', country: 'France', region: 'Haute-Savoie' },
    transferTime: '60 min',
    kidsPolicy: 'Family-friendly, kids activities',
    dining: ['Michelin-starred', 'Bistro', 'Wine cellar'],
    roomTypes: [
      { id: 'rt6', resortId: '4', name: 'Deluxe Room', maxOccupancy: 3, bedConfig: '1 King' },
      { id: 'rt7', resortId: '4', name: '2-Bedroom Suite', maxOccupancy: 5, bedConfig: '2 King' },
    ],
    perks: ['Spa', 'Helicopter transfers', 'Wine tasting'],
    tags: ['Luxury', 'Ski', 'Fine dining'],
    beachPresence: false,
    priceBand: 'Ultra-luxury',
    region: 'Alps',
    resortType: 'Château',
    createdAt: '2024-04-01T10:00:00Z',
    updatedAt: '2025-02-25T16:00:00Z',
  },
  {
    id: '5',
    name: 'Palazzo Riviera',
    location: { city: 'Amalfi', country: 'Italy', region: 'Campania' },
    transferTime: '90 min',
    kidsPolicy: 'All ages welcome',
    dining: ['Terrace restaurant', 'Beach club'],
    roomTypes: [
      { id: 'rt8', resortId: '5', name: 'Sea View Suite', maxOccupancy: 4, bedConfig: '1 King, 1 Sofa' },
    ],
    perks: ['Infinity pool', 'Boat excursions', 'Cooking classes'],
    tags: ['Beach', 'Luxury', 'Italy'],
    beachPresence: true,
    priceBand: 'Premium',
    region: 'Mediterranean',
    resortType: 'Hotel',
    createdAt: '2024-05-15T10:00:00Z',
    updatedAt: '2025-02-24T11:00:00Z',
  },
]

const MOCK_PRESETS: Preset[] = [
  { id: 'pr1', name: 'Family Beach', filters: { kidsPolicy: 'Family-friendly', beachPresence: true }, shared: true },
  { id: 'pr2', name: 'Quick Transfer', filters: { transferTimeMax: 30 }, shared: false },
]

function normalizeResortsResponse(raw: unknown): ResortsResponse {
  const data = raw as Partial<ResortsResponse> | null | undefined
  const list = Array.isArray(data?.data) ? data.data : []
  const total = typeof data?.total === 'number' ? data.total : list.length
  return { data: list, total }
}

function filterResorts(resorts: Resort[], filters: ResortFilters): ResortsResponse {
  let result = [...(resorts ?? [])]

  const search = (filters.search ?? '').toLowerCase().trim()
  if (search) {
    result = result.filter(
      (r) =>
        (r.name ?? '').toLowerCase().includes(search) ||
        (r.location?.city ?? '').toLowerCase().includes(search) ||
        (r.location?.country ?? '').toLowerCase().includes(search) ||
        (r.location?.region ?? '').toLowerCase().includes(search) ||
        ((r.tags ?? []).some((t) => t.toLowerCase().includes(search)))
    )
  }

  if (filters.kidsPolicy) {
    result = result.filter((r) => (r.kidsPolicy ?? '').toLowerCase().includes(filters.kidsPolicy!.toLowerCase()))
  }
  if (typeof filters.transferTimeMax === 'number') {
    result = result.filter((r) => {
      const match = (r.transferTime ?? '').match(/(\d+)/)
      const mins = match ? parseInt(match[1]!, 10) : 999
      return mins <= filters.transferTimeMax!
    })
  }
  if (filters.beachPresence === true) {
    result = result.filter((r) => r.beachPresence === true)
  }
  if (Array.isArray(filters.roomTypes) && filters.roomTypes.length > 0) {
    result = result.filter((r) =>
      (r.roomTypes ?? []).some((rt) => filters.roomTypes!.includes(rt.name))
    )
  }
  if (filters.priceBand) {
    result = result.filter((r) => r.priceBand === filters.priceBand)
  }
  if (filters.region) {
    result = result.filter((r) => (r.region ?? r.location?.region ?? '').toLowerCase().includes(filters.region!.toLowerCase()))
  }
  if (filters.resortType) {
    result = result.filter((r) => (r.resortType ?? '').toLowerCase().includes(filters.resortType!.toLowerCase()))
  }
  if (Array.isArray(filters.tags) && filters.tags.length > 0) {
    result = result.filter((r) =>
      (r.tags ?? []).some((t) => filters.tags!.includes(t))
    )
  }

  const sortField = filters.sort ?? 'name'
  const sortOrder = filters.sortOrder ?? 'asc'
  const mult = sortOrder === 'asc' ? 1 : -1
  result.sort((a, b) => {
    const av = String((a as unknown as Record<string, unknown>)[sortField] ?? '')
    const bv = String((b as unknown as Record<string, unknown>)[sortField] ?? '')
    return mult * av.localeCompare(bv)
  })

  const page = Math.max(1, filters.page ?? 1)
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 24))
  const start = (page - 1) * pageSize
  const paginated = result.slice(start, start + pageSize)

  return { data: paginated, total: result.length }
}

export const resortsApi = {
  /** Alias for getResorts - used by calendar and resort-room-picker */
  async searchResorts(filters?: {
    query?: string
    transfer_time_max?: number
  }): Promise<Resort[]> {
    const res = await resortsApi.getResorts({
      search: filters?.query,
      transferTimeMax: filters?.transfer_time_max,
    })
    return res.data ?? []
  },

  async getResorts(filters: ResortFilters = {}): Promise<ResortsResponse> {
    try {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.kidsPolicy) params.set('kidsPolicy', filters.kidsPolicy)
      if (filters.transferTimeMax != null) params.set('transferTimeMax', String(filters.transferTimeMax))
      if (filters.beachPresence === true) params.set('beachPresence', 'true')
      if (Array.isArray(filters.roomTypes)) params.set('roomTypes', filters.roomTypes.join(','))
      if (filters.priceBand) params.set('priceBand', filters.priceBand)
      if (filters.region) params.set('region', filters.region)
      if (filters.resortType) params.set('resortType', filters.resortType)
      if (Array.isArray(filters.tags)) params.set('tags', filters.tags.join(','))
      if (filters.page) params.set('page', String(filters.page))
      if (filters.pageSize) params.set('pageSize', String(filters.pageSize))
      if (filters.sort) params.set('sort', filters.sort)
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder ?? 'asc')

      const qs = params.toString()
      const res = await api.get<ResortsResponse>(`/resorts?${qs}`)
      return normalizeResortsResponse(res)
    } catch {
      return filterResorts(MOCK_RESORTS, filters)
    }
  },

  async getResort(id: string): Promise<Resort | null> {
    try {
      const res = await api.get<Resort>(`/resorts/${id}`)
      return res ?? null
    } catch {
      return (MOCK_RESORTS ?? []).find((r) => r.id === id) ?? null
    }
  },

  async createResort(input: ResortCreateInput): Promise<Resort | null> {
    try {
      const res = await api.post<Resort>('/resorts', input)
      return res ?? null
    } catch {
      const id = `r-${Date.now()}`
      const roomTypes = (input.roomTypes ?? []).map((rt, i) => ({
        id: `rt-${id}-${i}`,
        resortId: id,
        name: rt.name,
        maxOccupancy: rt.maxOccupancy,
        bedConfig: rt.bedConfig,
      })) as RoomType[]
      return {
        id,
        name: input.name,
        location: input.location,
        transferTime: input.transferTime,
        kidsPolicy: input.kidsPolicy,
        dining: input.dining ?? [],
        roomTypes,
        perks: input.perks ?? [],
        restrictions: input.restrictions,
        tags: input.tags ?? [],
        beachPresence: input.beachPresence,
        priceBand: input.priceBand,
        region: input.region,
        resortType: input.resortType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Resort
    }
  },

  async updateResort(id: string, input: ResortUpdateInput): Promise<Resort | null> {
    try {
      const res = await api.put<Resort>(`/resorts/${id}`, input)
      return res ?? null
    } catch {
      const existing = (MOCK_RESORTS ?? []).find((r) => r.id === id)
      return existing ? ({ ...existing, ...input, updatedAt: new Date().toISOString() } as Resort) : null
    }
  },

  async deleteResort(id: string): Promise<{ success: boolean }> {
    try {
      await api.delete(`/resorts/${id}`)
      return { success: true }
    } catch {
      return { success: true }
    }
  },

  async importResorts(payload: { csvFile?: string; mapping?: MigrationMap; preview?: boolean }): Promise<{ preview: Resort[]; logId: string; valid: boolean }> {
    try {
      const res = await api.post<{ preview: Resort[]; logId: string; valid: boolean }>('/resorts/import', payload)
      return {
        preview: Array.isArray(res?.preview) ? res.preview : [],
        logId: res?.logId ?? `log-${Date.now()}`,
        valid: res?.valid ?? true,
      }
    } catch {
      return { preview: [], logId: `log-${Date.now()}`, valid: false }
    }
  },

  async exportResorts(params?: { format?: 'csv' | 'json'; filterParams?: ResortFilters }): Promise<Blob | unknown> {
    try {
      const qs = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
      return await api.get<Blob | unknown>(`/resorts/export?${qs}`)
    } catch {
      return []
    }
  },

  async migrateResorts(payload: MigrationMap): Promise<{ jobId: string; status: string }> {
    try {
      const res = await api.post<{ jobId: string; status: string }>('/resorts/migrate', payload)
      return res ?? { jobId: `job-${Date.now()}`, status: 'queued' }
    } catch {
      return { jobId: `job-${Date.now()}`, status: 'queued' }
    }
  },

  async getPresets(): Promise<{ items: Preset[] }> {
    try {
      const res = await api.get<{ items: Preset[] }>('/resorts/presets')
      return { items: Array.isArray(res?.items) ? res.items : [] }
    } catch {
      return { items: MOCK_PRESETS }
    }
  },

  async savePreset(input: PresetInput): Promise<Preset | null> {
    try {
      const res = await api.post<Preset>('/resorts/presets', input)
      return res ?? null
    } catch {
      return {
        id: `pr-${Date.now()}`,
        name: input.name,
        filters: input.filters,
        shared: input.shared,
        createdAt: new Date().toISOString(),
      }
    }
  },

  async deletePreset(id: string): Promise<{ success: boolean }> {
    try {
      await api.delete(`/resorts/presets/${id}`)
      return { success: true }
    } catch {
      return { success: true }
    }
  },
}
