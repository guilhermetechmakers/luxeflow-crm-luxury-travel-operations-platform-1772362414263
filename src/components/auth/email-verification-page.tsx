/**
 * EmailVerificationPage - Full verification experience with status, resend, next steps
 * LuxeFlow CRM - Integrates with Supabase Auth, RBAC, LuxeFlow design system
 */
import { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Mail, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  VerificationStatusIndicator,
  ResendVerificationButton,
  NextStepsChecklist,
  LoginLink,
} from '@/components/auth'
import type { VerificationStatus } from '@/components/auth'
import type { ChecklistStep } from '@/components/auth'
import { authApi } from '@/api/auth'

export function EmailVerificationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [steps, setSteps] = useState<ChecklistStep[]>([])

  const fetchStatus = useCallback(async () => {
    try {
      const result = await authApi.getVerificationStatus()
      const { status = 'pending', email: resultEmail = '', steps: resultSteps = [] } = result ?? {}
      setVerificationStatus(status)
      setEmail((prev) => (typeof resultEmail === 'string' && resultEmail ? resultEmail : prev))
      setSteps(Array.isArray(resultSteps) ? resultSteps : [])
      setError(null)
    } catch {
      setVerificationStatus('failed')
      setError('Unable to load verification status')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const state = location.state as { email?: string; userId?: string; orgId?: string } | null
    const stateEmail = state?.email
    if (typeof stateEmail === 'string' && stateEmail) {
      setEmail((prev) => stateEmail || prev)
    }
  }, [location.state])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    const unsubscribe = authApi.onAuthStateChange(() => fetchStatus())
    return unsubscribe
  }, [fetchStatus])

  useEffect(() => {
    if (!authLoading && isAuthenticated && verificationStatus === 'verified') {
      navigate('/dashboard', { replace: true })
    }
  }, [authLoading, isAuthenticated, verificationStatus, navigate])

  const handleResend = useCallback(async () => {
    let targetEmail = email
    if (!targetEmail) {
      try {
        const result = await authApi.getVerificationStatus()
        targetEmail = result?.email ?? ''
      } catch {
        return { success: false, message: 'Email not available' }
      }
    }
    if (!targetEmail || !targetEmail.includes('@')) {
      return { success: false, message: 'Email not available' }
    }
    return authApi.resendVerificationEmail(targetEmail)
  }, [email])

  const handleStepClick = useCallback(
    (step: ChecklistStep) => {
      if (step?.id === 'profile') {
        navigate('/dashboard/settings')
      } else if (step?.id === 'team') {
        navigate('/dashboard/admin')
      }
    },
    [navigate]
  )

  const defaultSteps: ChecklistStep[] = [
    { id: 'profile', label: 'Complete Profile', completed: false },
    { id: 'team', label: 'Invite Team', completed: false },
  ]
  const displaySteps = Array.isArray(steps) && steps.length > 0 ? steps : defaultSteps

  if (loading) {
    return (
      <div className="flex min-h-[200px] w-full max-w-md items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent"
          role="status"
          aria-label="Loading verification status"
        />
      </div>
    )
  }

  return (
    <Card
      className="w-full max-w-md animate-fade-in-up shadow-card"
      role="main"
      aria-labelledby="verification-heading"
    >
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
          {verificationStatus === 'verified' ? (
            <CheckCircle className="h-6 w-6 text-accent" aria-hidden />
          ) : (
            <Mail className="h-6 w-6 text-accent" aria-hidden />
          )}
        </div>
        <CardTitle id="verification-heading" className="font-serif text-2xl">
          {verificationStatus === 'verified' ? 'Email verified' : 'Check your email'}
        </CardTitle>
        <div className="mt-3 flex justify-center">
          <VerificationStatusIndicator status={verificationStatus} />
        </div>
        <div
          className="mt-4 text-left text-sm text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {verificationStatus === 'verified' ? (
            <p>
              Your email has been verified. You can now complete your profile and invite your team
              to get started.
            </p>
          ) : (
            <p>
              We&apos;ve sent a verification link to{' '}
              <span className="font-medium text-foreground">{email || 'your email'}</span>. Click
              the link to verify your account and complete onboarding.
            </p>
          )}
        </div>
        {error ? (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-6">
        {verificationStatus !== 'verified' ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <ResendVerificationButton onResend={handleResend} email={email} />
          </div>
        ) : (
          <div className="flex justify-center">
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto"
            >
              Proceed to Dashboard
            </Button>
          </div>
        )}

        <NextStepsChecklist steps={displaySteps} onStepClick={handleStepClick} />

        <div className="flex justify-center pt-2">
          <LoginLink text="Back to sign in" />
        </div>
      </CardContent>
    </Card>
  )
}
