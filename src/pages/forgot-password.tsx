/**
 * Forgot Password Page - LuxeFlow CRM
 * Request password reset via email with success state and support link
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  PasswordResetRequestForm,
  SupportLink,
  ResetLayoutWrapper,
} from '@/components/auth'
import type { PasswordResetRequestFormData } from '@/components/auth/password-reset-request-form'
import { authApi } from '@/api/auth'
import { toast } from 'sonner'
import { Mail, ArrowLeft } from 'lucide-react'

export function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: PasswordResetRequestFormData) => {
    setError(null)
    setLoading(true)
    try {
      await authApi.requestPasswordReset(data.email)
      setSent(true)
      toast.success('If an account exists, we sent a reset link to your email.')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to send reset email'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <ResetLayoutWrapper>
        <Card className="w-full max-w-md animate-fade-in-up shadow-card">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Mail className="h-6 w-6 text-accent" aria-hidden />
            </div>
            <CardTitle className="font-serif text-2xl">Check your email</CardTitle>
            <CardDescription className="text-base">
              If an account with that email exists, we&apos;ve sent password
              reset instructions. If you don&apos;t see the email, check your
              spam folder.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
            <div className="text-center">
              <SupportLink />
            </div>
          </CardContent>
        </Card>
      </ResetLayoutWrapper>
    )
  }

  return (
    <ResetLayoutWrapper>
      <Card className="w-full max-w-md animate-fade-in-up shadow-card">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Forgot password?</CardTitle>
          <CardDescription>
            Enter your email to receive a secure reset link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PasswordResetRequestForm
            onSubmit={onSubmit}
            loading={loading}
            error={error}
          />

          <div className="flex flex-col items-center gap-2 border-t border-border pt-4">
            <SupportLink />
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Back to Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </ResetLayoutWrapper>
  )
}
