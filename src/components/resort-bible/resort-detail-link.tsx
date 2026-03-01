/**
 * ResortDetailLink - Router link to Resort Detail page
 * Reusable link component for resort cards and lists
 */
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export interface ResortDetailLinkProps {
  resortId: string
  children: React.ReactNode
  className?: string
  ariaLabel?: string
}

export function ResortDetailLink({
  resortId,
  children,
  className,
  ariaLabel,
}: ResortDetailLinkProps) {
  return (
    <Link
      to={`/dashboard/resorts/${resortId}`}
      className={cn('focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md', className)}
      aria-label={ariaLabel ?? `View resort details`}
    >
      {children}
    </Link>
  )
}
