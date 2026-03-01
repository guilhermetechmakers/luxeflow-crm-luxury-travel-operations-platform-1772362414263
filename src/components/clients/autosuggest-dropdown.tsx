/**
 * AutosuggestDropdown - suggestions for global search with keyboard navigation
 */
import { useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { SearchSuggestion } from '@/types/client'

export interface AutosuggestDropdownProps {
  suggestions: SearchSuggestion[]
  isOpen: boolean
  onClose: () => void
  highlightedIndex: number
  onHighlight: (index: number) => void
  className?: string
}

export function AutosuggestDropdown({
  suggestions,
  isOpen,
  onClose,
  highlightedIndex,
  onHighlight,
  className,
}: AutosuggestDropdownProps) {
  const navigate = useNavigate()
  const listRef = useRef<HTMLUListElement>(null)

  const handleSelect = useCallback(
    (suggestion: SearchSuggestion) => {
      if (suggestion.href) {
        navigate(suggestion.href)
      }
      onClose()
    },
    [navigate, onClose]
  )

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return
    const el = listRef.current?.children[highlightedIndex] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [isOpen, highlightedIndex])

  if (!isOpen || (suggestions ?? []).length === 0) return null

  const list = suggestions ?? []

  return (
    <ul
      ref={listRef}
      role="listbox"
      aria-label="Search suggestions"
      className={cn(
        'absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-auto rounded-lg border border-border bg-card py-1 shadow-card animate-fade-in',
        className
      )}
    >
      {list.map((suggestion, index) => (
        <li
          key={`${suggestion.type}-${suggestion.id}`}
          role="option"
          aria-selected={index === highlightedIndex}
          tabIndex={-1}
          className={cn(
            'flex cursor-pointer flex-col gap-0.5 px-4 py-2.5 transition-colors',
            index === highlightedIndex
              ? 'bg-accent/15 text-accent'
              : 'hover:bg-secondary'
          )}
          onMouseEnter={() => onHighlight(index)}
          onMouseDown={(e) => {
            e.preventDefault()
            handleSelect(suggestion)
          }}
        >
          <span className="font-medium">{suggestion.label}</span>
          {suggestion.sublabel && (
            <span className="text-xs text-muted-foreground">{suggestion.sublabel}</span>
          )}
        </li>
      ))}
    </ul>
  )
}
