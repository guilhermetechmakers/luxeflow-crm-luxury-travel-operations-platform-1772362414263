/**
 * DebouncedSearchInput - Search input with debounced onChange
 */
import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DebouncedSearchInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'onChange'> {
  value?: string
  onChange: (value: string) => void
  debounceMs?: number
  showSearchIcon?: boolean
}

export function DebouncedSearchInput({
  value = '',
  onChange,
  debounceMs = 300,
  showSearchIcon = true,
  className,
  ...props
}: DebouncedSearchInputProps) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => onChange(localValue), debounceMs)
    return () => clearTimeout(timer)
  }, [localValue, debounceMs, onChange])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
  }, [])

  return (
    <div className={cn('relative', className)}>
      {showSearchIcon && (
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      )}
      <Input
        {...props}
        value={localValue}
        onChange={handleChange}
        className={cn(showSearchIcon && 'pl-9')}
        aria-label={props['aria-label'] ?? 'Search'}
      />
    </div>
  )
}
