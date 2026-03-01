/**
 * PasswordResetRequestForm tests - email validation, error paths
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordResetRequestForm } from './password-reset-request-form'

describe('PasswordResetRequestForm', () => {
  it('renders email input and submit button', () => {
    const onSubmit = vi.fn()
    render(<PasswordResetRequestForm onSubmit={onSubmit} />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument()
  })

  it('shows validation error for empty email', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<PasswordResetRequestForm onSubmit={onSubmit} />)
    await user.click(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<PasswordResetRequestForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText(/email/i), 'invalid')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument()
    })
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('calls onSubmit with valid email', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<PasswordResetRequestForm onSubmit={onSubmit} />)
    await user.type(screen.getByLabelText(/email/i), 'user@example.com')
    await user.click(screen.getByRole('button', { name: /send reset link/i }))
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
      expect(onSubmit.mock.calls[0][0]).toEqual({ email: 'user@example.com' })
    })
  })

  it('displays error message when error prop is set', () => {
    render(
      <PasswordResetRequestForm onSubmit={vi.fn()} error="Too many requests" />
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Too many requests')
  })

  it('disables submit when loading', () => {
    render(<PasswordResetRequestForm onSubmit={vi.fn()} loading />)
    expect(screen.getByRole('button', { name: /sending/i })).toBeDisabled()
  })
})
