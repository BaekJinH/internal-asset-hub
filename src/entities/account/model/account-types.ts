export interface Account {
  id: string
  userId: string
  email: string
  password: string
}

export interface AuthSession {
  accountId: string
  userId: string
  roleId: string
  email: string
  name: string
  jobTitle: string
  teamId: string
  loggedInAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResult {
  success: true
  session: AuthSession
}

export interface LoginError {
  success: false
  message: string
}

export type LoginResponse = LoginResult | LoginError
