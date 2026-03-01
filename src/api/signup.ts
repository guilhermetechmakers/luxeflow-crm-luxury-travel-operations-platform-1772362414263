/**
 * Signup API - Organization and admin user registration
 * Uses Supabase Auth for user creation; org/team scaffolding ready for Edge Function expansion
 */
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'

export interface SignupInvite {
  email: string
  role: string // UserRole: Admin | Agent | Ops | Finance
}

export interface SignupPayload {
  orgName: string
  adminName: string
  adminEmail: string
  adminPassword: string
  planId: string
  invites: SignupInvite[]
  termsAccepted: boolean
}

export interface SignupResponse {
  orgId: string
  userId: string
  verificationRequired: boolean
  verificationToken?: string
}

/**
 * Sign up organization admin. Uses Supabase Auth; org/team creation via future Edge Function.
 * Runtime-safe: all responses use defaults and Array.isArray checks.
 */
export async function signupOrgAdmin(payload: SignupPayload): Promise<SignupResponse> {
  const { adminEmail, adminPassword, adminName, orgName } = payload

  const { data, error } = await supabase.auth.signUp({
    email: adminEmail,
    password: adminPassword,
    options: {
      data: {
        full_name: adminName,
        org_name: orgName,
        plan_id: payload.planId,
        invites: Array.isArray(payload.invites) ? payload.invites : [],
      },
    },
  })

  if (error) throw new Error(error.message)

  const user = data?.user ?? null
  if (!user) throw new Error('Signup failed')

  const session = data?.session ?? null
  const verificationRequired = !session

  return {
    orgId: user.id,
    userId: user.id,
    verificationRequired,
    verificationToken: undefined,
  }
}

/**
 * Verify email with token. Calls backend when available.
 */
export async function verifyEmail(userId: string, verificationToken: string): Promise<boolean> {
  try {
    const res = await api.post<{ success: boolean }>('/signup/verify-email', {
      userId,
      verificationToken,
    })
    return res?.success ?? false
  } catch {
    return false
  }
}

export interface Plan {
  id: string
  name: string
  price: number
  duration: string
  features: string[]
}

/**
 * Fetch plans for plan selector. Returns mock data when backend not available.
 */
export async function fetchPlans(): Promise<Plan[]> {
  try {
    const data = await api.get<Plan[] | { data?: Plan[] }>('/plans')
    const list = Array.isArray(data) ? data : (data as { data?: Plan[] })?.data ?? []
    return Array.isArray(list) ? list : getDefaultPlans()
  } catch {
    return getDefaultPlans()
  }
}

function getDefaultPlans() {
  return [
    {
      id: 'trial',
      name: 'Trial',
      price: 0,
      duration: '14 days',
      features: ['Full access', 'Up to 5 users', 'Email support'],
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 99,
      duration: 'month',
      features: ['Everything in Trial', 'Unlimited users', 'Priority support'],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 299,
      duration: 'month',
      features: ['Everything in Pro', 'Custom integrations', 'Dedicated support'],
    },
  ]
}
