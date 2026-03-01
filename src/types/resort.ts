/**
 * Resort Bible types - standardized resort directory data models
 * Runtime safety: all arrays use optional chaining and nullish coalescing
 */

export interface ResortLocation {
  city: string
  country: string
  region?: string
  coordinates?: { lat: number; lng: number }
}

export interface MediaItem {
  id: string
  resortId: string
  url: string
  caption?: string
  type?: string
  order?: number
}

export interface RoomType {
  id: string
  resortId: string
  name: string
  maxOccupancy?: number
  bedConfig?: string
}

export interface Seasonal {
  id: string
  resortId: string
  startMonth: number
  endMonth: number
  notes?: string
}

export interface Rating {
  id: string
  resortId: string
  rating: number
  reviewer?: string
  notes?: string
}

export interface PartnerRef {
  id: string
  name: string
  contactInfo?: string
}

export interface Resort {
  id: string
  name: string
  location: ResortLocation
  transferTime?: string
  kidsPolicy?: string
  dining?: string[]
  seasonality?: Seasonal[]
  roomTypes?: RoomType[]
  media?: MediaItem[]
  perks?: string[]
  restrictions?: string
  internalRatings?: Rating[]
  partners?: PartnerRef[]
  tags?: string[]
  beachPresence?: boolean
  priceBand?: string
  region?: string
  resortType?: string
  createdAt?: string
  updatedAt?: string
}

export interface ResortFilters {
  search?: string
  kidsPolicy?: string
  transferTimeMax?: number
  beachPresence?: boolean
  roomTypes?: string[]
  priceBand?: string
  seasonality?: string
  partnerIds?: string[]
  perks?: string[]
  tags?: string[]
  location?: string
  region?: string
  resortType?: string
  page?: number
  pageSize?: number
  sort?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ResortsResponse {
  data: Resort[]
  total: number
}

export interface ResortCreateInput {
  name: string
  location: ResortLocation
  transferTime?: string
  kidsPolicy?: string
  dining?: string[]
  roomTypes?: Omit<RoomType, 'id' | 'resortId'>[]
  perks?: string[]
  restrictions?: string
  tags?: string[]
  beachPresence?: boolean
  priceBand?: string
  region?: string
  resortType?: string
}

export interface ResortUpdateInput extends Partial<ResortCreateInput> {}

export interface Preset {
  id: string
  name: string
  filters: ResortFilters
  shared?: boolean
  createdAt?: string
}

export interface PresetInput {
  name: string
  filters: ResortFilters
  shared?: boolean
}

export interface ImportLog {
  id: string
  userId: string
  action: string
  status: 'queued' | 'in_progress' | 'completed' | 'failed'
  details?: string
  createdAt: string
}

export interface MigrationMap {
  [csvColumn: string]: string
}
