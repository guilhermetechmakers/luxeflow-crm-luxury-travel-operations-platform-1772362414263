/**
 * SecurityPanel - Password change and 2FA setup
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getPasswordStrength } from '@/lib/validation'
import { cn } from '@/lib/utils'

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(12, 'Password must be at least 12 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((d) => getPasswordStrength(d.newPassword).valid, {
    message: 'Password does not meet strength requirements',
    path: ['newPassword'],
  })

type PasswordFormData = z.infer<typeof passwordSchema>

export interface SecurityPanelProps {
  profile?: { is2faEnabled?: boolean } | null
  is2faEnabled?: boolean
  onChangePassword: (current: string, newPassword: string) => void | Promise<void>
  onSetup2fa?: () => void | Promise<void | { qrCodeUrl?: string }>
  onDisable2fa?: () => void
  onVerify2fa?: (code: string) => void | Promise<void>
}

export function SecurityPanel({
  profile,
  is2faEnabled: is2faEnabledProp,
  onChangePassword,
  onSetup2fa,
  onDisable2fa,
  onVerify2fa,
}: SecurityPanelProps) {
  const is2faEnabled = is2faEnabledProp ?? profile?.is2faEnabled ?? false
  const [show2faSetup, setShow2faSetup] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const newPassword = watch('newPassword')
  const strength = getPasswordStrength(newPassword)

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    await onChangePassword(data.currentPassword, data.newPassword)
    reset()
  }

  const handleSetup2fa = async () => {
    if (onSetup2fa) {
      const res = await onSetup2fa()
      setQrCodeUrl(typeof res === 'object' && res?.qrCodeUrl ? res.qrCodeUrl : 'otpauth://totp/LuxeFlow?secret=JBSWY3DPEHPK3PXP')
      setShow2faSetup(true)
    }
  }

  const handleVerify2fa = async () => {
    if (onVerify2fa && twoFactorCode.trim()) {
      await onVerify2fa(twoFactorCode.trim())
      setShow2faSetup(false)
      setTwoFactorCode('')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Use a strong password with at least 12 characters, including uppercase, lowercase, numbers, and symbols.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handlePasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...register('currentPassword')}
                autoComplete="current-password"
                aria-invalid={!!errors.currentPassword}
                className={cn(errors.currentPassword && 'border-destructive')}
              />
              {errors.currentPassword && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register('newPassword')}
                autoComplete="new-password"
                aria-invalid={!!errors.newPassword}
                className={cn(errors.newPassword && 'border-destructive')}
              />
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full transition-all',
                      strength.score <= 2 && 'bg-destructive',
                      strength.score === 3 && 'bg-supporting',
                      strength.score >= 4 && 'bg-accent'
                    )}
                    style={{ width: `${(strength.score / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{strength.label}</span>
              </div>
              {strength.checks && (
                <ul className="mt-1 text-xs text-muted-foreground" aria-live="polite">
                  {strength.checks.map((c) => (
                    <li key={c.label} className={c.met ? 'text-accent' : ''}>
                      {c.met ? '✓' : '○'} {c.label}
                    </li>
                  ))}
                </ul>
              )}
              {errors.newPassword && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                className={cn(errors.confirmPassword && 'border-destructive')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Two-factor authentication</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add an extra layer of security by requiring a code from your authenticator app when signing in.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {is2faEnabled ? (
            <>
              <p className="text-sm text-accent">2FA is enabled on your account.</p>
              {onDisable2fa && (
                <Button variant="outline" onClick={onDisable2fa}>
                  Disable 2FA
                </Button>
              )}
            </>
          ) : show2faSetup ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.) and enter the 6-digit code below.
              </p>
              {qrCodeUrl && (
                <div className="flex justify-center rounded-lg border border-border bg-muted/30 p-4">
                  <div className="h-32 w-32 rounded bg-white p-2" aria-hidden>
                    {/* Placeholder for QR - in production use a QR library */}
                    <div className="flex h-full w-full items-center justify-center rounded border border-dashed border-muted-foreground/30 text-xs text-muted-foreground">
                      QR code
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="totpCode">Verification code</Label>
                <Input
                  id="totpCode"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  aria-label="6-digit verification code"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleVerify2fa} disabled={twoFactorCode.length !== 6}>
                  Verify and enable
                </Button>
                <Button variant="outline" onClick={() => setShow2faSetup(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            onSetup2fa && (
              <Button onClick={handleSetup2fa}>Enable 2FA</Button>
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}
