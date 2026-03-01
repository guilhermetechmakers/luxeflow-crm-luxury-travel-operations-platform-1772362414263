/**
 * Login Page - LuxeFlow CRM
 * Secure authentication with email/password, SSO, and security notices
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  LoginCard,
  SSOPanel,
  AuthLinks,
  SecurityNotice,
} from '@/components/auth'
import type { LoginFormData } from '@/components/auth/login-card'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

export function Login() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, signInWithEnterprise, isAuthenticated, isLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isLoading, isAuthenticated, navigate])

  const handleSubmit = async (data: LoginFormData) => {
    setError(null)
    setLoading(true)
    try {
      await signIn(data.emailOrUsername, data.password)
      toast.success('Signed in successfully')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid credentials'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleEnterpriseSSO = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithEnterprise()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Enterprise SSO failed'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) {
    return (
      <LoginPageLayout>
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </LoginPageLayout>
    )
  }

  return (
    <LoginPageLayout>
      <Card className="w-full max-w-md animate-fade-in-up shadow-card">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to LuxeFlow CRM</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <LoginCard
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
            initialRemember={false}
          />

          <div className="flex items-center justify-between">
            <AuthLinks />
          </div>

          <SSOPanel
            onGoogleLogin={handleGoogleLogin}
            onEnterpriseSSO={handleEnterpriseSSO}
            loading={loading}
          />

          <SecurityNotice />
        </CardContent>
      </Card>
    </LoginPageLayout>
  )
}

function LoginPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F6F6F6]">
      <header className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="font-serif text-xl font-semibold text-foreground transition-colors hover:text-accent"
          >
            LuxeFlow
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium text-accent transition-colors hover:underline"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6">
        {children}
      </main>
    </div>
  )
}
