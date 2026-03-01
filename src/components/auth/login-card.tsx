/**
 * LoginCard - Reusable login form block
 * Email/username, password with visibility toggle, Remember Me
 */
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const loginSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, 'Email or username is required')
    .refine(
      (val) => {
        if (val.includes('@')) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
        }
        return val.length >= 2
      },
      { message: 'Enter a valid email or username (min 2 characters)' }
    ),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>

export interface LoginCardProps {
  onSubmit: (data: LoginFormData) => Promise<void>
  loading?: boolean
  error?: string | null
  initialRemember?: boolean
}

export function LoginCard({
  onSubmit,
  loading = false,
  error = null,
  initialRemember = false,
}: LoginCardProps) {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrUsername: '',
      password: '',
      rememberMe: initialRemember,
    },
  })

  const rememberMe = watch('rememberMe')

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
        <Label htmlFor="emailOrUsername">Email or username</Label>
        <Input
          id="emailOrUsername"
          type="text"
          aria-invalid={!!errors.emailOrUsername}
          aria-describedby={errors.emailOrUsername ? 'emailOrUsername-error' : undefined}
          placeholder="you@agency.com"
          className="mt-1"
          autoComplete="username"
          {...register('emailOrUsername')}
        />
        {errors.emailOrUsername && (
          <p id="emailOrUsername-error" className="mt-1 text-sm text-destructive">
            {errors.emailOrUsername.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative mt-1">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            placeholder="••••••••"
            className="pr-10"
            autoComplete="current-password"
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
          <p id="password-error" className="mt-1 text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="rememberMe"
          checked={rememberMe}
          onCheckedChange={(checked) => setValue('rememberMe', !!checked)}
          aria-label="Remember me"
        />
        <Label
          htmlFor="rememberMe"
          className="cursor-pointer text-sm font-normal text-muted-foreground"
        >
          Remember me
        </Label>
      </div>

      <Button
        type="submit"
        className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}
