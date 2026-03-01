/**
 * PasswordStrengthMeter tests - visual feedback, strength labels
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PasswordStrengthMeter } from './password-strength-meter'

describe('PasswordStrengthMeter', () => {
  it('returns null when password is empty', () => {
    const { container } = render(<PasswordStrengthMeter password="" />)
    expect(container.firstChild).toBeNull()
  })

  it('shows strength label for weak password', () => {
    render(<PasswordStrengthMeter password="   " />)
    expect(screen.getByLabelText(/password strength/i)).toBeInTheDocument()
    expect(screen.getByText(/weak/i)).toBeInTheDocument()
  })

  it('shows strength label for strong password', () => {
    render(<PasswordStrengthMeter password="SecurePass1!" />)
    expect(screen.getByText(/strong/i)).toBeInTheDocument()
  })

  it('handles null/undefined password safely', () => {
    const { container } = render(
      <PasswordStrengthMeter password={null as unknown as string} />
    )
    expect(container.firstChild).toBeNull()
  })
})
