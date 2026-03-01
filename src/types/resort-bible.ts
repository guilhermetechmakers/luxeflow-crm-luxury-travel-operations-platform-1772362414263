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
  type?: 'image' | 'video' | string
  order?: number
  photographer?: string
}

export interface RoomOccupancy {
  adults: number
  kids?: number
}

export interface RoomType {
  id: string
  resortId: string
  name: string
  maxOccupancy?: number
  bedConfig?: string
  image?: string
  occupancy?: RoomOccupancy
  rateSample?: number
  is2Bedroom?: boolean
  description?: string
}

/** Supplier/partner contact with full details */
export interface Contact {
  id: string
  name: string
  role?: string
  email?: string
  phone?: string
  notes?: string
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
  date?: string
  source?: string
  comments?: string
}

/** Internal panel note with audit metadata */
export interface Note {
  id: string
  author: string
  text: string
  date: string
  category?: string
  rating?: number
}

export interface PartnerRef {
  id: string
  name: string
  contactInfo?: string
  role?: string
  email?: string
  phone?: string
  notes?: string
}

/** Dining option with optional hours and notes */
export interface DiningOption {
  options?: string[]
  hours?: string[]
  notes?: string
}

export interface Resort {
  id: string
  name: string
  location: ResortLocation
  transferTime?: string
  /** Legacy: single transfer time string; also supports transferTimes[] */
  transferTimes?: string[]
  kidsPolicy?: string
  dining?: string[] | DiningOption[]
  seasonality?: Seasonal[]
  roomTypes?: RoomType[]
  media?: MediaItem[]
  perks?: string[]
  restrictions?: string | string[]
  internalRatings?: Rating[]
  panelNotes?: Note[]
  partners?: PartnerRef[]
  /** Supplier contacts (full Contact type when available) */
  supplierContacts?: Contact[] | PartnerRef[]
  tags?: string[]
  lastUpdated?: string
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
  twoBedroomSuites?: boolean
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
  internalRatingMin?: number
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
