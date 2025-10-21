export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: UserRole
  status: UserStatus
  emailVerified: boolean
  mfaEnabled: boolean
  lastLoginAt?: Date
  lastLoginIp?: string
  failedLoginAttempts: number
  lockedUntil?: Date
  deviceFingerprints: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserData {
  email: string
  firstName?: string
  lastName?: string
  role: UserRole
  status: UserStatus
}