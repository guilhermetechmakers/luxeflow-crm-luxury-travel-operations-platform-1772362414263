/**
 * FilterPanel - Kids policy, transfer time, beach, room types, price band, seasonality, partners, perks, tags
 */
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { ResortFilters } from '@/types/resort-bible'

const KIDS_OPTIONS = [
  { value: 'Family-friendly', label: 'Family-friendly' },
  { value: 'Adults only', label: 'Adults only' },
  { value: 'All ages', label: 'All ages welcome' },
]

const TRANSFER_OPTIONS = [
  { value: '15', label: '≤ 15 min' },
  { value: '30', label: '≤ 30 min' },
  { value: '45', label: '≤ 45 min' },
  { value: '60', label: '≤ 60 min' },
  { value: '90', label: '≤ 90 min' },
]

const ROOM_TYPES = [
  'Deluxe Suite',
  '2-Bedroom Villa',
  'Water Villa',
  'Chalet Suite',
  '2-Bedroom Chalet',
  '2-Bedroom Suite',
  'Sea View Suite',
]

const PRICE_BANDS = ['Budget', 'Premium', 'Ultra-luxury']

const SEASONALITY_PRESETS = [
  { value: 'high', label: 'High season' },
  { value: 'low', label: 'Low season' },
  { value: 'peak', label: 'Peak travel' },
]

export interface FilterPanelProps {
  filters: ResortFilters
  onFiltersChange: (f: ResortFilters) => void
  onApply?: () => void
  onReset?: () => void
  hasActiveFilters?: boolean
  collapsed?: boolean
  onToggleCollapse?: () => void
  onClose?: () => void
  open?: boolean
  className?: string
}

export function FilterPanel({
  filters,
  onFiltersChange,
  onApply,
  onReset,
  hasActiveFilters = false,
  collapsed = false,
  onToggleCollapse,
  onClose: _onClose,
  open = true,
  className,
}: FilterPanelProps) {
  void _onClose
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basics: true,
    amenities: true,
    location: true,
  })

  const toggleSection = (key: string) => {
    setExpandedSections((s) => ({ ...s, [key]: !s[key] }))
  }

  const handleKidsChange = (v: string) => {
    onFiltersChange({ ...filters, kidsPolicy: v === 'all' ? undefined : v })
  }
  const handleTransferChange = (v: string) => {
    onFiltersChange({ ...filters, transferTimeMax: v === 'all' ? undefined : parseInt(v, 10) })
  }
  const handleBeachChange = (v: string) => {
    onFiltersChange({ ...filters, beachPresence: v === 'all' ? undefined : v })
  }
  const handleRoomTypeToggle = (name: string, checked: boolean) => {
    const current = filters.roomTypes ?? []
    const next = checked ? [...current, name] : current.filter((t) => t !== name)
    onFiltersChange({ ...filters, roomTypes: next.length > 0 ? next : undefined })
  }
  const handlePriceBandChange = (v: string) => {
    onFiltersChange({ ...filters, priceBand: v === 'all' ? undefined : v })
  }
  const handleSeasonalityChange = (v: string) => {
    onFiltersChange({ ...filters, seasonality: v === 'all' ? undefined : v })
  }
  const handleResortTypeChange = (v: string) => {
    onFiltersChange({ ...filters, resortType: v === 'all' ? undefined : v })
  }

  const content = (
    <div className="space-y-4">
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleSection('basics')}
          className="flex w-full items-center justify-between text-sm font-medium"
        >
          Basics
          {expandedSections.basics ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.basics && (
          <div className="space-y-3 pl-1">
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Kids policy</Label>
              <Select
                value={filters.kidsPolicy ?? 'all'}
                onValueChange={handleKidsChange}
              >
                <SelectTrigger className="mt-1" aria-label="Kids policy">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  {KIDS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Transfer time</Label>
              <Select
                value={filters.transferTimeMax != null ? String(filters.transferTimeMax) : 'all'}
                onValueChange={handleTransferChange}
              >
                <SelectTrigger className="mt-1" aria-label="Max transfer time">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  {TRANSFER_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Beach presence</Label>
              <Select
                value={filters.beachPresence ?? 'all'}
                onValueChange={handleBeachChange}
              >
                <SelectTrigger className="mt-1" aria-label="Beach presence">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="beachfront">Beachfront</SelectItem>
                  <SelectItem value="beach">Beach access</SelectItem>
                  <SelectItem value="cliff">Cliff-top</SelectItem>
                  <SelectItem value="na">N/A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleSection('amenities')}
          className="flex w-full items-center justify-between text-sm font-medium"
        >
          Amenities & Rooms
          {expandedSections.amenities ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.amenities && (
          <div className="space-y-3 pl-1">
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Room types</Label>
              <div className="mt-2 space-y-2">
                {ROOM_TYPES.map((rt) => (
                  <div key={rt} className="flex items-center space-x-2">
                    <Checkbox
                      id={`room-${rt}`}
                      checked={(filters.roomTypes ?? []).includes(rt)}
                      onCheckedChange={(c) => handleRoomTypeToggle(rt, c === true)}
                      aria-label={`Filter by ${rt}`}
                    />
                    <Label htmlFor={`room-${rt}`} className="text-sm font-normal">
                      {rt}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Price band</Label>
              <Select
                value={filters.priceBand ?? 'all'}
                onValueChange={handlePriceBandChange}
              >
                <SelectTrigger className="mt-1" aria-label="Price band">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  {PRICE_BANDS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Seasonality</Label>
              <Select
                value={filters.seasonality ?? 'all'}
                onValueChange={handleSeasonalityChange}
              >
                <SelectTrigger className="mt-1" aria-label="Seasonality">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  {SEASONALITY_PRESETS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => toggleSection('location')}
          className="flex w-full items-center justify-between text-sm font-medium"
        >
          Location
          {expandedSections.location ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {expandedSections.location && (
          <div className="space-y-3 pl-1">
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Region</Label>
              <Input
                placeholder="e.g. Mediterranean"
                value={filters.region ?? ''}
                onChange={(e) => onFiltersChange({ ...filters, region: e.target.value || undefined })}
                aria-label="Region"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs uppercase text-muted-foreground">Resort type</Label>
              <Select
                value={filters.resortType ?? 'all'}
                onValueChange={handleResortTypeChange}
              >
                <SelectTrigger className="mt-1" aria-label="Resort type">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Resort">Resort</SelectItem>
                  <SelectItem value="Lodge">Lodge</SelectItem>
                  <SelectItem value="Château">Château</SelectItem>
                  <SelectItem value="Hotel">Hotel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {onApply && (
        <div className="flex flex-col gap-2 pt-4">
          <Button size="sm" onClick={onApply} aria-label="Apply filters">
            Apply
          </Button>
          {(hasActiveFilters || filters.search) && onReset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              aria-label="Reset filters"
            >
              Reset
            </Button>
          )}
        </div>
      )}
    </div>
  )

  return (
    <aside
      role="complementary"
      aria-label="Resort filters"
      className={cn(
        'w-full shrink-0 rounded-lg border border-border bg-card p-4 shadow-card transition-all duration-300 lg:w-64',
        !open && 'hidden lg:block',
        collapsed && 'hidden lg:block',
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="font-serif text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Filters
        </h3>
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand filters' : 'Collapse filters'}
            className="lg:hidden"
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        )}
      </div>
      <div className="mt-4">{content}</div>
    </aside>
  )
}
