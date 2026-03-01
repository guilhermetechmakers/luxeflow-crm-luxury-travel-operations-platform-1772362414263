/**
 * DataGridExportPreview - Reusable export preview with field mapping visibility
 * Displays tabular data before bulk export with configurable columns
 */
import { ensureArray } from '@/lib/resort-bible-utils'
import { cn } from '@/lib/utils'

export interface ExportColumn<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  accessor?: (item: T) => string | number | null | undefined
}

export interface DataGridExportPreviewProps<T extends { id: string }> {
  data: T[]
  columns: ExportColumn<T>[]
  maxRows?: number
  emptyMessage?: string
  className?: string
}

export function DataGridExportPreview<T extends { id: string }>({
  data,
  columns,
  maxRows = 50,
  emptyMessage = 'No data to export',
  className,
}: DataGridExportPreviewProps<T>) {
  const list = ensureArray(data)
  const displayRows = list.slice(0, maxRows)
  const hasMore = list.length > maxRows

  if (list.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 py-8 text-sm text-muted-foreground',
          className
        )}
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border', className)}>
      <div className="max-h-96 overflow-y-auto">
        <table className="w-full text-sm" role="grid" aria-label="Export preview">
          <thead className="sticky top-0 z-10 bg-secondary">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="border-b border-border px-4 py-2 text-left font-medium text-foreground"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((item) => (
              <tr
                key={item.id}
                className="border-b border-border last:border-0 transition-colors hover:bg-muted/50"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2 text-foreground">
                    {col.render
                      ? col.render(item)
                      : col.accessor
                        ? String(col.accessor(item) ?? '')
                        : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hasMore && (
        <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
          ... and {list.length - maxRows} more
        </p>
      )}
    </div>
  )
}
