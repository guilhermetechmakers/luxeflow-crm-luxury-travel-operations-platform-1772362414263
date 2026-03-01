/**
 * SecurityNotice - 2FA readiness and security guidance
 */
import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SecurityNoticeProps {
  className?: string
  dismissible?: boolean
}

export function SecurityNotice({ className }: SecurityNoticeProps) {
  return (
    <div
      role="region"
      aria-label="Security notice"
      className={cn(
        'flex gap-3 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground',
        className
      )}
    >
      <Shield className="h-5 w-5 shrink-0 text-accent" aria-hidden />
      <div>
        <p className="font-medium text-foreground">Security tips</p>
        <p className="mt-0.5">
          Two-factor authentication (2FA) is available in your account settings. Never share your
          password or verification codes. LuxeFlow will never ask for sensitive data via email.
        </p>
      </div>
    </div>
  )
}
