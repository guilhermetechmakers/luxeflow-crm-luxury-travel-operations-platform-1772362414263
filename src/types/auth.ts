/**
 * Auth types for LuxeFlow CRM
 * User, Session, and role-based access (Admin, Agent, Ops, Finance)
 */

export type UserRole = 'Admin' | 'Agent' | 'Ops' | 'Finance'

export interface User {
  id: string
  email: string
  username?: string
  name?: string
  roles: UserRole[]
  twoFactorEnabled?: boolean
}

export interface Session {
  token: string
  userId: string
  expiresAt: string
  device?: string
}

export interface AuthResponse {
  token: string
  user: User
  roles: UserRole[]
}

export interface SignInInput {
  emailOrUsername: string
  password: string
  rememberMe: boolean
}

export interface SignUpInput {
  email: string
  password: string
  name?: string
  orgName?: string
}

/** Request password reset - POST /auth/request-password-reset */
export interface RequestPasswordResetInput {
  email: string
}

/** Reset password with token - POST /auth/reset-password */
export interface ResetPasswordInput {
  token: string
  password: string
}

/** API response for request-password-reset (200/202) */
export interface RequestPasswordResetResponse {
  message: string
}

/** API response for reset-password (200) */
export interface ResetPasswordResponse {
  message: string
}
