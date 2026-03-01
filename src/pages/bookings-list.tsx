/**
 * BookingsListPage - Centralized, filterable, exportable index of all bookings
 * List view and pipeline (board) view; bulk export; quick actions
 */
import { useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useBookings } from '@/hooks/use-bookings'
import { useBulkSelection } from '@/hooks/use-bulk-selection'
import { bookingsApi } from '@/api/bookings'
import { toast } from 'sonner'
import {
  BookingsFiltersBar,
  BookingTable,
  BookingPipeline,
  BulkExportPanel,
  BookingsEmptyState,
} from '@/components/bookings'
import type { BookingFilters } from '@/types/booking'

const DEFAULT_PAGE_SIZE = 50

const DEFAULT_FILTERS: BookingFilters = {
  sort: 'last_updated',
  sortOrder: 'desc',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
}

export function BookingsList() {
  const [filters, setFilters] = useState<BookingFilters>(DEFAULT_FILTERS)
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list')

  const { bookings, count, isLoading, refetch } = useBookings(filters)
  const {
    selectedIds,
    toggle,
    toggleAll,
    clear,
    isSelected,
    isAllSelected,
    isSomeSelected,
  } = useBulkSelection()

  const list = bookings ?? []

  const hasActiveFilters = useMemo(
    () =>
      !!(
        filters.status ||
        filters.agent_id ||
        filters.resort_id ||
        filters.check_in_from ||
        filters.check_in_to ||
        (filters.balance_min != null && filters.balance_min > 0) ||
        filters.search
      ),
    [filters]
  )

  const handleApply = useCallback(() => {
    refetch()
  }, [refetch])

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
  }, [])

  const handleExportComplete = useCallback(() => {
    refetch()
    clear()
  }, [refetch, clear])

  const handleSendReminder = useCallback(
    async (id: string) => {
      try {
        await bookingsApi.sendReminder(id)
        toast.success('Reminder sent')
        refetch()
      } catch {
        toast.error('Failed to send reminder')
      }
    },
    [refetch]
  )

  const handleCreateInvoice = useCallback(
    async (id: string) => {
      try {
        await bookingsApi.createInvoice(id)
        toast.success('Invoice created')
        refetch()
      } catch {
        toast.error('Failed to create invoice')
      }
    },
    [refetch]
  )

  const handleExport = useCallback(() => {
    toast.info('Export single booking')
  }, [])

  const totalPages =
    Math.ceil((count ?? 0) / (filters.pageSize ?? DEFAULT_PAGE_SIZE)) || 1

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Bookings</h1>
          <p className="mt-1 text-muted-foreground">
            Pipeline and booking management
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'pipeline' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('pipeline')}
            aria-label="Pipeline view"
            aria-pressed={viewMode === 'pipeline'}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link to="/dashboard/bookings/new">
              <Plus className="h-4 w-4" />
              New Booking
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 shadow-card">
        <BookingsFiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          onApply={handleApply}
          onReset={handleReset}
          hasActiveFilters={hasActiveFilters}
        />
      </div>

      <BulkExportPanel
        selectedIds={selectedIds}
        onClearSelection={clear}
        onExportComplete={handleExportComplete}
      />

      {list.length === 0 && !isLoading ? (
        <BookingsEmptyState
          hasFilters={hasActiveFilters}
          onClearFilters={handleReset}
        />
      ) : viewMode === 'list' ? (
        <>
          <BookingTable
            bookings={list}
            isLoading={isLoading}
            onToggleSelect={toggle}
            onToggleSelectAll={toggleAll}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
            isSelected={isSelected}
            onSendReminder={handleSendReminder}
            onCreateInvoice={handleCreateInvoice}
            onExport={handleExport}
          />
          {list.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {list.length} of {count} bookings
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(filters.page ?? 1) === 1}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      page: Math.max(1, (f.page ?? 1) - 1),
                    }))
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(filters.page ?? 1) >= totalPages}
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <BookingPipeline bookings={list} isLoading={isLoading} />
      )}
    </div>
  )
}
