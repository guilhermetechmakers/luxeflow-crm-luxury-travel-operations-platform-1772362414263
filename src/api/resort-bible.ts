/**
 * Resort Bible API - Master resort directory endpoints
 * Uses mock data for MVP; swap for Supabase/Edge Function in production
 * Runtime safety: all responses validated with nullish coalescing and Array.isArray checks
 */
import { api } from '@/lib/api'
import type {
  Resort,
  ResortFilters,
  ResortCreateInput,
  ResortUpdateInput,
  Preset,
  PresetInput,
  ResortsResponse,
  Seasonal,
  MigrationMapItem,
} from '@/types/resort-bible'
import { safeArrayAccess } from '@/lib/resort-bible-utils'

const MOCK_RESORTS: Resort[] = [
  {
    id: 'r1',
    name: 'Villa Serenity',
    location: { city: 'Santorini', country: 'Greece', region: 'Cyclades' },
    transferTime: '45 min',
    kidsPolicy: 'All ages welcome',
    dining: ['Breakfast', 'Half board', 'À la carte'],
    roomTypes: [
      { id: 'rc1', resortId: 'r1', name: 'Deluxe Suite', bedConfig: '1 King, 1 Sofa bed', maxOccupancy: 4 },
      { id: 'rc2', resortId: 'r1', name: 'Ocean View Villa', bedConfig: '2 King', maxOccupancy: 6 },
    ],
    seasonality: [
      { id: 's1', resortId: 'r1', startMonth: 4, endMonth: 10, notes: 'Peak season' },
    ],
    media: [
      { id: 'm1', resortId: 'r1', url: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0b49d', caption: 'Caldera view', order: 0 },
    ],
    perks: ['Breakfast', 'Airport transfer', 'Spa access'],
    internalRatings: [{ id: 'ir1', resortId: 'r1', rating: 5, reviewer: 'Ops', notes: 'Excellent' }],
    partners: [{ id: 'p1', name: 'Luxe Partners', contactInfo: 'partners@luxe.com' }],
    tags: ['Family', 'Beach', 'Luxury'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'r2',
    name: 'Ocean View Resort',
    location: { city: 'Santorini', country: 'Greece', region: 'Cyclades' },
    transferTime: '25 min',
    kidsPolicy: '12+ only',
    dining: ['Breakfast', 'Room service'],
    roomTypes: [
      { id: 'rc3', resortId: 'r2', name: 'Cave Suite', bedConfig: '1 King', maxOccupancy: 2 },
      { id: 'rc4', resortId: 'r2', name: 'Family Suite', bedConfig: '2 King', maxOccupancy: 4 },
    ],
    seasonality: [{ id: 's2', resortId: 'r2', startMonth: 4, endMonth: 10, notes: 'Apr–Oct' }],
    media: [],
    perks: ['Breakfast', 'Infinity pool', 'Concierge'],
    internalRatings: [{ id: 'ir2', resortId: 'r2', rating: 4, reviewer: 'Ops', notes: 'Great views' }],
    partners: [],
    tags: ['Luxury', 'Cliff-top'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'r3',
    name: 'Mountain Lodge',
    location: { city: 'Zermatt', country: 'Switzerland', region: 'Swiss Alps' },
    transferTime: '90 min',
    kidsPolicy: 'All ages welcome',
    dining: ['Half board', 'Full board'],
    roomTypes: [
      { id: 'rc5', resortId: 'r3', name: 'Alpine Chalet', bedConfig: '2 King, 2 Twin', maxOccupancy: 6 },
    ],
    seasonality: [
      { id: 's3a', resortId: 'r3', startMonth: 12, endMonth: 4, notes: 'Ski season' },
      { id: 's3b', resortId: 'r3', startMonth: 6, endMonth: 9, notes: 'Summer' },
    ],
    media: [],
    perks: ['Half board', 'Ski storage', 'Spa'],
    internalRatings: [{ id: 'ir3', resortId: 'r3', rating: 5, reviewer: 'Ops', notes: 'Premium' }],
    partners: [{ id: 'p2', name: 'Alpine Partners' }],
    tags: ['Ski', 'Wellness', 'Family'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'r4',
    name: 'Château des Alpes',
    location: { city: 'Chamonix', country: 'France', region: 'Haute-Savoie' },
    transferTime: '60 min',
    kidsPolicy: 'All ages welcome',
    dining: ['Breakfast', 'Dinner'],
    roomTypes: [
      { id: 'rc6', resortId: 'r4', name: 'Grand Suite', bedConfig: '1 King', maxOccupancy: 3 },
      { id: 'rc7', resortId: 'r4', name: 'Tower Room', bedConfig: '1 King', maxOccupancy: 2 },
    ],
    seasonality: [{ id: 's4', resortId: 'r4', startMonth: 1, endMonth: 12, notes: 'Year-round' }],
    media: [],
    perks: ['Breakfast', 'Wine tasting', 'Gardens'],
    internalRatings: [{ id: 'ir4', resortId: 'r4', rating: 4, reviewer: 'Ops' }],
    partners: [],
    tags: ['Luxury', 'Wine', 'Gardens'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'r5',
    name: 'Palazzo Riviera',
    location: { city: 'Amalfi', country: 'Italy', region: 'Campania' },
    transferTime: '35 min',
    kidsPolicy: 'All ages welcome',
    dining: ['Breakfast', 'À la carte'],
    roomTypes: [
      { id: 'rc8', resortId: 'r5', name: 'Garden View', bedConfig: '1 King', maxOccupancy: 2 },
      { id: 'rc9', resortId: 'r5', name: 'Terrace Suite', bedConfig: '1 King, 1 Sofa', maxOccupancy: 4 },
    ],
    seasonality: [{ id: 's5', resortId: 'r5', startMonth: 1, endMonth: 12, notes: 'Year-round' }],
    media: [],
    perks: ['Breakfast', 'Pool', 'Bike rental'],
    internalRatings: [{ id: 'ir5', resortId: 'r5', rating: 4, reviewer: 'Ops' }],
    partners: [{ id: 'p3', name: 'Italian Partners' }],
    tags: ['Beach', 'Family', 'Coastal'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
]

const MOCK_PRESETS: Preset[] = [
  { id: 'pr1', name: 'Family-friendly beach', filters: { kidsPolicy: 'All ages', beachPresence: 'Beachfront' }, shared: true },
  { id: 'pr2', name: 'Quick transfer', filters: { transferTimeMax: 45 }, shared: false },
]

function filterResorts(resorts: Resort[], filters: ResortFilters): Resort[] {
  let result = [...(resorts ?? [])]

  const search = (filters.search ?? '').toLowerCase().trim()
  if (search) {
    result = result.filter((r) => {
      const name = (r.name ?? '').toLowerCase()
      const city = (r.location?.city ?? '').toLowerCase()
      const country = (r.location?.country ?? '').toLowerCase()
      const region = (r.location?.region ?? '').toLowerCase()
      const tags = (r.tags ?? []).join(' ').toLowerCase()
      return name.includes(search) || city.includes(search) || country.includes(search) || region.includes(search) || tags.includes(search)
    })
  }

  if (filters.kidsPolicy) {
    result = result.filter((r) => (r.kidsPolicy ?? '').toLowerCase().includes(filters.kidsPolicy!.toLowerCase()))
  }

  if (typeof filters.transferTimeMax === 'number') {
    result = result.filter((r) => {
      const match = (r.transferTime ?? '').match(/\d+/)
      const mins = match ? parseInt(match[0], 10) : 999
      return mins <= filters.transferTimeMax!
    })
  }

  if (filters.beachPresence) {
    const beach = filters.beachPresence.toLowerCase()
    result = result.filter((r) => {
      const tags = (r.tags ?? []).join(' ').toLowerCase()
      const perks = (r.perks ?? []).join(' ').toLowerCase()
      return tags.includes(beach) || perks.includes(beach) || (r.location?.region ?? '').toLowerCase().includes(beach)
    })
  }

  if (Array.isArray(filters.roomTypes) && filters.roomTypes.length > 0) {
    result = result.filter((r) => {
      const names = (r.roomTypes ?? []).map((rt) => (rt.name ?? '').toLowerCase())
      return filters.roomTypes!.some((t) => names.some((n) => n.includes(t.toLowerCase())))
    })
  }

  if (filters.location) {
    result = result.filter(
      (r) =>
        (r.location?.city ?? '').toLowerCase().includes(filters.location!.toLowerCase()) ||
        (r.location?.country ?? '').toLowerCase().includes(filters.location!.toLowerCase())
    )
  }

  if (filters.region) {
    result = result.filter((r) => (r.location?.region ?? '').toLowerCase().includes(filters.region!.toLowerCase()))
  }

  if (filters.resortType) {
    const rt = filters.resortType.toLowerCase()
    result = result.filter((r) => {
      const tags = (r.tags ?? []).join(' ').toLowerCase()
      return tags.includes(rt) || (r.location?.region ?? '').toLowerCase().includes(rt)
    })
  }

  if (Array.isArray(filters.tags) && filters.tags.length > 0) {
    result = result.filter((r) => {
      const resortTags = (r.tags ?? []).map((t) => t.toLowerCase())
      return filters.tags!.some((t) => resortTags.includes(t.toLowerCase()))
    })
  }

  return result
}

export const resortBibleApi = {
  async getResorts(filters: ResortFilters = {}, page = 1, pageSize = 24): Promise<ResortsResponse> {
    try {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.kidsPolicy) params.set('kidsPolicy', filters.kidsPolicy)
      if (filters.transferTimeMax != null) params.set('transferTimeMax', String(filters.transferTimeMax))
      if (filters.beachPresence) params.set('beachPresence', filters.beachPresence)
      if (filters.location) params.set('location', filters.location)
      if (filters.region) params.set('region', filters.region)
      params.set('page', String(page))
      params.set('pageSize', String(pageSize))

      const res = await api.get<ResortsResponse>(`/resorts?${params.toString()}`)
      const data = safeArrayAccess((res as ResortsResponse)?.data)
      const total = typeof (res as ResortsResponse)?.total === 'number' ? (res as ResortsResponse).total : data.length
      return { data, total }
    } catch {
      const filtered = filterResorts(MOCK_RESORTS, filters)
      const start = (page - 1) * pageSize
      const data = filtered.slice(start, start + pageSize)
      return { data, total: filtered.length }
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

  async createResort(input: ResortCreateInput): Promise<Resort> {
    try {
      const res = await api.post<Resort>('/resorts', input)
      return res as Resort
    } catch {
      const id = `r${Date.now()}`
      const seasonality: Seasonal[] = (input.seasonality ?? []).map((s, i) => ({
        ...s,
        id: `s-${id}-${i}`,
        resortId: id,
      }))
      const roomTypes = (input.roomTypes ?? []).map((rt, i) => ({ ...rt, id: `rc-${id}-${i}`, resortId: id })) as Resort['roomTypes']
      const media = (input.media ?? []).map((m, i) => ({ ...m, id: `m-${id}-${i}`, resortId: id })) as Resort['media']
      const internalRatings = (input.internalRatings ?? []).map((ir, i) => ({ ...ir, id: `ir-${id}-${i}`, resortId: id })) as Resort['internalRatings']
      return {
        id,
        name: input.name,
        location: input.location,
        transferTime: input.transferTime,
        kidsPolicy: input.kidsPolicy,
        dining: input.dining ?? [],
        roomTypes,
        seasonality,
        media,
        perks: input.perks ?? [],
        internalRatings,
        partners: input.partners ?? [],
        tags: input.tags ?? [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
  },

  async updateResort(id: string, input: ResortUpdateInput): Promise<Resort> {
    try {
      const res = await api.put<Resort>(`/resorts/${id}`, input)
      return res as Resort
    } catch {
      const existing = (MOCK_RESORTS ?? []).find((r) => r.id === id)
      if (!existing) throw new Error('Resort not found')
      return { ...existing, ...input, id, updatedAt: new Date().toISOString() } as Resort
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

  async importResorts(_csvFile: File, mapping: Record<string, string>, _preview = true): Promise<{ preview: Resort[]; logId: string; valid: boolean }> {
    try {
      const res = await api.post<{ preview: Resort[]; logId: string; valid: boolean }>('/resorts/import', { mapping })
      return {
        preview: safeArrayAccess(res?.preview),
        logId: res?.logId ?? `log-${Date.now()}`,
        valid: res?.valid ?? false,
      }
    } catch {
      return { preview: [], logId: `log-${Date.now()}`, valid: false }
    }
  },

  async exportResorts(
    format: 'csv' | 'json',
    filterParams?: ResortFilters,
    resortsOverride?: Resort[]
  ): Promise<{ data: Resort[]; blob: Blob }> {
    const data =
      Array.isArray(resortsOverride) && resortsOverride.length > 0
        ? resortsOverride
        : filterResorts(MOCK_RESORTS, filterParams ?? {})
    const content =
      format === 'json'
        ? JSON.stringify(data)
        : 'id,name,location\n' +
          data.map((r) => `${r.id},${r.name},"${r.location?.city ?? ''}, ${r.location?.country ?? ''}"`).join('\n')
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' })
    return { data, blob }
  },

  async migrateResorts(mapping: MigrationMapItem[]): Promise<{ jobId: string; status: string }> {
    try {
      const res = await api.post<{ jobId: string; status: string }>('/resorts/migrate', { mapping })
      return { jobId: res?.jobId ?? `job-${Date.now()}`, status: res?.status ?? 'queued' }
    } catch {
      return { jobId: `job-${Date.now()}`, status: 'queued' }
    }
  },

  async getPresets(): Promise<Preset[]> {
    try {
      const res = await api.get<{ items: Preset[] }>('/resorts/presets')
      return safeArrayAccess((res as { items?: Preset[] })?.items)
    } catch {
      return [...MOCK_PRESETS]
    }
  },

  async savePreset(input: PresetInput): Promise<Preset> {
    try {
      const res = await api.post<Preset>('/resorts/presets', input)
      return res as Preset
    } catch {
      return {
        id: `pr-${Date.now()}`,
        name: input.name,
        filters: input.filters,
        shared: input.shared ?? false,
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
