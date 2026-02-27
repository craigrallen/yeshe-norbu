/** All available roles in the system. */
export type Role = 'admin' | 'editor' | 'finance' | 'support' | 'cashier' | 'teacher' | 'member' | 'customer';

/** Permission definitions mapped to required roles. */
const PERMISSIONS: Record<string, Role[]> = {
  // Content
  'content.read': ['admin', 'editor', 'support'],
  'content.write': ['admin', 'editor'],
  'content.delete': ['admin'],

  // Events
  'events.read': ['admin', 'editor', 'support', 'cashier'],
  'events.write': ['admin', 'editor'],
  'events.checkin': ['admin', 'editor', 'support', 'cashier'],

  // Orders
  'orders.read': ['admin', 'finance', 'support'],
  'orders.refund': ['admin', 'finance'],

  // Memberships
  'memberships.read': ['admin', 'finance', 'support'],
  'memberships.write': ['admin'],

  // Users
  'users.read': ['admin', 'support'],
  'users.write': ['admin'],
  'users.delete': ['admin'],

  // POS
  'pos.operate': ['admin', 'cashier'],
  'pos.refund': ['admin', 'finance'],
  'pos.reports': ['admin', 'finance'],

  // Audit
  'audit.read': ['admin', 'finance'],

  // Settings
  'settings.read': ['admin'],
  'settings.write': ['admin'],
};

/**
 * Check if a set of user roles has a specific permission.
 * @param userRoles - The roles assigned to the user
 * @param permission - The permission to check
 * @returns True if any of the user's roles grants the permission
 */
export function hasPermission(userRoles: string[], permission: string): boolean {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  return userRoles.some((role) => allowedRoles.includes(role as Role));
}

/**
 * Check if a user has at least one of the required roles.
 * @param userRoles - The roles assigned to the user
 * @param requiredRoles - Roles to check against
 */
export function hasRole(userRoles: string[], ...requiredRoles: Role[]): boolean {
  return userRoles.some((role) => requiredRoles.includes(role as Role));
}

/**
 * Assert a permission, throwing if not granted.
 * @param userRoles - The user's roles
 * @param permission - The permission to require
 * @throws Error if permission is not granted
 */
export function requirePermission(userRoles: string[], permission: string): void {
  if (!hasPermission(userRoles, permission)) {
    throw new Error(`Permission denied: ${permission}`);
  }
}
