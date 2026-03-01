/**
 * PasswordResetForm - Token-based password reset with strength meter
 * LuxeFlow CRM - Real-time validation, confirm password, accessibility
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordStrengthMeter } from './password-strength-meter'
import { getPasswordStrength } from '@/lib/validation'

const MIN_LENGTH = 12
const resetSchema = z
  .object({
    password: z
      .string()
      .min(MIN_LENGTH, `Password must be at least ${MIN_LENGTH} characters`)
      .refine((val) => getPasswordStrength(val).valid, {
        message: 'Password must include uppercase, lowercase, number, and special character',
      }),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type PasswordResetFormData = z.infer<typeof resetSchema>

export interface PasswordResetFormProps {
  onSubmit: (data: PasswordResetFormData) => Promise<void>
  loading?: boolean
  error?: string | null
}

export function PasswordResetForm({
  onSubmit,
  loading = false,
  error = null,
}: PasswordResetFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const password = watch('password', '')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="new-password">New password</Label>
        <div className="relative mt-1">
          <Input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="pr-10"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'new-password-error' : 'password-strength'}
            disabled={loading}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
        {errors.password && (
          <p id="new-password-error" className="mt-1 text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
        <div id="password-strength" className="mt-2">
          <PasswordStrengthMeter password={password} />
        </div>
      </div>

      <div>
        <Label htmlFor="confirm-password">Confirm password</Label>
        <div className="relative mt-1">
          <Input
            id="confirm-password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            className="pr-10"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
            disabled={loading}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" aria-hidden />
            ) : (
              <Eye className="h-4 w-4" aria-hidden />
            )}
          </button>
        </div>
        {errors.confirmPassword && (
          <p id="confirm-password-error" className="mt-1 text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        disabled={loading}
      >
        {loading ? 'Updating...' : 'Update Password'}
      </Button>
    </form>
  )
}
