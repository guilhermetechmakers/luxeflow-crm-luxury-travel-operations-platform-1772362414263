/**
 * SignupFormContainer - Multi-section signup form with validation
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrgDetailsCard } from './org-details-card'
import { AdminDetailsCard } from './admin-details-card'
import { PlanSelectorCard, type Plan } from './plan-selector-card'
import { TeamInvitationCard, type InviteItem } from './team-invitation-card'
import { TermsAgreementCard } from './terms-agreement-card'
import { signupOrgAdmin, fetchPlans, type SignupPayload } from '@/api/signup'
import { isValidEmail, isStrongPassword, isNotEmpty, comparePasswords } from '@/lib/validation'

function generateId() {
  return `invite-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export interface SignupFormState {
  orgName: string
  adminName: string
  adminEmail: string
  adminPassword: string
  confirmPassword: string
  adminPhone?: string
  planId: string
  invites: InviteItem[]
  termsAccepted: boolean
}

const defaultState: SignupFormState = {
  orgName: '',
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  confirmPassword: '',
  adminPhone: '',
  planId: 'trial',
  invites: [],
  termsAccepted: false,
}

export interface FormErrors {
  orgName?: string
  adminName?: string
  adminEmail?: string
  adminPassword?: string
  confirmPassword?: string
  termsAccepted?: string
  [key: string]: string | undefined
}

function validateForm(state: SignupFormState): FormErrors {
  const errors: FormErrors = {}

  if (!isNotEmpty(state.orgName)) {
    errors.orgName = 'Organization name is required'
  } else if (state.orgName.length < 2) {
    errors.orgName = 'Organization name must be at least 2 characters'
  }

  if (!isNotEmpty(state.adminName)) {
    errors.adminName = 'Full name is required'
  } else if (state.adminName.length < 2) {
    errors.adminName = 'Name must be at least 2 characters'
  }

  if (!isNotEmpty(state.adminEmail)) {
    errors.adminEmail = 'Email is required'
  } else if (!isValidEmail(state.adminEmail)) {
    errors.adminEmail = 'Enter a valid email address'
  }

  if (!isNotEmpty(state.adminPassword)) {
    errors.adminPassword = 'Password is required'
  } else if (!isStrongPassword(state.adminPassword)) {
    errors.adminPassword =
      'Password must be at least 12 characters with uppercase, lowercase, number, and special character'
  }

  if (!comparePasswords(state.adminPassword, state.confirmPassword)) {
    errors.confirmPassword = 'Passwords do not match'
  }

  if (!state.termsAccepted) {
    errors.termsAccepted = 'You must accept the Terms of Service and Privacy Policy'
  }

  const invitesList = Array.isArray(state.invites) ? state.invites : []
  invitesList.forEach((inv) => {
    if (inv.email && !isValidEmail(inv.email)) {
      errors[`invite-${inv.id}-email`] = 'Enter a valid email'
    }
  })

  return errors
}

export function SignupFormContainer() {
  const navigate = useNavigate()
  const [state, setState] = useState<SignupFormState>(defaultState)
  const [errors, setErrors] = useState<FormErrors>({})
  const [plans, setPlans] = useState<Plan[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchPlans()
      .then((data) => setPlans(Array.isArray(data) ? data : []))
      .catch(() => setPlans([]))
  }, [])

  const addInvite = useCallback(() => {
    setState((s) => ({
      ...s,
      invites: [...(s.invites ?? []), { id: generateId(), email: '', role: 'Agent' }],
    }))
  }, [])

  const removeInvite = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      invites: (s.invites ?? []).filter((inv) => inv.id !== id),
    }))
  }, [])

  const updateInvite = useCallback((id: string, field: 'email' | 'role', value: string) => {
    setState((s) => ({
      ...s,
      invites: (s.invites ?? []).map((inv) =>
        inv.id === id ? { ...inv, [field]: value } : inv
      ),
    }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const formErrors = validateForm(state)
      setErrors(formErrors)

      if (Object.keys(formErrors).length > 0) {
        toast.error('Please fix the errors before submitting')
        return
      }

      setIsSubmitting(true)
      try {
        const payload: SignupPayload = {
          orgName: state.orgName,
          adminName: state.adminName,
          adminEmail: state.adminEmail,
          adminPassword: state.adminPassword,
          planId: state.planId,
          invites: (state.invites ?? [])
            .filter((inv) => inv.email && isValidEmail(inv.email))
            .map((inv) => ({ email: inv.email, role: inv.role })),
          termsAccepted: state.termsAccepted,
        }

        const res = await signupOrgAdmin(payload)
        const { orgId = '', userId = '', verificationRequired = true } = res ?? {}

        toast.success('Account created. Check your email to verify.')
        navigate('/verify-email', {
          replace: true,
          state: { email: state.adminEmail, orgId, userId, verificationRequired },
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Signup failed'
        toast.error(message)
        setErrors({ submit: message })
      } finally {
        setIsSubmitting(false)
      }
    },
    [state, navigate]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <OrgDetailsCard
        value={state.orgName}
        onChange={(v) => setState((s) => ({ ...s, orgName: v }))}
        error={errors.orgName}
        disabled={isSubmitting}
      />

      <AdminDetailsCard
        adminName={state.adminName}
        adminEmail={state.adminEmail}
        adminPassword={state.adminPassword}
        confirmPassword={state.confirmPassword}
        onAdminNameChange={(v) => setState((s) => ({ ...s, adminName: v }))}
        onAdminEmailChange={(v) => setState((s) => ({ ...s, adminEmail: v }))}
        onAdminPasswordChange={(v) => setState((s) => ({ ...s, adminPassword: v }))}
        onConfirmPasswordChange={(v) => setState((s) => ({ ...s, confirmPassword: v }))}
        adminPhone={state.adminPhone ?? ''}
        onAdminPhoneChange={(v) => setState((s) => ({ ...s, adminPhone: v }))}
        errors={{
          adminName: errors.adminName,
          adminEmail: errors.adminEmail,
          adminPassword: errors.adminPassword,
          confirmPassword: errors.confirmPassword,
        }}
        disabled={isSubmitting}
      />

      <PlanSelectorCard
        plans={plans}
        selectedPlanId={state.planId}
        onSelect={(v) => setState((s) => ({ ...s, planId: v }))}
        disabled={isSubmitting}
      />

      <TeamInvitationCard
        invites={state.invites}
        onAdd={addInvite}
        onRemove={removeInvite}
        onUpdate={updateInvite}
        errors={errors}
        disabled={isSubmitting}
      />

      <TermsAgreementCard
        checked={state.termsAccepted}
        onChange={(v) => setState((s) => ({ ...s, termsAccepted: v }))}
        error={errors.termsAccepted}
        disabled={isSubmitting}
      />

      <Button
        type="submit"
        className="w-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  )
}
