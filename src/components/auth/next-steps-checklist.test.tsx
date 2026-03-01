/**
 * NextStepsChecklist tests - safe rendering, missing data, progress
 */
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextStepsChecklist } from './next-steps-checklist'

describe('NextStepsChecklist', () => {
  it('renders default steps when steps array is empty', () => {
    render(<NextStepsChecklist steps={[]} />)
    expect(screen.getByText(/complete profile/i)).toBeInTheDocument()
    expect(screen.getByText(/invite team/i)).toBeInTheDocument()
    expect(screen.getByText(/0 of 2 complete/i)).toBeInTheDocument()
  })

  it('renders default steps when steps is null', () => {
    render(<NextStepsChecklist steps={null as unknown as never[]} />)
    expect(screen.getByText(/complete profile/i)).toBeInTheDocument()
  })

  it('renders custom steps with completion state', () => {
    render(
      <NextStepsChecklist
        steps={[
          { id: 'profile', label: 'Complete Profile', completed: true },
          { id: 'team', label: 'Invite Team', completed: false },
        ]}
      />
    )
    expect(screen.getByText(/complete profile/i)).toBeInTheDocument()
    expect(screen.getByText(/invite team/i)).toBeInTheDocument()
    expect(screen.getByText(/1 of 2 complete/i)).toBeInTheDocument()
  })

  it('handles steps with missing optional fields', () => {
    render(
      <NextStepsChecklist
        steps={[
          { id: 'profile', label: 'Complete Profile' },
          { id: 'team', label: 'Invite Team', completed: false },
        ]}
      />
    )
    expect(screen.getByText(/complete profile/i)).toBeInTheDocument()
    expect(screen.getByText(/invite team/i)).toBeInTheDocument()
  })

  it('has accessible progress bar', () => {
    render(
      <NextStepsChecklist
        steps={[
          { id: 'a', label: 'Step A', completed: true },
          { id: 'b', label: 'Step B', completed: false },
        ]}
      />
    )
    const progressBar = screen.getByRole('progressbar', { name: /onboarding progress/i })
    expect(progressBar).toHaveAttribute('aria-valuenow', '50')
    expect(progressBar).toHaveAttribute('aria-valuemin', '0')
    expect(progressBar).toHaveAttribute('aria-valuemax', '100')
  })
})
