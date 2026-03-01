/**
 * RatingStars - Display star rating (1-5)
 * LuxeFlow design: supporting/gold color for filled stars
 */
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface RatingStarsProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}

export function RatingStars({
  value,
  max = 5,
  size = 'md',
  className,
}: RatingStarsProps) {
  const stars = Array.from({ length: max }, (_, i) => i + 1)
  const sizeClass = sizeClasses[size]

  return (
    <div
      className={cn('flex gap-0.5', className)}
      role="img"
      aria-label={`Rating: ${value} out of ${max}`}
    >
      {stars.map((s) => (
        <Star
          key={s}
          className={cn(
            sizeClass,
            s <= value ? 'fill-supporting text-supporting' : 'text-muted'
          )}
          aria-hidden
        />
      ))}
    </div>
  )
}
