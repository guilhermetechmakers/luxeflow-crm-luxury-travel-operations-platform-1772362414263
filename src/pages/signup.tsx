/**
 * Signup Page - LuxeFlow CRM
 * Organization and admin onboarding with plan selection and team invites
 */
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SignupFormContainer } from '@/components/signup'

export function Signup() {
  return (
    <SignupPageLayout>
      <div className="w-full max-w-2xl">
        <Card className="animate-fade-in-up shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">Create your organization</CardTitle>
            <CardDescription>
              Start your LuxeFlow trial. Set up your org, admin account, and optionally invite your team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignupFormContainer />
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-accent transition-colors hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </SignupPageLayout>
  )
}

function SignupPageLayout({ children }: { children: React.ReactNode }) {
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
