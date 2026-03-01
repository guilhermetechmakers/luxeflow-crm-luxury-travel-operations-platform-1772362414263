/**
 * Email Verification Page - LuxeFlow CRM
 * Post-signup verification status, resend, next steps (Complete Profile, Invite Team)
 */
import { ResetPageLayout, EmailVerificationPage } from '@/components/auth'

export function VerifyEmail() {
  return (
    <ResetPageLayout>
      <div className="w-full max-w-md">
        <EmailVerificationPage />
      </div>
    </ResetPageLayout>
  )
}
