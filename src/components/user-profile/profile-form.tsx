/**
 * ProfileForm - Name, email, phone, locale, time zone with validation
 */
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/types/user-profile'

const LOCALES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
]

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern (US)' },
  { value: 'America/Chicago', label: 'Central (US)' },
  { value: 'America/Denver', label: 'Mountain (US)' },
  { value: 'America/Los_Angeles', label: 'Pacific (US)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Australia/Sydney', label: 'Sydney' },
]

const schema = z.object({
  name: z
    .string()
    .min(2, 'Name must be 2–64 characters')
    .max(64, 'Name must be 2–64 characters')
    .regex(/^[\p{L}\s\-]+$/u, 'Name may only contain letters, spaces, and hyphens'),
  email: z.string().email('Invalid email format'),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^[\d\s\-+()]+$/.test(v) && v.replace(/\D/g, '').length >= 10, {
      message: 'Enter a valid phone number (min 10 digits)',
    }),
  locale: z.string().min(1, 'Locale is required'),
  timeZone: z.string().min(1, 'Time zone is required'),
})

type FormData = z.infer<typeof schema>

export interface ProfileFormProps {
  profile: UserProfile
  onSubmit?: (data: FormData) => void | Promise<void>
  onSave?: (data: FormData) => void | Promise<void>
  isLoading?: boolean
  isSaving?: boolean
}

export function ProfileForm({
  profile,
  onSubmit,
  onSave,
  isLoading = false,
  isSaving = false,
}: ProfileFormProps) {
  const handleSubmitFn = onSave ?? onSubmit
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile.name ?? '',
      email: profile.email ?? '',
      phone: profile.phone ?? '',
      locale: profile.locale ?? 'en',
      timeZone: profile.timeZone ?? 'UTC',
    },
  })

  const locale = watch('locale')
  const timeZone = watch('timeZone')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <p className="text-sm text-muted-foreground">
          Update your personal details. Email changes may require verification.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleSubmitFn!)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Jane Smith"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              className={cn(errors.name && 'border-destructive focus-visible:ring-destructive')}
            />
            {errors.name && (
              <p id="name-error" className="text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="jane@example.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={cn(errors.email && 'border-destructive focus-visible:ring-destructive')}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-destructive" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="+1 234 567 8900"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              className={cn(errors.phone && 'border-destructive focus-visible:ring-destructive')}
            />
            {errors.phone && (
              <p id="phone-error" className="text-sm text-destructive" role="alert">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="locale">Locale</Label>
            <Select value={locale} onValueChange={(v) => setValue('locale', v, { shouldDirty: true })}>
              <SelectTrigger id="locale" aria-label="Select locale">
                <SelectValue placeholder="Select locale" />
              </SelectTrigger>
              <SelectContent>
                {LOCALES.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeZone">Time zone</Label>
            <Select value={timeZone} onValueChange={(v) => setValue('timeZone', v, { shouldDirty: true })}>
              <SelectTrigger id="timeZone" aria-label="Select time zone">
                <SelectValue placeholder="Select time zone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={!isDirty || isLoading || isSaving}>
            {isLoading || isSaving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving…
              </span>
            ) : (
              'Save changes'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
