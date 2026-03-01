/**
 * EmailVerificationPrompt - Post-signup message guiding user to verify email
 */
import { Link } from 'react-router-dom'
import { Mail, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export interface EmailVerificationPromptProps {
  email?: string
  onResend?: () => void
  resendLoading?: boolean
}

export function EmailVerificationPrompt({
  email = '',
  onResend,
  resendLoading = false,
}: EmailVerificationPromptProps) {
  return (
    <Card className="shadow-card animate-fade-in-up">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
          <Mail className="h-6 w-6 text-accent" />
        </div>
        <CardTitle className="font-serif text-2xl">Check your email</CardTitle>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ve sent a verification link to{' '}
          <span className="font-medium text-foreground">{email || 'your email'}</span>. Click the
          link to verify your account and complete onboarding.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-sm text-muted-foreground">
          After verifying, you can complete your profile and invite your team.
        </p>
        {onResend && (
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              onClick={onResend}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending...' : 'Resend verification email'}
            </Button>
          </div>
        )}
        <div className="flex justify-center pt-2">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline"
          >
            Back to sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
