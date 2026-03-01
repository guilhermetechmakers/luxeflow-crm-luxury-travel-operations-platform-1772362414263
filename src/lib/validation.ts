/**
 * Validation utilities for client detail, auth, and related data
 * Centralized validators to enforce data integrity per runtime safety rules
 */
import type { DocumentType, NoteVisibility } from '@/types/client-detail'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Validate email format */
export function isValidEmail(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') return false
  return EMAIL_REGEX.test(value.trim())
}

/** Validate phone format (min 10 chars, digits/spaces/dashes allowed) */
export function isValidPhone(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') return false
  const digits = value.replace(/\D/g, '')
  return digits.length >= 10
}

/** Check if string is non-empty after trim */
export function isNotEmpty(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0
}

/** Password strength result */
export interface PasswordStrengthResult {
  score: number
  label: string
  valid: boolean
  checks?: Array<{ label: string; met: boolean }>
}

/** Get password strength with checks */
export function getPasswordStrength(password: string | null | undefined): PasswordStrengthResult {
  const p = password ?? ''
  const checks = [
    { label: 'At least 12 characters', met: p.length >= 12 },
    { label: 'Uppercase letter', met: /[A-Z]/.test(p) },
    { label: 'Lowercase letter', met: /[a-z]/.test(p) },
    { label: 'Number', met: /\d/.test(p) },
    { label: 'Special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(p) },
  ]
  const score = checks.filter((c) => c.met).length
  const label = score <= 2 ? 'Weak' : score <= 4 ? 'Fair' : 'Strong'
  const valid = checks.every((c) => c.met)
  return { score, label, valid, checks }
}

/** Check if password meets all strength requirements */
export function isStrongPassword(value: string | null | undefined): boolean {
  return getPasswordStrength(value).valid
}

/** Compare two passwords for equality (empty strings are invalid) */
export function comparePasswords(a: string | null | undefined, b: string | null | undefined): boolean {
  if (a == null || b == null) return false
  if (typeof a !== 'string' || typeof b !== 'string') return false
  if (a === '' || b === '') return false
  return a === b
}

/** Validate date string (ISO or parseable) */
export function isValidDate(value: string | null | undefined): boolean {
  if (!value || typeof value !== 'string') return false
  const d = new Date(value)
  return !Number.isNaN(d.getTime())
}

/** Validate future date (for expiry, etc.) */
export function isFutureDate(value: string | null | undefined): boolean {
  if (!isValidDate(value)) return false
  return new Date(value!).getTime() > Date.now()
}

/** Validate document type */
export function isValidDocumentType(value: unknown): value is DocumentType {
  return value === 'passport' || value === 'visa' || value === 'other'
}

/** Validate note visibility */
export function isValidNoteVisibility(value: unknown): value is NoteVisibility {
  return value === 'private' || value === 'team' || value === 'org'
}

/** Validate file for upload (size, type) */
export interface FileValidationResult {
  valid: boolean
  error?: string
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

export function validateUploadFile(file: File | null | undefined): FileValidationResult {
  if (!file || !(file instanceof File)) {
    return { valid: false, error: 'No file selected' }
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File too large (max 10MB)' }
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Use PDF, JPEG, or PNG' }
  }
  return { valid: true }
}

/** Validate array is non-empty and contains valid items */
export function ensureArray<T>(value: unknown, guard: (v: unknown) => v is T): T[] {
  if (!Array.isArray(value)) return []
  return value.filter(guard)
}
