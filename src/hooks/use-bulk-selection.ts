/**
 * useBulkSelection - manages selected client IDs for bulk actions
 * Runtime-safe array handling
 */
import { useState, useCallback } from 'react'

export function useBulkSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback((ids: string[], checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(ids ?? []))
    } else {
      setSelectedIds(new Set())
    }
  }, [])

  const clear = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  )

  const isAllSelected = useCallback(
    (ids: string[]) => {
      const arr = ids ?? []
      if (arr.length === 0) return false
      return arr.every((id) => selectedIds.has(id))
    },
    [selectedIds]
  )

  const isSomeSelected = useCallback(
    (ids: string[]) => {
      const arr = ids ?? []
      return arr.some((id) => selectedIds.has(id))
    },
    [selectedIds]
  )

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    toggle,
    toggleAll,
    clear,
    isSelected,
    isAllSelected,
    isSomeSelected,
  }
}
