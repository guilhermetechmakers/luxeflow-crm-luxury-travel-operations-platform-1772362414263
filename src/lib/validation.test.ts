/**
 * Validation utilities tests - email, password strength, runtime safety
 */
import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  isStrongPassword,
  getPasswordStrength,
  comparePasswords,
} from './validation'

describe('isValidEmail', () => {
  it('accepts valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('user+tag@agency.co')).toBe(true)
  })

  it('rejects invalid email', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('@domain.com')).toBe(false)
    expect(isValidEmail('user@')).toBe(false)
  })

  it('handles null/undefined safely', () => {
    expect(isValidEmail(null as unknown as string)).toBe(false)
    expect(isValidEmail(undefined as unknown as string)).toBe(false)
  })
})

describe('getPasswordStrength', () => {
  it('returns weak for password with no requirements met', () => {
    const r = getPasswordStrength('   ')
    expect(r.score).toBe(0)
    expect(r.label).toBe('Weak')
    expect(r.valid).toBe(false)
  })

  it('returns valid when all checks met', () => {
    const r = getPasswordStrength('SecurePass1!')
    expect(r.valid).toBe(true)
    expect(r.score).toBe(5)
  })

  it('returns checks array with met status', () => {
    const r = getPasswordStrength('abc')
    const checks = r.checks ?? []
    expect(Array.isArray(checks)).toBe(true)
    expect(checks.some((c) => c.label === 'At least 12 characters')).toBe(true)
  })

  it('handles empty string safely', () => {
    const r = getPasswordStrength('')
    expect(r.score).toBe(0)
    expect(r.checks).toBeDefined()
  })
})

describe('isStrongPassword', () => {
  it('accepts strong password', () => {
    expect(isStrongPassword('SecurePass1!')).toBe(true)
  })

  it('rejects weak password', () => {
    expect(isStrongPassword('short')).toBe(false)
    expect(isStrongPassword('nouppercase1!')).toBe(false)
    expect(isStrongPassword('NOLOWERCASE1!')).toBe(false)
  })
})

describe('comparePasswords', () => {
  it('returns true when passwords match', () => {
    expect(comparePasswords('pass123', 'pass123')).toBe(true)
  })

  it('returns false when passwords differ', () => {
    expect(comparePasswords('pass123', 'pass456')).toBe(false)
  })

  it('handles empty strings', () => {
    expect(comparePasswords('', '')).toBe(false)
  })
})
