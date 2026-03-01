/**
 * Resort Bible types - Master resort directory for LuxeFlow CRM
 * All types support null-safe handling per runtime safety rules
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
  createdAt?: string
  updatedAt?: string
}

export interface ImportLog {
  id: string
  userId: string
  action: string
  status: 'queued' | 'in_progress' | 'completed' | 'failed'
  details?: string
  createdAt: string
}

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

export interface ResortFilters {
  search?: string
  kidsPolicy?: string
  transferTimeMax?: number
  beachPresence?: string
  roomTypes?: string[]
  priceBand?: string
  priceBandMin?: number
  priceBandMax?: number
  seasonality?: string
  partnerIds?: string[]
  perks?: string[]
  tags?: string[]
  location?: string
  region?: string
  resortType?: string
}


export interface ResortCreateInput {
  name: string
  location: ResortLocation
  transferTime?: string
  kidsPolicy?: string
  dining?: string[]
  seasonality?: Omit<Seasonal, 'id' | 'resortId'>[]
  roomTypes?: Omit<RoomType, 'id' | 'resortId'>[]
  media?: Omit<MediaItem, 'id' | 'resortId'>[]
  perks?: string[]
  restrictions?: string
  internalRatings?: Omit<Rating, 'id' | 'resortId'>[]
  partners?: PartnerRef[]
  tags?: string[]
}

export interface ResortUpdateInput extends Partial<ResortCreateInput> {}

export interface ResortsResponse {
  data: Resort[]
  total: number
}

export interface MigrationMapItem {
  sourceField: string
  targetField: string
}

/** Array of field mappings for migration wizard */
export type MigrationMap = MigrationMapItem[]
