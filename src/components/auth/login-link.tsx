/**
 * LoginLink - Routes to /login with optional text override
 * LuxeFlow CRM - Consistent with auth pages
 */
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LoginLinkProps {
  text?: string
  className?: string
}

export function LoginLink({ text = 'Back to sign in', className }: LoginLinkProps) {
  return (
    <Link
      to="/login"
      className={cn(
        'inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded',
        className
      )}
    >
      {text}
      <ArrowRight className="h-4 w-4" aria-hidden />
    </Link>
  )
}
