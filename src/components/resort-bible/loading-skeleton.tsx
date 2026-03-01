/**
 * LoadingSkeleton - Resort card skeleton for loading states
 * LuxeFlow design: shimmer effect, matches card layout
 */
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface LoadingSkeletonProps {
  count?: number
  variant?: 'card' | 'list' | 'detail'
  className?: string
}

export function ResortLoadingSkeleton({
  count = 8,
  variant = 'card',
  className,
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i)

  if (variant === 'detail') {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    )
  }

  const CardSkeleton = () => (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Skeleton className="h-40 w-full animate-pulse" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-5 w-20 rounded" />
        </div>
      </div>
    </div>
  )

  return (
    <div
      className={cn(
        variant === 'list'
          ? 'flex flex-col gap-4'
          : 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className
      )}
    >
      {items.map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}
