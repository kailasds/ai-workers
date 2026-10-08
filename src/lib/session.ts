// MOCK SESSION. The real shell reads GET /auth/me and /auth/permissions on every navigation
// and hides (not disables) entries the account cannot use. Values mirror the offline capture.

export interface Session {
  displayName: string
  roleLabel: string
  features: string[]
}

export const MOCK_SESSION: Session = {
  displayName: 'Offline Demo Capture',
  roleLabel: 'Administrator',
  features: ['users.manage'],
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
