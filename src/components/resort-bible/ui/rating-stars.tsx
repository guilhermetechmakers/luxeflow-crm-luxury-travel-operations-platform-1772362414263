/**
 * RatingStars - Display rating as stars (1-5)
 */
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RatingStarsProps {
  rating: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function RatingStars({
  rating,
  max = 5,
  size = 'md',
  showValue = false,
  className,
}: RatingStarsProps) {
  const clamped = Math.min(max, Math.max(0, rating))
  const full = Math.floor(clamped)
  const hasHalf = clamped % 1 >= 0.5
  const empty = max - full - (hasHalf ? 1 : 0)

  return (
    <div className={cn('flex items-center gap-0.5', className)} role="img" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: full }).map((_, i) => (
        <Star
          key={`full-${i}`}
          className={cn(sizeClasses[size], 'fill-supporting text-supporting')}
        />
      ))}
      {hasHalf && (
        <div className="relative">
          <Star className={cn(sizeClasses[size], 'text-muted')} />
          <Star
            className={cn(sizeClasses[size], 'absolute left-0 top-0 fill-supporting text-supporting')}
            style={{ clipPath: 'inset(0 50% 0 0)' }}
          />
        </div>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`empty-${i}`} className={cn(sizeClasses[size], 'text-muted')} />
      ))}
      {showValue && (
        <span className="ml-1 text-sm text-muted-foreground">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
