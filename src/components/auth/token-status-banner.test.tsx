/**
 * TokenStatusBanner tests - token validity, expired, invalid, missing
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { TokenStatusBanner } from './token-status-banner'

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('TokenStatusBanner', () => {
  it('shows valid message when status is valid', () => {
    renderWithRouter(<TokenStatusBanner status="valid" />)
    expect(screen.getByText(/reset link is valid/i)).toBeInTheDocument()
    expect(screen.getByText(/enter your new password/i)).toBeInTheDocument()
  })

  it('shows expired message and re-request link when status is expired', () => {
    renderWithRouter(<TokenStatusBanner status="expired" />)
    expect(screen.getByText(/link expired/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /request new reset link/i })).toHaveAttribute(
      'href',
      '/forgot-password'
    )
  })

  it('shows invalid message when status is invalid', () => {
    renderWithRouter(<TokenStatusBanner status="invalid" />)
    expect(screen.getByText(/invalid link/i)).toBeInTheDocument()
  })

  it('shows missing message when status is missing', () => {
    renderWithRouter(<TokenStatusBanner status="missing" />)
    expect(screen.getByText(/no reset link/i)).toBeInTheDocument()
  })
})
