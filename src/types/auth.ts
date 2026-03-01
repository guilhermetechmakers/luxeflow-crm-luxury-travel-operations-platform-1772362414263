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
