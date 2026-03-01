/**
 * VerificationStatusIndicator tests - status rendering, accessibility
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VerificationStatusIndicator } from './verification-status-indicator'

describe('VerificationStatusIndicator', () => {
  it('renders Pending Verification for pending status', () => {
    render(<VerificationStatusIndicator status="pending" />)
    expect(screen.getByText(/pending verification/i)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Email verification status: Pending Verification'
    )
  })

  it('renders Verified for verified status', () => {
    render(<VerificationStatusIndicator status="verified" />)
    expect(screen.getByText(/verified/i)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Email verification status: Verified'
    )
  })

  it('renders Verification Failed for failed status', () => {
    render(<VerificationStatusIndicator status="failed" />)
    expect(screen.getByText(/verification failed/i)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute(
      'aria-label',
      'Email verification status: Verification Failed'
    )
  })

  it('falls back to pending for unknown status', () => {
    render(
      <VerificationStatusIndicator status={'unknown' as 'pending'} />
    )
    expect(screen.getByText(/pending verification/i)).toBeInTheDocument()
  })
})
