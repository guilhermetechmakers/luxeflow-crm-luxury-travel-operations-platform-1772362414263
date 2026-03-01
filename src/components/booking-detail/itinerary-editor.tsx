/**
 * ItineraryEditor - Per-day itinerary builder with activities and transfers
 * LuxeFlow design: cards with subtle shadows, olive accents
 */
import { useState, useEffect } from 'react'
import { MapPin, Car, Plus, GripVertical } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { ItineraryDay, ItineraryItem } from '@/types/booking'

export interface ItineraryEditorProps {
  days: ItineraryDay[]
  isLoading?: boolean
  onAddDay?: () => void
  onUpdateDay?: (dayId: string, updates: Partial<ItineraryDay>) => void
  onRemoveDay?: (dayId: string) => void
  onAddActivity?: (dayId: string) => void
  onAddTransfer?: (dayId: string) => void
  onUpdateItem?: (dayId: string, itemId: string, updates: Partial<ItineraryItem>) => void
  onRemoveItem?: (dayId: string, itemId: string) => void
  canEdit?: boolean
}

function ItemRow({
  item,
  type,
  onRemove,
  canEdit,
}: {
  item: ItineraryItem
  type: 'activity' | 'transfer'
  onUpdate?: (updates: Partial<ItineraryItem>) => void
  onRemove?: () => void
  canEdit?: boolean
}) {
  const Icon = type === 'activity' ? MapPin : Car
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border border-border p-3 transition-all duration-200',
        'hover:border-accent/30'
      )}
    >
      <div className="mt-0.5 shrink-0 rounded bg-secondary p-1.5">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{item.title ?? 'Untitled'}</p>
        {item.time && (
          <p className="text-xs text-muted-foreground">{item.time}</p>
        )}
        {item.location && (
          <p className="text-xs text-muted-foreground">{item.location}</p>
        )}
        {item.description && (
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
        )}
      </div>
      {canEdit && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label="Remove item"
        >
          Remove
        </Button>
      )}
    </div>
  )
}

export function ItineraryEditor({
  days = [],
  isLoading = false,
  onAddDay,
  onAddActivity,
  onAddTransfer,
  onRemoveItem,
  canEdit = false,
}: ItineraryEditorProps) {
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  useEffect(() => {
    const first = (days ?? [])[0]
    if (first?.id && !expandedDay) {
      setExpandedDay(first.id)
    }
  }, [days, expandedDay])

  const sortedDays = [...(days ?? [])].sort(
    (a, b) => (a.day_index ?? 0) - (b.day_index ?? 0)
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Itinerary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-secondary/50"
                aria-hidden
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Itinerary</CardTitle>
          {canEdit && onAddDay && (
            <Button size="sm" onClick={onAddDay}>
              <Plus className="h-4 w-4" aria-hidden />
              Add Day
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedDays.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground" aria-hidden />
            <p className="mt-4 text-muted-foreground">No itinerary days yet</p>
            {canEdit && onAddDay && (
              <Button size="sm" className="mt-4" onClick={onAddDay}>
                Add First Day
              </Button>
            )}
          </div>
        ) : (
          (sortedDays ?? []).map((day) => {
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
                  onClick={() =>
                    setExpandedDay(isExpanded ? null : day.id)
                  }
                  aria-expanded={isExpanded}
                  aria-controls={`day-${day.id}-content`}
                >
                  <GripVertical
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="font-serif text-lg font-semibold">
                    Day {day.day_index}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatShortDate(day.date)}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {activities.length + transfers.length} items
                  </span>
                </button>

                {isExpanded && (
                  <div
                    id={`day-${day.id}-content`}
                    className="border-t border-border p-4 pt-0"
                  >
                    <div className="space-y-4">
                      {activities.length > 0 && (
                        <div>
                          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Activities
                          </h4>
                          <div className="space-y-2">
                            {(activities ?? []).map((item) => (
                              <ItemRow
                                key={item.id}
                                item={item}
                                type="activity"
                                onRemove={
                                  canEdit && onRemoveItem
                                    ? () => onRemoveItem(day.id, item.id)
                                    : undefined
                                }
                                canEdit={canEdit}
                              />
                            ))}
                          </div>
                          {canEdit && onAddActivity && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => onAddActivity(day.id)}
                            >
                              <Plus className="h-4 w-4" aria-hidden />
                              Add Activity
                            </Button>
                          )}
                        </div>
                      )}

                      {transfers.length > 0 && (
                        <div>
                          <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Transfers
                          </h4>
                          <div className="space-y-2">
                            {(transfers ?? []).map((item) => (
                              <ItemRow
                                key={item.id}
                                item={item}
                                type="transfer"
                                onRemove={
                                  canEdit && onRemoveItem
                                    ? () => onRemoveItem(day.id, item.id)
                                    : undefined
                                }
                                canEdit={canEdit}
                              />
                            ))}
                          </div>
                          {canEdit && onAddTransfer && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => onAddTransfer(day.id)}
                            >
                              <Plus className="h-4 w-4" aria-hidden />
                              Add Transfer
                            </Button>
                          )}
                        </div>
                      )}

                      {activities.length === 0 && transfers.length === 0 && (
                        <div className="flex gap-2">
                          {canEdit && onAddActivity && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onAddActivity(day.id)}
                            >
                              <MapPin className="h-4 w-4" aria-hidden />
                              Add Activity
                            </Button>
                          )}
                          {canEdit && onAddTransfer && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onAddTransfer(day.id)}
                            >
                              <Car className="h-4 w-4" aria-hidden />
                              Add Transfer
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
