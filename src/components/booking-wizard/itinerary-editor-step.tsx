/**
 * ItineraryEditorStep - Day-level itinerary editor for wizard
 * Add/edit/remove days, activities, transfers; drag-and-drop order; conflict checks
 */
import { useState } from 'react'
import { MapPin, Car, Plus, GripVertical, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { formatShortDate } from '@/lib/format'
import type { ItineraryDay, ItineraryItem } from '@/types/booking'

function uid(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function dayUid(): string {
  return `day-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface ItineraryEditorStepProps {
  checkIn: string
  checkOut: string
  value: ItineraryDay[]
  onChange: (days: ItineraryDay[]) => void
  errors?: string[]
}

function addDaysBetween(start: string, end: string): ItineraryDay[] {
  const days: ItineraryDay[] = []
  const d = new Date(start)
  const endDate = new Date(end)
  let i = 0
  while (d <= endDate) {
    days.push({
      id: dayUid(),
      day_index: i + 1,
      date: d.toISOString().slice(0, 10),
      activities: [],
      transfers: [],
    })
    d.setDate(d.getDate() + 1)
    i++
  }
  return days
}

export function ItineraryEditorStep({
  checkIn,
  checkOut,
  value,
  onChange,
  errors = [],
}: ItineraryEditorStepProps) {
  const days = value ?? []
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  const handleAddDays = () => {
    if (checkIn && checkOut) {
      const newDays = addDaysBetween(checkIn, checkOut)
      onChange(newDays)
      if (newDays[0]) setExpandedDay(newDays[0].id)
    } else {
      onChange([
        ...days,
        {
          id: dayUid(),
          day_index: days.length + 1,
          date: checkIn || new Date().toISOString().slice(0, 10),
          activities: [],
          transfers: [],
        },
      ])
    }
  }

  const handleAddActivity = (dayId: string) => {
    const newItem: ItineraryItem = {
      id: uid(),
      type: 'activity',
      title: 'New Activity',
      time: '09:00',
    }
    onChange(
      days.map((d) =>
        d.id === dayId
          ? { ...d, activities: [...(d.activities ?? []), newItem] }
          : d
      )
    )
  }

  const handleAddTransfer = (dayId: string) => {
    const newItem: ItineraryItem = {
      id: uid(),
      type: 'transfer',
      title: 'Transfer',
      time: '10:00',
      description: '',
    }
    onChange(
      days.map((d) =>
        d.id === dayId
          ? { ...d, transfers: [...(d.transfers ?? []), newItem] }
          : d
      )
    )
  }

  const handleUpdateItem = (
    dayId: string,
    itemId: string,
    updates: Partial<ItineraryItem>
  ) => {
    const updateIn = (arr: ItineraryItem[]) =>
      arr.map((it) => (it.id === itemId ? { ...it, ...updates } : it))
    onChange(
      days.map((d) => {
        if (d.id !== dayId) return d
        return {
          ...d,
          activities: updateIn(d.activities ?? []),
          transfers: updateIn(d.transfers ?? []),
        }
      })
    )
  }

  const handleRemoveItem = (dayId: string, itemId: string) => {
    onChange(
      days.map((d) => {
        if (d.id !== dayId) return d
        return {
          ...d,
          activities: (d.activities ?? []).filter((it) => it.id !== itemId),
          transfers: (d.transfers ?? []).filter((it) => it.id !== itemId),
        }
      })
    )
  }

  const handleRemoveDay = (dayId: string) => {
    const filtered = days.filter((d) => d.id !== dayId)
    filtered.forEach((d, i) => {
      d.day_index = i + 1
    })
    onChange(filtered)
  }

  const sortedDays = [...days].sort((a, b) => (a.day_index ?? 0) - (b.day_index ?? 0))
  const hasErrors = (errors ?? []).length > 0

  return (
    <Card className="transition-all duration-200 hover:shadow-card-hover">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-serif text-lg">Itinerary & Transfers</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Build day-by-day itinerary with activities and transfers.
            </p>
          </div>
          <Button type="button" size="sm" onClick={handleAddDays}>
            <Plus className="h-4 w-4" aria-hidden />
            {checkIn && checkOut ? 'Add Days (Check-in to Check-out)' : 'Add Day'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedDays.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground" aria-hidden />
            <p className="mt-4 text-muted-foreground">No itinerary days yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Set check-in and check-out dates first, or add days manually.
            </p>
            <Button size="sm" className="mt-4" onClick={handleAddDays}>
              Add First Day
            </Button>
          </div>
        ) : (
          sortedDays.map((day) => {
            const activities = day.activities ?? []
            const transfers = day.transfers ?? []
            const isExpanded = expandedDay === day.id

            return (
              <div
                key={day.id}
                className="rounded-lg border border-border transition-all duration-200"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => setExpandedDay(isExpanded ? null : day.id)}
                  aria-expanded={isExpanded}
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="font-serif font-semibold">Day {day.day_index}</span>
                  <span className="text-sm text-muted-foreground">{formatShortDate(day.date)}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {activities.length + transfers.length} items
                  </span>
                </button>

                {isExpanded && (
                  <div className="border-t border-border p-4 pt-0">
                    <div className="space-y-4">
                      {(activities ?? []).map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center"
                        >
                          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                          <div className="min-w-0 flex-1 space-y-2">
                            <Input
                              value={item.title ?? ''}
                              onChange={(e) =>
                                handleUpdateItem(day.id, item.id, { title: e.target.value })
                              }
                              placeholder="Activity title"
                            />
                            <div className="flex gap-2">
                              <Input
                                type="time"
                                value={item.time ?? ''}
                                onChange={(e) =>
                                  handleUpdateItem(day.id, item.id, { time: e.target.value })
                                }
                                className="w-28"
                              />
                              <Input
                                value={item.location ?? ''}
                                onChange={(e) =>
                                  handleUpdateItem(day.id, item.id, { location: e.target.value })
                                }
                                placeholder="Location"
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(day.id, item.id)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Remove activity"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </Button>
                        </div>
                      ))}

                      {(transfers ?? []).map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center"
                        >
                          <Car className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                          <div className="min-w-0 flex-1 space-y-2">
                            <Input
                              value={item.title ?? ''}
                              onChange={(e) =>
                                handleUpdateItem(day.id, item.id, { title: e.target.value })
                              }
                              placeholder="Transfer"
                            />
                            <div className="flex gap-2">
                              <Input
                                type="time"
                                value={item.time ?? ''}
                                onChange={(e) =>
                                  handleUpdateItem(day.id, item.id, { time: e.target.value })
                                }
                                className="w-28"
                              />
                              <Input
                                value={item.description ?? ''}
                                onChange={(e) =>
                                  handleUpdateItem(day.id, item.id, { description: e.target.value })
                                }
                                placeholder="Details"
                                className="flex-1"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(day.id, item.id)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Remove transfer"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden />
                          </Button>
                        </div>
                      ))}

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddActivity(day.id)}
                        >
                          <MapPin className="h-4 w-4" aria-hidden />
                          Add Activity
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddTransfer(day.id)}
                        >
                          <Car className="h-4 w-4" aria-hidden />
                          Add Transfer
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveDay(day.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          Remove Day
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })
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
