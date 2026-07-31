export type RoleCode =
  | 'Administrator'
  | 'DataEntryOperator'
  | 'Engineer'
  | 'Accounts'
  | 'Viewer';

export const ROLE_DISPLAY: Record<RoleCode, string> = {
  Administrator: 'Administrator',
  DataEntryOperator: 'Data Entry Operator',
  Engineer: 'Engineer',
  Accounts: 'Accounts',
  Viewer: 'Viewer',
};

export function isAdmin(role: RoleCode): boolean {
  return role === 'Administrator';
}

export function canMutateOperational(role: RoleCode): boolean {
  return role !== 'Viewer';
}

export function canAccessAdminNav(role: RoleCode): boolean {
  return isAdmin(role);
}
