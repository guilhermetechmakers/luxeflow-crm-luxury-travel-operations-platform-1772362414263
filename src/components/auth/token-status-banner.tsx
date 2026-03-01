/**
 * TokenStatusBanner - Displays token validity, expiry warning, re-request guidance
 * LuxeFlow CRM - Accessible, actionable messaging
 */
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type TokenStatus = 'valid' | 'expired' | 'invalid' | 'missing'

export interface TokenStatusBannerProps {
  status: TokenStatus
  className?: string
}

export function TokenStatusBanner({ status, className }: TokenStatusBannerProps) {
  if (status === 'valid') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn(
          'flex gap-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-foreground',
          className
        )}
      >
        <CheckCircle className="h-5 w-5 shrink-0 text-accent" aria-hidden />
        <div>
          <p className="font-medium">Reset link is valid</p>
          <p className="mt-0.5 text-muted-foreground">
            Enter your new password below. This link will expire after use.
          </p>
        </div>
      </div>
    )
  }

  if (status === 'expired' || status === 'invalid' || status === 'missing') {
    return (
      <div
        role="alert"
        aria-live="assertive"
        className={cn(
          'flex gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive',
          className
        )}
      >
        <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
        <div>
          <p className="font-medium">
            {status === 'expired' ? 'Link expired' : status === 'invalid' ? 'Invalid link' : 'No reset link'}
          </p>
          <p className="mt-0.5">
            {status === 'expired'
              ? 'This password reset link has expired. Request a new one below.'
              : status === 'invalid'
                ? 'This password reset link is invalid or has already been used.'
                : 'Please request a new password reset link.'}
          </p>
          <Link
            to="/forgot-password"
            className="mt-2 inline-block font-medium underline underline-offset-2 hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          >
            Request new reset link
          </Link>
        </div>
      </div>
    )
  }

  return null
}
