import { UserRole, UserProfile } from '../types';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 3,
  admin: 2,
  member: 1,
};

/**
 * Strict role-based profile image visibility matrix.
 * Enforced on both backend storage policies and RLS queries:
 * 
 * Viewer | Target Member | Target Admin | Target Super Admin
 * -------|---------------|--------------|-------------------
 * Member | YES           | NO           | NO
 * Admin  | YES           | YES          | NO
 * Super  | YES           | YES          | YES
 * 
 * *User always has access to their own image regardless of role.
 */
export function canViewProfileImage(
  viewerRole: UserRole,
  targetRole: UserRole,
  isOwnImage: boolean
): boolean {
  if (isOwnImage) {
    return true;
  }
  if (viewerRole === 'super_admin') {
    return true;
  }
  if (viewerRole === 'admin') {
    return targetRole === 'member' || targetRole === 'admin';
  }
  if (viewerRole === 'member') {
    return targetRole === 'member';
  }
  return false;
}

/**
 * Validates if a user can modify a role.
 * Only super_admin can change any role.
 * Prevents privilege escalation.
 */
export function canModifyRole(
  actorRole: UserRole,
  _targetCurrentRole: UserRole,
  _targetNewRole: UserRole
): { allowed: boolean; reason?: string } {
  if (actorRole !== 'super_admin') {
    return {
      allowed: false,
      reason: 'Privilege Escalation Blocked: Only super administrators can modify user roles.',
    };
  }
  return { allowed: true };
}

/**
 * Validates if a user can update a profile.
 * Users can only update their own profile, or super_admin can update any profile.
 */
export function canUpdateProfile(
  actorUserId: string,
  actorRole: UserRole,
  targetUserId: string
): { allowed: boolean; reason?: string } {
  if (actorUserId === targetUserId || actorRole === 'super_admin') {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: 'RLS Violation: You can only update your own profile record.',
  };
}

/**
 * Validates direct storage object deletion.
 * User can only delete their own image inside folder {user_id}/
 */
export function canDeleteStorageImage(
  actorUserId: string,
  imageOwnerUserId: string
): { allowed: boolean; reason?: string } {
  if (actorUserId === imageOwnerUserId) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: 'Storage Policy Violation: You cannot delete another user’s profile image.',
  };
}

/**
 * Validates direct storage object access (signed URL generation or retrieval).
 * Emulates the exact PostgreSQL storage.objects SELECT policy.
 */
export function canAccessStorageObject(
  actorUserId: string,
  actorRole: UserRole,
  targetOwnerUserId: string,
  targetOwnerRole: UserRole
): { allowed: boolean; reason?: string } {
  const isOwn = actorUserId === targetOwnerUserId;
  const permitted = canViewProfileImage(actorRole, targetOwnerRole, isOwn);
  if (!permitted) {
    return {
      allowed: false,
      reason: `Storage Policy Denied: ${actorRole.toUpperCase()} is not authorized to read profile images belonging to ${targetOwnerRole.toUpperCase()}.`,
    };
  }
  return { allowed: true };
}
