/**
 * Clients API - fetches client list with filters, search, pagination
 * Uses mock data for local development; swap for Supabase/Edge Function in production
 */
import { api } from '@/lib/api'
import type {
  Client,
  ClientFilters,
  ClientsResponse,
  ClientCreateInput,
  ClientUpdateInput,
  SavedSearch,
  SearchSuggestion,
} from '@/types/client'

const MOCK_CLIENTS: Client[] = [
  {
    id: 'c1',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah@example.com',
    phone: '+1 555 123 4567',
    vip: true,
    family: true,
    frequentTraveler: true,
    lastActive: '2025-02-28T10:00:00Z',
    nextTripDate: '2025-03-15',
    status: 'active',
    country: 'United States',
    outstandingBalance: 0,
    avatarUrl: null,
    hasDocuments: true,
    lastContact: '2025-02-28T10:00:00Z',
    notes: 'VIP - prefers ocean view',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2025-02-28T10:00:00Z',
  },
  {
    id: 'c2',
    firstName: 'James',
    lastName: 'Chen',
    email: 'james@example.com',
    phone: '+44 20 7946 0958',
    vip: false,
    family: false,
    frequentTraveler: true,
    lastActive: '2025-02-25T14:30:00Z',
    nextTripDate: '2025-03-20',
    status: 'active',
    country: 'United Kingdom',
    outstandingBalance: 8200,
    avatarUrl: null,
    hasDocuments: false,
    lastContact: '2025-02-25T14:30:00Z',
    notes: null,
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2025-02-25T14:30:00Z',
  },
  {
    id: 'c3',
    firstName: 'Emma',
    lastName: 'Laurent',
    email: 'emma@example.com',
    phone: '+33 1 23 45 67 89',
    vip: true,
    family: true,
    frequentTraveler: true,
    lastActive: '2025-02-27T09:15:00Z',
    nextTripDate: '2025-03-03',
    status: 'active',
    country: 'France',
    outstandingBalance: 4500,
    avatarUrl: null,
    hasDocuments: true,
    lastContact: '2025-02-27T09:15:00Z',
    notes: 'Helicopter transfer requested',
    createdAt: '2023-11-20T00:00:00Z',
    updatedAt: '2025-02-27T09:15:00Z',
  },
  {
    id: 'c4',
    firstName: 'Sophie',
    lastName: 'Müller',
    email: 'sophie@example.com',
    phone: '+49 30 12345678',
    vip: true,
    family: false,
    frequentTraveler: true,
    lastActive: '2025-02-26T16:00:00Z',
    nextTripDate: '2025-03-07',
    status: 'active',
    country: 'Germany',
    outstandingBalance: 12500,
    avatarUrl: null,
    hasDocuments: true,
    lastContact: '2025-02-26T16:00:00Z',
    notes: null,
    createdAt: '2024-02-10T00:00:00Z',
    updatedAt: '2025-02-26T16:00:00Z',
  },
  {
    id: 'c5',
    firstName: 'Michael',
    lastName: 'Rodriguez',
    email: 'michael@example.com',
    phone: '+34 91 123 4567',
    vip: false,
    family: true,
    frequentTraveler: false,
    lastActive: '2025-02-20T11:00:00Z',
    nextTripDate: null,
    status: 'prospect',
    country: 'Spain',
    outstandingBalance: 0,
    avatarUrl: null,
    hasDocuments: false,
    lastContact: '2025-02-20T11:00:00Z',
    notes: null,
    createdAt: '2025-01-05T00:00:00Z',
    updatedAt: '2025-02-20T11:00:00Z',
  },
]

/** Normalize API response - ensure arrays, safe defaults (runtime safety) */
function normalizeClientsResponse(raw: unknown): ClientsResponse {
  const data = raw as Partial<ClientsResponse> | null | undefined
  const list = Array.isArray(data?.data) ? data.data : []
  const count = typeof data?.count === 'number' ? data.count : list.length
  return { data: list, count }
}

function getClientName(client: Client): string {
  return `${client?.firstName ?? ''} ${client?.lastName ?? ''}`.trim() || 'Unknown'
}

/** Filter and sort clients client-side for mock; in production this would be server-side */
function filterAndSortClients(
  clients: Client[],
  filters: ClientFilters
): { data: Client[]; count: number } {
  let result = [...(clients ?? [])]

  const search = (filters.search ?? '').toLowerCase().trim()
  if (search) {
    result = result.filter(
      (c) =>
        getClientName(c).toLowerCase().includes(search) ||
        (c.email ?? '').toLowerCase().includes(search) ||
        (c.phone ?? '').replace(/\s/g, '').includes(search.replace(/\s/g, ''))
    )
  }
  if (filters.vip === true) {
    result = result.filter((c) => c.vip)
  }
  if (filters.family === true) {
    result = result.filter((c) => c.family)
  }
  if (filters.frequentTraveler === true) {
    result = result.filter((c) => c.frequentTraveler === true)
  }
  if (filters.country) {
    result = result.filter(
      (c) => (c.country ?? '').toLowerCase() === filters.country?.toLowerCase()
    )
  }
  if (filters.lastActiveFrom) {
    const from = new Date(filters.lastActiveFrom).getTime()
    result = result.filter((c) => {
      const la = c.lastActive ? new Date(c.lastActive).getTime() : 0
      return la >= from
    })
  }
  if (filters.lastActiveTo) {
    const to = new Date(filters.lastActiveTo).getTime()
    result = result.filter((c) => {
      const la = c.lastActive ? new Date(c.lastActive).getTime() : 0
      return la <= to
    })
  }

  const sortField = filters.sort ?? 'name'
  const sortOrder = filters.sortOrder ?? 'asc'
  const mult = sortOrder === 'asc' ? 1 : -1
  result.sort((a, b) => {
    let av: string | number | null = null
    let bv: string | number | null = null
    switch (sortField) {
      case 'name':
        av = getClientName(a)
        bv = getClientName(b)
        break
      case 'nextTripDate':
        av = a.nextTripDate ?? ''
        bv = b.nextTripDate ?? ''
        break
      case 'outstandingBalance':
        av = a.outstandingBalance ?? 0
        bv = b.outstandingBalance ?? 0
        return mult * (Number(av) - Number(bv))
      case 'lastContact':
        av = a.lastContact ?? ''
        bv = b.lastContact ?? ''
        break
      case 'lastActive':
        av = a.lastActive ?? ''
        bv = b.lastActive ?? ''
        break
      case 'country':
        av = a.country ?? ''
        bv = b.country ?? ''
        break
      default:
        av = getClientName(a)
        bv = getClientName(b)
    }
    return mult * String(av).localeCompare(String(bv))
  })

  const page = Math.max(1, filters.page ?? 1)
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20))
  const start = (page - 1) * limit
  const paginated = result.slice(start, start + limit)

  return { data: paginated, count: result.length }
}

export const clientsApi = {
  /**
   * GET /api/clients?search=&vip=&family=&country=&lastActive=&sort=&page=&limit=
   */
  async getClients(filters: ClientFilters = {}): Promise<ClientsResponse> {
    try {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.vip) params.set('vip', 'true')
      if (filters.family) params.set('family', 'true')
      if (filters.frequentTraveler) params.set('frequentTraveler', 'true')
      if (filters.country) params.set('country', filters.country)
      if (filters.lastActiveFrom) params.set('lastActiveFrom', filters.lastActiveFrom)
      if (filters.lastActiveTo) params.set('lastActiveTo', filters.lastActiveTo)
      if (filters.sort) params.set('sort', filters.sort)
      if (filters.sortOrder) params.set('sortOrder', filters.sortOrder)
      if (filters.page) params.set('page', String(filters.page))
      if (filters.limit) params.set('limit', String(filters.limit))

      const qs = params.toString()
      const res = await api.get<ClientsResponse>(`/clients?${qs}`)
      return normalizeClientsResponse(res)
    } catch {
      return filterAndSortClients(MOCK_CLIENTS, filters)
    }
  },

  /**
   * GET /api/clients/:id
   */
  async getClient(id: string): Promise<Client | null> {
    try {
      const res = await api.get<Client>(`/clients/${id}`)
      return res ?? null
    } catch {
      return (MOCK_CLIENTS ?? []).find((c) => c.id === id) ?? null
    }
  },

  /**
   * POST /api/clients
   */
  async createClient(input: ClientCreateInput): Promise<Client> {
    try {
      const res = await api.post<Client>('/clients', input)
      return res as Client
    } catch {
      const newClient: Client = {
        id: `c${Date.now()}`,
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email ?? null,
        phone: input.phone ?? null,
        vip: input.vip ?? false,
        family: input.family ?? false,
        lastActive: new Date().toISOString(),
        nextTripDate: null,
        status: 'active',
        country: input.country ?? null,
        outstandingBalance: 0,
        avatarUrl: null,
        hasDocuments: false,
        lastContact: new Date().toISOString(),
        notes: input.notes ?? null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      MOCK_CLIENTS.push(newClient)
      return newClient
    }
  },

  /**
   * PUT /api/clients/:id
   */
  async updateClient(id: string, input: ClientUpdateInput): Promise<Client> {
    try {
      const res = await api.put<Client>(`/clients/${id}`, input)
      return res as Client
    } catch {
      const idx = (MOCK_CLIENTS ?? []).findIndex((c) => c.id === id)
      if (idx >= 0 && MOCK_CLIENTS[idx]) {
        MOCK_CLIENTS[idx] = { ...MOCK_CLIENTS[idx]!, ...input }
        return MOCK_CLIENTS[idx]!
      }
      throw new Error('Client not found')
    }
  },

  /**
   * DELETE /api/clients/:id
   */
  async deleteClient(id: string): Promise<void> {
    try {
      await api.delete(`/clients/${id}`)
    } catch {
      const idx = (MOCK_CLIENTS ?? []).findIndex((c) => c.id === id)
      if (idx >= 0) MOCK_CLIENTS.splice(idx, 1)
    }
  },

  /**
   * Search for autosuggest - returns clients matching query
   */
  async searchSuggestions(query: string): Promise<SearchSuggestion[]> {
    const q = (query ?? '').trim().toLowerCase()
    if (!q) return []

    const clients = (MOCK_CLIENTS ?? []).filter(
      (c) =>
        getClientName(c).toLowerCase().includes(q) ||
        (c.email ?? '').toLowerCase().includes(q) ||
        (c.phone ?? '').replace(/\s/g, '').includes(q.replace(/\s/g, ''))
    )

    return clients.slice(0, 8).map((c) => ({
      id: c.id,
      type: 'client' as const,
      label: getClientName(c),
      sublabel: c.email ?? c.phone ?? undefined,
      href: `/dashboard/clients/${c.id}`,
    }))
  },

  /**
   * POST /api/clients/bulk-export
   */
  async bulkExport(clientIds: string[]): Promise<{ url?: string }> {
    try {
      const res = await api.post<{ url?: string }>('/clients/bulk-export', {
        clientIds,
      })
      return res ?? {}
    } catch {
      return {}
    }
  },

  /**
   * POST /api/clients/merge
   */
  async mergeClients(sourceIds: string[], targetId: string): Promise<Client | null> {
    try {
      const res = await api.post<Client>('/clients/merge', {
        sourceIds,
        targetId,
      })
      return res ?? null
    } catch {
      return clientsApi.getClient(targetId)
    }
  },

  /**
   * GET /api/saved-searches
   */
  async getSavedSearches(): Promise<SavedSearch[]> {
    try {
      const res = await api.get<SavedSearch[] | { data?: SavedSearch[] }>(
        '/saved-searches'
      )
      const list = Array.isArray(res) ? res : Array.isArray((res as { data?: SavedSearch[] })?.data) ? (res as { data: SavedSearch[] }).data : []
      return list ?? []
    } catch {
      return []
    }
  },

  /**
   * POST /api/saved-searches
   */
  async saveSearch(name: string, queryJson: string, isDefault = false): Promise<SavedSearch> {
    try {
      const res = await api.post<SavedSearch>('/saved-searches', {
        name,
        queryJson,
        isDefault,
      })
      return res as SavedSearch
    } catch {
      return {
        id: `ss-${Date.now()}`,
        userId: 'current',
        name,
        queryJson,
        isDefault,
        createdAt: new Date().toISOString(),
      }
    }
  },
}
