/**
 * Email Verification Page - LuxeFlow CRM
 * Post-signup guidance to verify email and next steps
 */
import { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { EmailVerificationPrompt } from '@/components/signup'

export function VerifyEmail() {
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    const state = location.state as { email?: string; orgId?: string; userId?: string } | null
    const stateEmail = state?.email ?? ''
    setEmail(typeof stateEmail === 'string' ? stateEmail : '')
  }, [location.state])

  const handleResend = async () => {
    setResendLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1500))
      setResendLoading(false)
    } catch {
      setResendLoading(false)
    }
  }

  return (
    <VerifyEmailLayout>
      <div className="w-full max-w-md">
        <EmailVerificationPrompt
          email={email}
          onResend={handleResend}
          resendLoading={resendLoading}
        />
      </div>
    </VerifyEmailLayout>
  )
}

function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
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
              to="/login"
              className="text-sm font-medium text-accent transition-colors hover:underline"
            >
              Sign In
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
