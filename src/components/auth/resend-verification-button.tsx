/**
 * ResendVerificationButton - Triggers resend with cooldown and loading state
 * LuxeFlow CRM - 60s cooldown, accessible, error/success feedback
 */
import { useState, useCallback, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const COOLDOWN_SECONDS = 60

export interface ResendVerificationButtonProps {
  onResend: () => Promise<{ success: boolean; message?: string; nextRetrySeconds?: number }>
  email: string
  disabled?: boolean
  className?: string
}

export function ResendVerificationButton({
  onResend,
  email,
  disabled = false,
  className,
}: ResendVerificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)

  const startCooldown = useCallback((seconds: number = COOLDOWN_SECONDS) => {
    setCooldownRemaining(seconds)
  }, [])

  useEffect(() => {
    if (cooldownRemaining <= 0) return
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        const next = prev - 1
        if (next <= 0) clearInterval(timer)
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldownRemaining])

  const handleClick = useCallback(async () => {
    if (isLoading || cooldownRemaining > 0 || disabled) return
    if (!email || !email.includes('@')) {
      toast.error('Valid email is required to resend')
      return
    }
    setIsLoading(true)
    try {
      const result = await onResend()
      const { success = false, message, nextRetrySeconds } = result ?? {}
      if (success) {
        toast.success(message ?? 'Verification email sent')
        startCooldown(nextRetrySeconds ?? COOLDOWN_SECONDS)
      } else {
        toast.error(message ?? 'Failed to resend verification email')
        if (nextRetrySeconds != null && nextRetrySeconds > 0) {
          startCooldown(nextRetrySeconds)
        }
      }
    } catch {
      toast.error('Failed to resend verification email')
    } finally {
      setIsLoading(false)
    }
  }, [onResend, email, isLoading, cooldownRemaining, disabled, startCooldown])

  const isDisabled = disabled || isLoading || cooldownRemaining > 0

  const buttonLabel =
    isLoading
      ? 'Sending...'
      : cooldownRemaining > 0
        ? `Resend in ${cooldownRemaining}s`
        : 'Resend verification email'

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleClick}
      disabled={isDisabled}
      className={className}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
      ) : null}
      {buttonLabel}
    </Button>
  )
}
