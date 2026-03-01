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

/** Format time for chat (HH:mm) */
export function formatTime(iso: string | null | undefined): string {
  if (!iso || typeof iso !== 'string') return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
}

/** Relative time for chat (e.g. "2m ago", "Yesterday") */
export function formatTimeAgo(iso: string | null | undefined): string {
  if (!iso || typeof iso !== 'string') return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
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
