/**
 * ResortRoomsTable - Sortable table of room types with images, occupancy, rates, 2-bedroom flag
 * Runtime safety: all arrays guarded with ensureArray
 */
import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ensureArray } from '@/lib/resort-bible-utils'
import type { RoomType } from '@/types/resort-bible'
import { cn } from '@/lib/utils'

export interface ResortRoomsTableProps {
  roomTypes?: RoomType[] | null
  onViewRoomDetail?: (room: RoomType) => void
  className?: string
}

type SortKey = 'name' | 'occupancy' | 'rate' | 'is2Bedroom'

function getOccupancyLabel(room: RoomType): string {
  const occ = room.occupancy
  if (occ) {
    const parts = [`${occ.adults} adult${occ.adults !== 1 ? 's' : ''}`]
    if (occ.kids != null && occ.kids > 0) {
      parts.push(`${occ.kids} kid${occ.kids !== 1 ? 's' : ''}`)
    }
    return parts.join(', ')
  }
  if (room.maxOccupancy != null) return `Up to ${room.maxOccupancy}`
  return '—'
}

export function ResortRoomsTable({
  roomTypes,
  onViewRoomDetail,
  className,
}: ResortRoomsTableProps) {
  const rooms = ensureArray(roomTypes)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const sortedRooms = useMemo(() => {
    const arr = [...rooms]
    arr.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case 'name':
          cmp = (a.name ?? '').localeCompare(b.name ?? '')
          break
        case 'occupancy': {
          const aVal = a.occupancy?.adults ?? a.maxOccupancy ?? 0
          const bVal = b.occupancy?.adults ?? b.maxOccupancy ?? 0
          cmp = aVal - bVal
          break
        }
        case 'rate':
          cmp = (a.rateSample ?? 0) - (b.rateSample ?? 0)
          break
        case 'is2Bedroom':
          cmp = (a.is2Bedroom ? 1 : 0) - (b.is2Bedroom ? 1 : 0)
          break
        default:
          break
      }
      return sortOrder === 'asc' ? cmp : -cmp
    })
    return arr
  }, [rooms, sortKey, sortOrder])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="ml-1 h-4 w-4 opacity-50" />
    return sortOrder === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4" />
    )
  }

  if (rooms.length === 0) {
    return (
      <Card className={cn(className)}>
        <CardHeader>
          <CardTitle>Room types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">No room types defined</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add room types to display occupancy, rates, and bed configurations
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Room types</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="hidden overflow-x-auto md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Photo</TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center font-medium hover:text-foreground"
                    onClick={() => handleSort('name')}
                    aria-label="Sort by name"
                  >
                    Room
                    <SortIcon column="name" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center font-medium hover:text-foreground"
                    onClick={() => handleSort('occupancy')}
                    aria-label="Sort by occupancy"
                  >
                    Occupancy
                    <SortIcon column="occupancy" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    type="button"
                    className="flex items-center font-medium hover:text-foreground"
                    onClick={() => handleSort('rate')}
                    aria-label="Sort by rate"
                  >
                    Sample rate
                    <SortIcon column="rate" />
                  </button>
                </TableHead>
                <TableHead className="text-center">2-Bedroom</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRooms.map((rt) => (
                <TableRow key={rt.id} className="transition-colors hover:bg-muted/50">
                  <TableCell>
                    <div className="h-14 w-20 overflow-hidden rounded-md bg-secondary">
                      {rt.image ? (
                        <img
                          src={rt.image}
                          alt={rt.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <span className="text-lg font-serif">{rt.name?.charAt(0) ?? '?'}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{rt.name}</p>
                      {rt.bedConfig && (
                        <p className="text-xs text-muted-foreground">{rt.bedConfig}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getOccupancyLabel(rt)}</TableCell>
                  <TableCell>
                    {rt.rateSample != null
                      ? new Intl.NumberFormat(undefined, {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                        }).format(rt.rateSample)
                      : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {rt.is2Bedroom ? (
                      <span className="rounded bg-accent/20 px-2 py-0.5 text-xs text-accent">
                        Yes
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {onViewRoomDetail && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewRoomDetail(rt)}
                        aria-label={`View ${rt.name} details`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 grid gap-4 md:mt-0 md:hidden">
          {sortedRooms.map((rt) => (
            <div
              key={rt.id}
              className="rounded-lg border border-border p-4 transition-shadow hover:shadow-card"
            >
              <div className="flex gap-4">
                <div className="h-20 w-24 shrink-0 overflow-hidden rounded-md bg-secondary">
                  {rt.image ? (
                    <img src={rt.image} alt={rt.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <span className="text-xl font-serif">{rt.name?.charAt(0) ?? '?'}</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium">{rt.name}</h4>
                  {rt.bedConfig && (
                    <p className="text-sm text-muted-foreground">{rt.bedConfig}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getOccupancyLabel(rt)}
                    {rt.rateSample != null &&
                      ` · ${new Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 0,
                      }).format(rt.rateSample)}`}
                  </p>
                  {rt.is2Bedroom && (
                    <span className="mt-2 inline-block rounded bg-accent/20 px-2 py-0.5 text-xs text-accent">
                      2-Bedroom
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
