# Email Verification - LuxeFlow CRM

## Overview

The Email Verification flow confirms a user's email after signup, displays verification status, and guides users through next steps (Complete Profile, Invite Team). It integrates with Supabase Auth and the LuxeFlow design system.

## Data Flow

1. **Signup** → User signs up via `signupOrgAdmin()`. Supabase sends verification email with link to `/verify-email`.
2. **Landing** → User lands on `/verify-email` (with optional `state` from navigation: `email`, `userId`, `orgId`).
3. **Token in URL** → When user clicks the email link, Supabase redirects to `/verify-email` with hash fragments (`#access_token=...&refresh_token=...&type=signup`). Supabase client automatically processes these.
4. **Status Fetch** → `authApi.getVerificationStatus()` checks `user.email_confirmed_at` via Supabase `getUser()`.
5. **Resend** → `authApi.resendVerificationEmail(email)` uses Supabase `auth.resend({ type: 'signup', email })`.

## API Contracts

### getVerificationStatus()

- **Source:** `authApi.getVerificationStatus()` (Supabase `getUser()`)
- **Returns:** `{ status: 'pending' | 'verified' | 'failed', email?: string, steps?: ChecklistStep[] }`
- **Steps:** Derived from `user.user_metadata.full_name` (profile complete) and default `Invite Team`.

### resendVerificationEmail(email: string)

- **Source:** `authApi.resendVerificationEmail()` (Supabase `auth.resend()`)
- **Returns:** `{ success: boolean, message?: string, nextRetrySeconds?: number }`
- **Rate limiting:** Supabase enforces server-side; client implements 60s cooldown.

### Security

- Verification status requires no extra auth; `getUser()` uses current session.
- Resend is only useful for unverified users; Supabase validates the email exists.
- Tokens in URL hash are processed client-side by Supabase; never log or expose them.

## Components

| Component | Purpose |
|-----------|---------|
| `EmailVerificationPage` | Main page: status, resend, next steps, login link |
| `VerificationStatusIndicator` | Pill/badge: Pending / Verified / Failed |
| `ResendVerificationButton` | Resend with 60s cooldown, loading, toasts |
| `NextStepsChecklist` | Complete Profile, Invite Team with progress |
| `LoginLink` | Link to `/login` |

## Deployment Considerations

- **Redirect URL:** Configure Supabase Auth to allow redirect to `{origin}/verify-email`.
- **Rate limiting:** Supabase rate-limits resend; client cooldown (60s) reduces unnecessary requests.
- **Token expiry:** Supabase verification links expire per project Auth settings.
- **Email templates:** Customize in Supabase Dashboard → Authentication → Email Templates.

## Runtime Safety

All code follows:

- `data ?? []` for array defaults
- `(items ?? []).map(...)` or `Array.isArray(items) ? items.map(...) : []`
- `useState<Step[]>([])` for array state
- `response?.data?.status ?? 'pending'`
- Optional chaining and destructuring with defaults
