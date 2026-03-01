/**
 * AdminDetailsCard - Admin user details: name, email, password, confirm password
 */
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getPasswordStrength } from '@/lib/validation'
import { cn } from '@/lib/utils'

export interface AdminDetailsCardProps {
  adminName: string
  adminEmail: string
  adminPassword: string
  confirmPassword: string
  adminPhone?: string
  onAdminNameChange: (v: string) => void
  onAdminEmailChange: (v: string) => void
  onAdminPasswordChange: (v: string) => void
  onConfirmPasswordChange: (v: string) => void
  onAdminPhoneChange?: (v: string) => void
  errors?: {
    adminName?: string
    adminEmail?: string
    adminPhone?: string
    adminPassword?: string
    confirmPassword?: string
  }
  disabled?: boolean
}

export function AdminDetailsCard({
  adminName,
  adminEmail,
  adminPassword,
  confirmPassword,
  onAdminNameChange,
  onAdminEmailChange,
  onAdminPasswordChange,
  onConfirmPasswordChange,
  adminPhone = '',
  onAdminPhoneChange,
  errors = {},
  disabled,
}: AdminDetailsCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const strength = getPasswordStrength(adminPassword)

  return (
    <Card className="shadow-card transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="pb-3">
        <CardTitle className="font-serif text-lg">Admin details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="adminName">Full name</Label>
          <Input
            id="adminName"
            type="text"
            placeholder="Jane Smith"
            value={adminName}
            onChange={(e) => onAdminNameChange(e.target.value)}
            disabled={disabled}
            aria-invalid={!!errors.adminName}
            aria-describedby={errors.adminName ? 'adminName-error' : undefined}
            className="mt-1"
          />
          {errors.adminName && (
            <p id="adminName-error" className="mt-1 text-sm text-destructive" role="alert">
              {errors.adminName}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="adminEmail">Email</Label>
          <Input
            id="adminEmail"
            type="email"
            placeholder="admin@agency.com"
            value={adminEmail}
            onChange={(e) => onAdminEmailChange(e.target.value)}
            disabled={disabled}
            aria-invalid={!!errors.adminEmail}
            aria-describedby={errors.adminEmail ? 'adminEmail-error' : undefined}
            className="mt-1"
          />
          {errors.adminEmail && (
            <p id="adminEmail-error" className="mt-1 text-sm text-destructive" role="alert">
              {errors.adminEmail}
            </p>
          )}
        </div>

        {onAdminPhoneChange && (
          <div>
            <Label htmlFor="adminPhone">Phone (optional)</Label>
            <Input
              id="adminPhone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={adminPhone}
              onChange={(e) => onAdminPhoneChange(e.target.value)}
              disabled={disabled}
              className="mt-1"
              autoComplete="tel"
            />
          </div>
        )}

        <div>
          <Label htmlFor="adminPassword">Password</Label>
          <div className="relative mt-1">
            <Input
              id="adminPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={adminPassword}
              onChange={(e) => onAdminPasswordChange(e.target.value)}
              disabled={disabled}
              aria-invalid={!!errors.adminPassword}
              aria-describedby={errors.adminPassword ? 'adminPassword-error' : 'password-strength'}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {adminPassword && (
            <div id="password-strength" className="mt-2 space-y-1" aria-live="polite">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors',
                      i <= strength.score ? 'bg-accent' : 'bg-muted'
                    )}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {strength.label} — {strength.checks.filter((c) => c.met).length}/5 requirements met
              </p>
            </div>
          )}
          {errors.adminPassword && (
            <p id="adminPassword-error" className="mt-1 text-sm text-destructive" role="alert">
              {errors.adminPassword}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative mt-1">
            <Input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
              disabled={disabled}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="mt-1 text-sm text-destructive" role="alert">
              {errors.confirmPassword}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
