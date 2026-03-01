/**
 * DebouncedSearchInput - Search with debounced onChange
 * LuxeFlow design: clean input, focus states
 */
import { useEffect, useState, useCallback } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface DebouncedSearchInputProps {
  value: string
  onChange: (value: string) => void
  debounceMs?: number
  placeholder?: string
  className?: string
  'aria-label'?: string
}

export function DebouncedSearchInput({
  value,
  onChange,
  debounceMs = 300,
  placeholder = 'Search...',
  className,
  'aria-label': ariaLabel = 'Search',
}: DebouncedSearchInputProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [localValue, debounceMs, onChange, value])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
  }, [])

  return (
    <div className={cn('relative flex-1', className)}>
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <Input
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9"
        aria-label={ariaLabel}
      />
    </div>
  )
}
