/**
 * Reset Password Page - LuxeFlow CRM
 * Token-based password reset with strength meter and token validation
 */
import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  PasswordResetForm,
  TokenStatusBanner,
  SupportLink,
  ResetLayoutWrapper,
} from '@/components/auth'
import type { PasswordResetFormData, TokenStatus } from '@/components/auth'
import { authApi } from '@/api/auth'
import { toast } from 'sonner'

/**
 * Parse URL hash for Supabase recovery params.
 * Supabase redirects with #access_token=...&type=recovery
 */
function getRecoveryFromHash(): boolean {
  if (typeof window === 'undefined') return false
  const hash = window.location.hash ?? ''
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  return params.get('type') === 'recovery'
}

function getTokenFromQuery(searchParams: URLSearchParams): string | null {
  return searchParams.get('token')
}

export function ResetPassword() {
  const [searchParams] = useSearchParams()
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>('missing')
  const [isValidating, setIsValidating] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateToken = useCallback(async () => {
    const hasRecoveryHash = getRecoveryFromHash()
    const queryToken = getTokenFromQuery(searchParams)

    if (queryToken) {
      setTokenStatus('valid')
      setIsValidating(false)
      return
    }

    try {
      let session = await authApi.getSession()
      if (session) {
        setTokenStatus('valid')
        setIsValidating(false)
        return
      }
      if (!hasRecoveryHash) {
        setTokenStatus('missing')
        setIsValidating(false)
        return
      }
      await new Promise((r) => setTimeout(r, 1500))
      session = await authApi.getSession()
      if (session) {
        setTokenStatus('valid')
      } else {
        setTokenStatus('expired')
      }
    } catch {
      setTokenStatus('invalid')
    }
    setIsValidating(false)
  }, [searchParams])

  useEffect(() => {
    validateToken()
    const unsubscribe = authApi.onAuthStateChange(() => validateToken())
    const timer = setTimeout(() => setIsValidating(false), 2500)
    return () => {
      unsubscribe()
      clearTimeout(timer)
    }
  }, [validateToken])

  const handleSubmit = async (data: PasswordResetFormData) => {
    setError(null)
    setLoading(true)
    try {
      await authApi.updatePassword(data.password)
      toast.success('Password updated successfully. You can now sign in.')
      window.location.href = '/login'
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update password'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (isValidating) {
    return (
      <ResetLayoutWrapper>
        <div className="flex min-h-[200px] w-full max-w-md items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </ResetLayoutWrapper>
    )
  }

  return (
    <ResetLayoutWrapper>
      <Card className="w-full max-w-md animate-fade-in-up shadow-card">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Reset your password</CardTitle>
          <CardDescription>
            {tokenStatus === 'valid'
              ? 'Enter your new password below.'
              : 'Request a new reset link to continue.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {tokenStatus !== 'valid' && (
            <TokenStatusBanner status={tokenStatus} />
          )}

          {tokenStatus === 'valid' && (
            <>
              <TokenStatusBanner status="valid" />
              <PasswordResetForm
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
              />
            </>
          )}

          {tokenStatus !== 'valid' && (
            <Button asChild className="w-full" variant="outline">
              <Link to="/forgot-password">Request new reset link</Link>
            </Button>
          )}

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
