/**
 * SupportLink - Accessible contact/help link for password reset support
 * LuxeFlow CRM - mailto or support channel with focus styles
 */
import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SupportLinkProps {
  href?: string
  className?: string
}

const DEFAULT_SUPPORT_EMAIL = 'support@luxeflow.com'

export function SupportLink({
  href = `mailto:${DEFAULT_SUPPORT_EMAIL}?subject=Password%20Reset%20Help`,
  className,
}: SupportLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        'inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-accent hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded',
        className
      )}
      target="_blank"
      rel="noopener noreferrer"
    >
      <HelpCircle className="h-4 w-4" aria-hidden />
      <span>Didn&apos;t receive the email? Contact support</span>
    </a>
  )
}
