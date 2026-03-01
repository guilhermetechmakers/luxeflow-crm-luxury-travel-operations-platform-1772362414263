/**
 * PasswordResetRequestForm - Email input to request password reset link
 * LuxeFlow CRM - Runtime-safe, accessible, with inline validation
 */
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
})

export type PasswordResetRequestFormData = z.infer<typeof schema>

export interface PasswordResetRequestFormProps {
  onSubmit: (data: PasswordResetRequestFormData) => Promise<void>
  loading?: boolean
  success?: boolean
  error?: string | null
}

export function PasswordResetRequestForm({
  onSubmit,
  loading = false,
  success = false,
  error = null,
}: PasswordResetRequestFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequestFormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  if (success) {
    return null
  }

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
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          placeholder="you@agency.com"
          className="mt-1"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'reset-email-error' : undefined}
          disabled={loading}
          {...register('email')}
        />
        {errors.email && (
          <p id="reset-email-error" className="mt-1 text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>
    </form>
  )
}
