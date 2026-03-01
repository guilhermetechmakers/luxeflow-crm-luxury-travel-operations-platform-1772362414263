/**
 * ResortRoomPanel - Resort, room category, bed config, transfer times
 * LuxeFlow design: white cards, olive accents, subtle shadows
 */
import { Link } from 'react-router-dom'
import { Building2, Bed, Clock, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BookingDetail } from '@/types/booking'

export interface ResortRoomPanelProps {
  detail: BookingDetail | null
  isLoading?: boolean
  canEdit?: boolean
}

export function ResortRoomPanel({
  detail,
  isLoading = false,
  canEdit = false,
}: ResortRoomPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resort & Room</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-16 animate-pulse rounded-lg bg-secondary/50" />
            <div className="h-12 animate-pulse rounded-lg bg-secondary/50" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!detail) return null

  const resort = detail.resort
  const roomCategory = detail.room_category

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Resort & Room</CardTitle>
          {canEdit && resort?.id && (
            <Button variant="outline" size="sm" asChild>
              <Link to={`/dashboard/resorts/${resort.id}`}>
                View Resort
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {resort ? (
          <div
            className={cn(
              'rounded-lg border border-border p-4 transition-all duration-200',
              'hover:border-accent/30'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-lg bg-secondary p-2">
                <Building2
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg font-semibold">
                  {resort.name ?? 'Unknown Resort'}
                </p>
                {resort.location && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {resort.location}
                  </p>
                )}
                {(resort.transfer_time ?? resort.transfer_time_minutes != null) && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" aria-hidden />
                    Transfer:{' '}
                    {resort.transfer_time ??
                      (resort.transfer_time_minutes != null
                        ? `${resort.transfer_time_minutes} min`
                        : '')}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No resort selected</p>
        )}

        {roomCategory ? (
          <div
            className={cn(
              'rounded-lg border border-border p-4 transition-all duration-200',
              'hover:border-accent/30'
            )}
          >
            <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Room Category
            </h4>
            <div className="space-y-2">
              <p className="font-medium">{roomCategory.name ?? 'Unknown'}</p>
              {roomCategory.bed_config && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Bed className="h-4 w-4" aria-hidden />
                  {roomCategory.bed_config}
                </div>
              )}
              {roomCategory.capacity != null && roomCategory.capacity > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" aria-hidden />
                  Up to {roomCategory.capacity} guests
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No room category</p>
        )}
      </CardContent>
    </Card>
  )
}
