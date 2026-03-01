/**
 * Client data models for LuxeFlow CRM
 * All types support null-safe handling per runtime safety rules
 */

export interface Client {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  vip: boolean
  family: boolean
  frequentTraveler?: boolean
  lastActive: string | null
  nextTripDate: string | null
  status: ClientStatus
  country: string | null
  outstandingBalance: number
  avatarUrl: string | null
  hasDocuments: boolean
  lastContact: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type ClientStatus = 'active' | 'inactive' | 'prospect' | 'archived'

export interface ClientFilters {
  search?: string
  vip?: boolean
  family?: boolean
  frequentTraveler?: boolean
  country?: string
  lastActiveFrom?: string
  lastActiveTo?: string
  sort?: ClientSortField
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export type ClientSortField =
  | 'name'
  | 'nextTripDate'
  | 'outstandingBalance'
  | 'lastContact'
  | 'lastActive'
  | 'country'

export interface ClientsResponse {
  data: Client[]
  count: number
}

export interface SavedSearch {
  id: string
  userId: string
  name: string
  queryJson: string
  isDefault: boolean
  createdAt: string
}

export interface ClientCreateInput {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  vip?: boolean
  family?: boolean
  country?: string
  notes?: string
}

export interface ClientUpdateInput extends Partial<ClientCreateInput> {}

/** Suggestion item for autosuggest dropdown */
export interface SearchSuggestion {
  id: string
  type: 'client' | 'booking' | 'resort' | 'document'
  label: string
  sublabel?: string
  href?: string
}
