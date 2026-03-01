/**
 * ClientListPage - Master list of clients with search, filters, bulk actions, quick-select
 * Two-panel layout: left filter/search rail, right results panel
 */
import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useClients } from '@/hooks/use-clients'
import { useBulkSelection } from '@/hooks/use-bulk-selection'
import { useDebounce } from '@/hooks/use-debounce'
import { clientsApi } from '@/api/clients'
import {
  SearchSuggestionsDropdown,
  ClientsEmptyState,
  ClientsFiltersBar,
  ClientsBulkActionsBar,
  ClientsResultsPanel,
  NewClientDialog,
} from '@/components/clients'
import type { ClientFilters, SearchSuggestion } from '@/types/client'

const DEFAULT_PAGE_SIZE = 20

export function ClientsList() {
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState<ClientFilters>({
    sort: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  })
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const [newClientOpen, setNewClientOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const debouncedSearch = useDebounce(searchInput, 300)
  const debouncedSuggestions = useDebounce(searchInput, 200)

  const queryFilters = useMemo(
    () => ({
      ...filters,
      search: debouncedSearch.trim() || undefined,
    }),
    [filters, debouncedSearch]
  )

  const { clients, count, isLoading, refetch } = useClients(queryFilters)
  const {
    selectedIds,
    toggle,
    toggleAll,
    clear,
    isSelected,
    isAllSelected,
    isSomeSelected,
  } = useBulkSelection()

  const list = clients ?? []

  const hasActiveFilters = useMemo(
    () =>
      !!(
        filters.vip ||
        filters.family ||
        filters.frequentTraveler ||
        filters.country ||
        filters.lastActiveFrom ||
        filters.lastActiveTo
      ),
    [filters]
  )

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      vip: undefined,
      family: undefined,
      frequentTraveler: undefined,
      country: undefined,
      lastActiveFrom: undefined,
      lastActiveTo: undefined,
    }))
  }, [])

  useEffect(() => {
    if (!debouncedSuggestions.trim()) {
      setSuggestions([])
      setSuggestionsOpen(false)
      return
    }
    clientsApi.searchSuggestions(debouncedSuggestions).then((res) => {
      const arr = Array.isArray(res) ? res : []
      setSuggestions(arr)
      setSuggestionsOpen(arr.length > 0)
      setHighlightedIndex(0)
    })
  }, [debouncedSuggestions])

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!suggestionsOpen || suggestions.length === 0) return
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((i) => Math.min(i + 1, suggestions.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((i) => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          const sel = suggestions[highlightedIndex]
          if (sel?.href) {
            navigate(sel.href)
          }
          setSuggestionsOpen(false)
          break
        case 'Escape':
          setSuggestionsOpen(false)
          break
        default:
          break
      }
    },
    [suggestionsOpen, suggestions, highlightedIndex, navigate]
  )

  const handleBulkActionComplete = useCallback(() => {
    refetch()
    clear()
  }, [refetch, clear])

  const totalPages = Math.ceil((count ?? 0) / (filters.limit ?? DEFAULT_PAGE_SIZE)) || 1

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Clients</h1>
          <p className="mt-1 text-muted-foreground">
            Manage client records and view engagement
          </p>
        </div>
        <Button onClick={() => setNewClientOpen(true)} aria-label="Add new client">
          <Plus className="h-4 w-4" />
          New Client
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="sticky top-6 space-y-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                ref={searchInputRef}
                placeholder="Search name, email, phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onFocus={() => debouncedSuggestions && setSuggestionsOpen(suggestions.length > 0)}
                onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
                onKeyDown={handleSearchKeyDown}
                className="pl-9"
                aria-label="Search clients"
                aria-autocomplete="list"
                aria-controls="search-suggestions"
                aria-expanded={suggestionsOpen}
              />
              <div id="search-suggestions" className="relative">
                <SearchSuggestionsDropdown
                  suggestions={suggestions}
                  isOpen={suggestionsOpen}
                  onClose={() => setSuggestionsOpen(false)}
                  highlightedIndex={highlightedIndex}
                  onHighlight={setHighlightedIndex}
                />
              </div>
            </div>
            <ClientsFiltersBar
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <ClientsBulkActionsBar
            selectedIds={selectedIds}
            onClearSelection={clear}
            onExportComplete={handleBulkActionComplete}
          />

          {list.length === 0 && !isLoading ? (
            <ClientsEmptyState
              onAddClient={() => setNewClientOpen(true)}
              hasFilters={hasActiveFilters || !!debouncedSearch.trim()}
              onClearFilters={() => {
                clearFilters()
                setSearchInput('')
              }}
            />
          ) : (
            <ClientsResultsPanel
              clients={list}
              isLoading={isLoading}
              onToggleSelect={toggle}
              onToggleSelectAll={toggleAll}
              isAllSelected={isAllSelected}
              isSomeSelected={isSomeSelected}
              isSelected={isSelected}
            />
          )}

          {list.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">
                Showing {list.length} of {count} clients
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={(filters.page ?? 1) === 1}
                  onClick={() =>
                    setFilters((f) => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))
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
        </div>
      </div>

      <NewClientDialog
        open={newClientOpen}
        onOpenChange={setNewClientOpen}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}
