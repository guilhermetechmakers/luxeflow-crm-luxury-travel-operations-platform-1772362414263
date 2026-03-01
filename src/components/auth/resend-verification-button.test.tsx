/**
 * ResendVerificationButton tests - cooldown, loading, error handling
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ResendVerificationButton } from './resend-verification-button'

describe('ResendVerificationButton', () => {
  it('renders resend button when available', () => {
    const onResend = vi.fn().mockResolvedValue({ success: true })
    render(<ResendVerificationButton onResend={onResend} email="user@example.com" />)
    expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument()
  })

  it('calls onResend when clicked with valid email', async () => {
    const onResend = vi.fn().mockResolvedValue({ success: true })
    render(<ResendVerificationButton onResend={onResend} email="user@example.com" />)
    fireEvent.click(screen.getByRole('button', { name: /resend verification email/i }))
    await waitFor(() => expect(onResend).toHaveBeenCalledTimes(1))
  })

  it('does not call onResend when email is invalid', () => {
    const onResend = vi.fn()
    render(<ResendVerificationButton onResend={onResend} email="" />)
    fireEvent.click(screen.getByRole('button', { name: /resend verification email/i }))
    expect(onResend).not.toHaveBeenCalled()
  })

  it('disables button when disabled prop is true', () => {
    const onResend = vi.fn()
    render(<ResendVerificationButton onResend={onResend} email="user@example.com" disabled />)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
