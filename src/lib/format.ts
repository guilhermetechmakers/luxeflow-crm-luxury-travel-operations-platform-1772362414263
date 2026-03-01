/**
 * Safe formatting utilities for dashboard data
 * Handles null/undefined and invalid values per runtime safety rules
 */

export function formatCurrency(amount: number | null | undefined, currency = 'EUR'): string {
  if (amount == null || typeof amount !== 'number' || Number.isNaN(amount)) return '—'
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency }).format(amount)
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr || typeof dateStr !== 'string') return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-EU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatShortDate(dateStr: string | null | undefined): string {
  if (!dateStr || typeof dateStr !== 'string') return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-EU', { day: 'numeric', month: 'short' })
}

export function getPriorityColor(priority: string): string {
  switch (priority?.toLowerCase()) {
    case 'urgent':
    case 'critical':
      return 'bg-destructive/15 text-destructive border-destructive/30'
    case 'high':
      return 'bg-amber-500/15 text-amber-700 border-amber-500/30'
    case 'medium':
      return 'bg-blue-500/15 text-blue-700 border-blue-500/30'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}
