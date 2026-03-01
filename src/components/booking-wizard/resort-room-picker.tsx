/**
 * ResortRoomPicker - Resort Bible search with filters; card-based results; room category selector
 */
import { useState, useEffect } from 'react'
import { Search, MapPin, Clock, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'
import { resortsApi } from '@/api/resorts'
import { cn } from '@/lib/utils'
import type { ResortBibleItem, RoomCategoryRef } from '@/types/booking'

export interface ResortRoomPickerProps {
  value: {
    resort: ResortBibleItem | null
    room: RoomCategoryRef | null
    checkIn: string
    checkOut: string
  }
  onChange: (
    resort: ResortBibleItem | null,
    room: RoomCategoryRef | null,
    checkIn?: string,
    checkOut?: string
  ) => void
  errors?: string[]
}

export function ResortRoomPicker({ value, onChange, errors = [] }: ResortRoomPickerProps) {
  const [query, setQuery] = useState('')
  const [transferMax, setTransferMax] = useState<number | ''>('')
  const [results, setResults] = useState<ResortBibleItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => {
    const q = (debouncedQuery ?? '').trim()
    setIsSearching(true)
    resortsApi
      .searchResorts({
        query: q || undefined,
        transfer_time_max: typeof transferMax === 'number' ? transferMax : undefined,
      })
      .then((list) => {
        setResults(Array.isArray(list) ? list : [])
      })
      .finally(() => setIsSearching(false))
  }, [debouncedQuery, transferMax])

  const handleSelectResort = (resort: ResortBibleItem) => {
    const rooms = resort.room_types ?? []
    const firstRoom = rooms[0] ?? null
    onChange(resort, firstRoom, value.checkIn, value.checkOut)
  }

  const handleSelectRoom = (room: RoomCategoryRef) => {
    onChange(value.resort, room, value.checkIn, value.checkOut)
  }

  const handleDatesChange = (checkIn: string, checkOut: string) => {
    onChange(value.resort, value.room, checkIn, checkOut)
  }

  const handleClear = () => {
    onChange(null, null, value.checkIn, value.checkOut)
    setQuery('')
  }

  const resortList = results ?? []
  const hasErrors = (errors ?? []).length > 0

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle className="font-serif text-lg">Resort & Room Selection</CardTitle>
        <p className="text-sm text-muted-foreground">
          Search the Resort Bible. Filter by transfer time, kids policy, and more.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="check-in">Check-in</Label>
            <Input
              id="check-in"
              type="date"
              value={value.checkIn ?? ''}
              onChange={(e) => handleDatesChange(e.target.value, value.checkOut ?? '')}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="check-out">Check-out</Label>
            <Input
              id="check-out"
              type="date"
              value={value.checkOut ?? ''}
              onChange={(e) => handleDatesChange(value.checkIn ?? '', e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        {value.resort ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-secondary/30 p-4">
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg font-semibold">{value.resort.name}</p>
                {value.resort.location && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                    {value.resort.location}
                  </p>
                )}
                {value.resort.transfer_time_minutes != null && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 shrink-0" aria-hidden />
                    {value.resort.transfer_time_minutes} min transfer
                  </p>
                )}
                {((value.resort as { inclusions?: string[] }).inclusions ?? []).length > 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {(value.resort as { inclusions?: string[] }).inclusions?.join(' · ')}
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleClear}>
                Change
              </Button>
            </div>

            {((value.resort.room_types ?? []).length ?? 0) > 0 && (
              <div>
                <Label>Room Category</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(value.resort.room_types ?? []).map((room) => (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => handleSelectRoom(room)}
                      className={cn(
                        'inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200',
                        value.room?.id === room.id
                          ? 'border-accent bg-accent text-accent-foreground shadow-sm'
                          : 'border-border bg-card hover:border-accent/50 hover:shadow-card'
                      )}
                    >
                      {room.name}
                      {room.capacity != null && (
                        <span className="flex items-center gap-1 text-xs opacity-90">
                          <Users className="h-3 w-3" aria-hidden />
                          {room.capacity}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="resort-search">Search resorts</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                  <Input
                    id="resort-search"
                    placeholder="Resort name or location..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="transfer-max">Max transfer time (min)</Label>
                <Input
                  id="transfer-max"
                  type="number"
                  placeholder="Any"
                  value={transferMax}
                  onChange={(e) => {
                    const v = e.target.value
                    setTransferMax(v === '' ? '' : parseInt(v, 10))
                  }}
                  min={0}
                  className="mt-1"
                />
              </div>
            </div>

            {isSearching ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-pulse rounded-full bg-secondary" aria-hidden />
              </div>
            ) : resortList.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground" aria-hidden />
                <p className="mt-4 text-muted-foreground">
                  {query ? 'No resorts match your search' : 'Enter a search to find resorts'}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {resortList.map((resort) => (
                  <button
                    key={resort.id}
                    type="button"
                    onClick={() => handleSelectResort(resort)}
                    className="flex flex-col items-start rounded-lg border border-border bg-card p-4 text-left transition-all duration-200 hover:border-accent/50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <p className="font-serif font-semibold">{resort.name}</p>
                    {resort.location && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                        {resort.location}
                      </p>
                    )}
                    {resort.transfer_time_minutes != null && (
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 shrink-0" aria-hidden />
                        {resort.transfer_time_minutes} min transfer
                      </p>
                    )}
                    {(resort.room_types ?? []).length > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {(resort.room_types ?? []).length} room types
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {hasErrors && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
            {(errors ?? []).map((msg, i) => (
              <p key={i} className="text-sm text-destructive">
                {msg}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
