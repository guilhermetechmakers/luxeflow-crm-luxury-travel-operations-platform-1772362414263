/**
 * EmailVerificationPage tests - status rendering, safe API handling
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { EmailVerificationPage } from './email-verification-page'
import { authApi } from '@/api/auth'
import { AuthProvider } from '@/contexts/auth-context'

vi.mock('@/api/auth', () => ({
  authApi: {
    getVerificationStatus: vi.fn(),
    resendVerificationEmail: vi.fn(),
    getSession: vi.fn().mockResolvedValue(null),
    onAuthStateChange: vi.fn(() => () => {}),
  },
}))

function renderWithProviders(ui: React.ReactElement, locationState?: object) {
  const initialEntry = locationState
    ? { pathname: '/verify-email', state: locationState }
    : '/verify-email'
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  )
}

describe('EmailVerificationPage', () => {
  beforeEach(() => {
    vi.mocked(authApi.getVerificationStatus).mockResolvedValue({
      status: 'pending',
      email: 'user@example.com',
      steps: [
        { id: 'profile', label: 'Complete Profile', completed: false },
        { id: 'team', label: 'Invite Team', completed: false },
      ],
    })
  })

  it('renders pending verification status', async () => {
    renderWithProviders(<EmailVerificationPage />)
    await waitFor(() => {
      expect(screen.getByText(/pending verification/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    expect(screen.getByText(/user@example.com/)).toBeInTheDocument()
  })

  it('renders verified status when API returns verified', async () => {
    vi.mocked(authApi.getVerificationStatus).mockResolvedValue({
      status: 'verified',
      email: 'user@example.com',
      steps: [],
    })
    renderWithProviders(<EmailVerificationPage />)
    await waitFor(() => {
      expect(screen.getByRole('status', { name: /email verification status: verified/i })).toBeInTheDocument()
    })
    expect(screen.getByRole('heading', { name: /email verified/i })).toBeInTheDocument()
  })

  it('handles missing API response fields safely', async () => {
    vi.mocked(authApi.getVerificationStatus).mockResolvedValue({} as never)
    renderWithProviders(<EmailVerificationPage />, { email: 'from-state@example.com' })
    await waitFor(() => {
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/from-state@example.com/)).toBeInTheDocument()
  })

  it('renders Next Steps checklist with Complete Profile and Invite Team', async () => {
    renderWithProviders(<EmailVerificationPage />)
    await waitFor(() => {
      expect(screen.getByText(/complete profile/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/invite team/i)).toBeInTheDocument()
  })

  it('shows Resend button when pending', async () => {
    renderWithProviders(<EmailVerificationPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument()
    })
  })
})
