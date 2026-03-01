/**
 * SearchSuggestionsDropdown - dropdown-only list for autosuggest
 * Used when the search input is rendered separately by the parent
 */
import { Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { SearchSuggestion } from '@/types/client'

export interface SearchSuggestionsDropdownProps {
  suggestions: SearchSuggestion[]
  isOpen: boolean
  onClose: () => void
  highlightedIndex: number
  onHighlight: (index: number) => void
}

export function SearchSuggestionsDropdown({
  suggestions,
  isOpen,
  onClose,
  highlightedIndex,
  onHighlight,
}: SearchSuggestionsDropdownProps) {
  const navigate = useNavigate()
  const list = suggestions ?? []

  if (!isOpen) return null

  return (
    <ul
      id="search-suggestions"
      role="listbox"
      className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-auto rounded-lg border border-border bg-card py-1 shadow-card animate-fade-in"
    >
      {list.length === 0 ? (
        <li className="px-4 py-3 text-sm text-muted-foreground">
          No results found
        </li>
      ) : (
        list.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              role="option"
              aria-selected={i === highlightedIndex}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors',
                i === highlightedIndex
                  ? 'bg-accent/15 text-accent'
                  : 'hover:bg-secondary'
              )}
              onMouseEnter={() => onHighlight(i)}
              onClick={() => {
                if (s.href) {
                  navigate(s.href)
                }
                onClose()
              }}
            >
              <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate">{s.label}</div>
                {s.sublabel && (
                  <div className="text-xs text-muted-foreground truncate">
                    {s.sublabel}
                  </div>
                )}
              </div>
            </button>
          </li>
        ))
      )}
    </ul>
  )
}
