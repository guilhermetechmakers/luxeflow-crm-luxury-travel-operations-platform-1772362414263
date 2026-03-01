/**
 * Validation utilities for LuxeFlow CRM
 * isValidEmail, isStrongPassword, isNotEmpty, comparePasswords
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 12

/**
 * Validates email format
 */
export function isValidEmail(value: string): boolean {
  if (!value || typeof value !== 'string') return false
  return EMAIL_REGEX.test(value.trim())
}

/**
 * Validates password strength: min 12 chars, uppercase, lowercase, number, special char
 */
export function isStrongPassword(value: string): boolean {
  if (!value || typeof value !== 'string') return false
  if (value.length < MIN_PASSWORD_LENGTH) return false
  const hasUpper = /[A-Z]/.test(value)
  const hasLower = /[a-z]/.test(value)
  const hasNumber = /\d/.test(value)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)
  return hasUpper && hasLower && hasNumber && hasSpecial
}

/**
 * Returns password strength feedback for UI
 */
export function getPasswordStrength(value: string): {
  score: number
  label: string
  valid: boolean
  checks: { label: string; met: boolean }[]
} {
  const checks = [
    { label: 'At least 12 characters', met: (value?.length ?? 0) >= MIN_PASSWORD_LENGTH },
    { label: 'One uppercase letter', met: /[A-Z]/.test(value ?? '') },
    { label: 'One lowercase letter', met: /[a-z]/.test(value ?? '') },
    { label: 'One number', met: /\d/.test(value ?? '') },
    { label: 'One special character', met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value ?? '') },
  ]
  const score = checks.filter((c) => c.met).length
  const labels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
  return {
    score,
    label: labels[Math.min(score, 4)],
    valid: score === 5,
    checks,
  }
}

/**
 * Checks if string is not empty
 */
export function isNotEmpty(value: string): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * Compares two password strings
 */
export function comparePasswords(password: string, confirmPassword: string): boolean {
  if (!password || !confirmPassword) return false
  return password === confirmPassword
}
