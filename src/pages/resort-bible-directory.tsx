/**
 * ResortBibleDirectory - Master resort directory for LuxeFlow CRM
 * Faceted search, filters, bulk actions, import/export, saved presets
 */
import { useState, useCallback, useMemo } from 'react'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { useDebounce } from '@/hooks/use-debounce'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useResorts } from '@/hooks/use-resorts'
import { useResortPresets } from '@/hooks/use-resort-presets'
import { useBulkSelection } from '@/hooks/use-bulk-selection'
import { resortBibleApi } from '@/api/resort-bible'
import { toast } from 'sonner'
import {
  FacetedSearchBar,
  FilterPanel,
  ResortCardGrid,
  BulkActionsBar,
  SavedPresetsPanel,
  ResortBibleEmptyState,
  NewResortFormModal,
  ExportPreviewDrawer,
  MigrateWizardModal,
  ImportExportPanel,
} from '@/components/resort-bible'
import type { ResortFilters, ResortCreateInput, MigrationMapItem } from '@/types/resort-bible'
import { ensureArray } from '@/lib/resort-bible-utils'

const DEFAULT_PAGE_SIZE = 24

export function ResortBibleDirectory() {
  const [filters, setFilters] = useState<ResortFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 300)
  const [page, setPage] = useState(1)
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [newResortOpen, setNewResortOpen] = useState(false)
  const [exportPreviewOpen, setExportPreviewOpen] = useState(false)
  const [migrateOpen, setMigrateOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const effectiveFilters = useMemo<ResortFilters>(
    () => ({ ...filters, search: debouncedSearch.trim() || undefined }),
    [filters, debouncedSearch]
  )

  const { resorts, total, isLoading, refetch } = useResorts(
    effectiveFilters,
    page,
    DEFAULT_PAGE_SIZE
  )
  const { presets, savePreset, deletePreset } = useResortPresets()
  const {
    selectedIds,
    toggle,
    toggleAll,
    clear,
    isSomeSelected,
  } = useBulkSelection()

  const list = ensureArray(resorts)
  const resortIds = useMemo(() => list.map((r) => r.id), [list])

  const hasActiveFilters = useMemo(
    () =>
      !!(
        (effectiveFilters.search ?? '').trim() ||
        effectiveFilters.kidsPolicy ||
        effectiveFilters.transferTimeMax != null ||
        effectiveFilters.beachPresence ||
        effectiveFilters.location ||
        effectiveFilters.region ||
        (effectiveFilters.roomTypes ?? []).length > 0 ||
        effectiveFilters.seasonality
      ),
    [effectiveFilters]
  )

  const handleApplyPreset = useCallback(
    (preset: { filters?: ResortFilters }) => {
      const f = preset.filters ?? {}
      setFilters(f)
      setSearchQuery((f.search as string) ?? '')
      refetch()
    },
    [refetch]
  )

  const handleClearFilters = useCallback(() => {
    setFilters({})
    setSearchQuery('')
    setPage(1)
  }, [])

  const handleExport = useCallback(async () => {
    const selected = selectedIds?.length ? selectedIds : resortIds
    if (selected.length === 0) {
      toast.error('No resorts to export')
      return
    }
    setExportPreviewOpen(true)
  }, [selectedIds, resortIds])

  const handleExportConfirm = useCallback(
    async (format: 'csv' | 'json') => {
      try {
        const toExport =
          selectedIds.length > 0 ? list.filter((r) => selectedIds.includes(r.id)) : undefined
        const { blob } = await resortBibleApi.exportResorts(
          format,
          toExport ? undefined : effectiveFilters,
          toExport
        )
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `resorts-export.${format === 'json' ? 'json' : 'csv'}`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Export downloaded')
        setExportPreviewOpen(false)
        clear()
      } catch {
        toast.error('Export failed')
      }
    },
    [effectiveFilters, selectedIds, list, clear]
  )

  const handleCreateResort = useCallback(
    async (input: ResortCreateInput) => {
      await resortBibleApi.createResort(input)
      refetch()
    },
    [refetch]
  )

  const handleImport = useCallback(
    async (file: File, mapping?: Record<string, string>) => {
      const res = await resortBibleApi.importResorts(file, mapping ?? {}, true)
      return { preview: res.preview, valid: res.valid }
    },
    []
  )

  const handleRunMigration = useCallback(
    async (mapping: MigrationMapItem[]) => {
      return resortBibleApi.migrateResorts(mapping)
    },
    []
  )

  const totalPages = Math.ceil(total / DEFAULT_PAGE_SIZE) || 1

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Resort Bible</h1>
          <p className="mt-1 text-muted-foreground">
            Centralized resort directory with faceted search and bulk actions
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SavedPresetsPanel
            presets={presets}
            onApply={handleApplyPreset}
            onSave={async (input) => { await savePreset(input) }}
            onDelete={async (id) => { await deletePreset(id) }}
            currentFilters={effectiveFilters}
          />
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            aria-pressed={viewMode === 'grid'}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('list')}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button onClick={() => setNewResortOpen(true)} aria-label="Add new resort">
            <Plus className="h-4 w-4" />
            New Resort
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <FacetedSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAdvancedClick={() => setFiltersPanelOpen((o) => !o)}
            showAdvanced={filtersPanelOpen}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="hidden lg:block">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            open={filtersPanelOpen}
          />
        </div>
        <Sheet open={filtersPanelOpen} onOpenChange={setFiltersPanelOpen}>
          <SheetContent side="left" className="w-80 sm:max-w-xs lg:hidden">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              onClose={() => setFiltersPanelOpen(false)}
              open
            />
          </SheetContent>
        </Sheet>

        <div className="flex-1 overflow-hidden">
          <BulkActionsBar
            selectedIds={selectedIds}
            onClearSelection={clear}
            onExport={handleExport}
            onImport={() => setImportOpen(true)}
            onSyncPartners={() => toast.info('Sync partners')}
            onRunMigration={() => setMigrateOpen(true)}
          />

          {list.length === 0 && !isLoading ? (
            <ResortBibleEmptyState
              hasFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
              onAddResort={() => setNewResortOpen(true)}
            />
          ) : (
            <>
              <ResortCardGrid
                resorts={list}
                isLoading={isLoading}
                selectedIds={selectedIds}
                onToggleSelect={toggle}
                onToggleSelectAll={toggleAll}
                showCheckboxes={selectedIds.length > 0 || isSomeSelected(resortIds)}
                viewMode={viewMode}
                onAddToShortlist={(id) => toast.info(`Added ${id} to shortlist`)}
                onCompare={(id) => toast.info(`Compare ${id}`)}
                onExport={(id) => toast.info(`Export ${id}`)}
              />
              {list.length > 0 && totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {list.length} of {total} resorts
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <NewResortFormModal
        open={newResortOpen}
        onOpenChange={setNewResortOpen}
        onSubmit={handleCreateResort}
        onSuccess={refetch}
      />

      <ExportPreviewDrawer
        open={exportPreviewOpen}
        onOpenChange={setExportPreviewOpen}
        data={selectedIds.length ? list.filter((r) => selectedIds.includes(r.id)) : list}
        onExport={handleExportConfirm}
      />

      <MigrateWizardModal
        open={migrateOpen}
        onOpenChange={setMigrateOpen}
        onRun={handleRunMigration}
      />

      <ImportExportPanel
        open={importOpen}
        onOpenChange={setImportOpen}
        onImport={handleImport}
      />
    </div>
  )
}
