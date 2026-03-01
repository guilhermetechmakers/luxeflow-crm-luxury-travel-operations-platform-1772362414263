/**
 * VerificationStatusIndicator - Pill/badge showing verification status
 * LuxeFlow CRM - Olive green accent for positive state, icons for clarity
 */
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type VerificationStatus = 'pending' | 'verified' | 'failed'

export interface VerificationStatusIndicatorProps {
  status: VerificationStatus
  className?: string
}

const statusConfig: Record<
  VerificationStatus,
  { label: string; icon: React.ReactNode; className: string }
> = {
  pending: {
    label: 'Pending Verification',
    icon: <Clock className="h-4 w-4" aria-hidden />,
    className:
      'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:border-amber-800',
  },
  verified: {
    label: 'Verified',
    icon: <CheckCircle2 className="h-4 w-4" aria-hidden />,
    className:
      'bg-accent/15 text-accent border-accent/40 dark:bg-accent/20 dark:text-accent dark:border-accent/50',
  },
  failed: {
    label: 'Verification Failed',
    icon: <AlertCircle className="h-4 w-4" aria-hidden />,
    className:
      'bg-destructive/10 text-destructive border-destructive/30 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/50',
  },
}

export function VerificationStatusIndicator({
  status,
  className,
}: VerificationStatusIndicatorProps) {
  const config = statusConfig[status] ?? statusConfig.pending
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={`Email verification status: ${config.label}`}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium transition-colors duration-200',
        config.className,
        className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  )
}
