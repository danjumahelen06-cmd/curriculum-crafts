import { SecurityTestResult, UserProfile } from '../types';
import {
  canViewProfileImage,
  canModifyRole,
  canUpdateProfile,
  canDeleteStorageImage,
  canAccessStorageObject,
} from './security-engine';
import { BackendSecuritySimulator } from './supabase';

export async function runSecurityTests(): Promise<SecurityTestResult[]> {
  const timestamp = new Date().toLocaleTimeString();

  // Test identities
  const mockMember: UserProfile = {
    id: 'test-member-id',
    user_id: 'test-member-user-id',
    full_name: 'Test Member',
    email: 'member@test.local',
    role: 'member',
    profile_image_url: 'https://example.com/member.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockAdmin: UserProfile = {
    id: 'test-admin-id',
    user_id: 'test-admin-user-id',
    full_name: 'Test Admin',
    email: 'admin@test.local',
    role: 'admin',
    profile_image_url: 'https://example.com/admin.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockSuperAdmin: UserProfile = {
    id: 'test-superadmin-id',
    user_id: 'test-superadmin-user-id',
    full_name: 'Test Super Admin',
    email: 'superadmin@test.local',
    role: 'super_admin',
    profile_image_url: 'https://example.com/superadmin.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const results: SecurityTestResult[] = [];

  // -------------------------------------------------------------
  // Test 1: Member logs in -> can see member images -> cannot see admin or super_admin images
  // -------------------------------------------------------------
  const t1MemberOk = canViewProfileImage('member', 'member', false);
  const t1AdminBlocked = !canViewProfileImage('member', 'admin', false);
  const t1SuperAdminBlocked = !canViewProfileImage('member', 'super_admin', false);
  const t1Passed = t1MemberOk && t1AdminBlocked && t1SuperAdminBlocked;

  results.push({
    id: 'SEC-TEST-01',
    name: 'Test 1: Member Image Visibility Restrictions',
    description: 'Member must only view member profile images and must be denied admin & super_admin images.',
    scenario: 'Member logs in → checks visibility for member, admin, and super_admin images.',
    passed: t1Passed,
    details: t1Passed
      ? 'PASSED: Member correctly allowed to see member images (✅), blocked from admin images (🔒), and blocked from super_admin images (🔒).'
      : 'FAILED: Member permitted to access unauthorized role images.',
    timestamp,
  });

  // -------------------------------------------------------------
  // Test 2: Admin logs in -> can see member and admin images -> cannot see super_admin images
  // -------------------------------------------------------------
  const t2MemberOk = canViewProfileImage('admin', 'member', false);
  const t2AdminOk = canViewProfileImage('admin', 'admin', false);
  const t2SuperAdminBlocked = !canViewProfileImage('admin', 'super_admin', false);
  const t2Passed = t2MemberOk && t2AdminOk && t2SuperAdminBlocked;

  results.push({
    id: 'SEC-TEST-02',
    name: 'Test 2: Admin Image Visibility Restrictions',
    description: 'Admin must view member & admin images, but must be strictly denied super_admin images.',
    scenario: 'Admin logs in → checks visibility for member, admin, and super_admin images.',
    passed: t2Passed,
    details: t2Passed
      ? 'PASSED: Admin correctly allowed to view member images (✅) and admin images (✅), strictly blocked from super_admin images (🔒).'
      : 'FAILED: Admin permitted to view super_admin images.',
    timestamp,
  });

  // -------------------------------------------------------------
  // Test 3: Super admin logs in -> can see all images
  // -------------------------------------------------------------
  const t3MemberOk = canViewProfileImage('super_admin', 'member', false);
  const t3AdminOk = canViewProfileImage('super_admin', 'admin', false);
  const t3SuperAdminOk = canViewProfileImage('super_admin', 'super_admin', false);
  const t3Passed = t3MemberOk && t3AdminOk && t3SuperAdminOk;

  results.push({
    id: 'SEC-TEST-03',
    name: 'Test 3: Super Admin Full Visibility',
    description: 'Super admin must possess authorization to view all profile images across the organization.',
    scenario: 'Super admin logs in → checks visibility across all 3 tiers.',
    passed: t3Passed,
    details: t3Passed
      ? 'PASSED: Super admin successfully authorized to view member (✅), admin (✅), and super_admin (✅) profile images.'
      : 'FAILED: Super admin was denied access to one or more tiers.',
    timestamp,
  });

  // -------------------------------------------------------------
  // Test 4: Member attempts to change their role -> must fail
  // -------------------------------------------------------------
  const t4Check = canModifyRole('member', 'member', 'admin');
  const t4Passed = !t4Check.allowed;

  results.push({
    id: 'SEC-TEST-04',
    name: 'Test 4: Member Self-Promotion Privilege Escalation Prevention',
    description: 'Member attempting to elevate own role to admin or super_admin must be rejected by backend rules.',
    scenario: 'Member issues an UPDATE payload with role = "admin".',
    passed: t4Passed,
    details: t4Passed
      ? `PASSED: Role mutation blocked. Trigger message: "${t4Check.reason}"`
      : 'FAILED: Member was permitted to escalate role.',
    timestamp,
  });

  // -------------------------------------------------------------
  // Test 5: Admin attempts to change their role to super_admin -> must fail
  // -------------------------------------------------------------
  const t5Check = canModifyRole('admin', 'admin', 'super_admin');
  const t5Passed = !t5Check.allowed;

  results.push({
    id: 'SEC-TEST-05',
    name: 'Test 5: Admin Privilege Escalation to Super Admin Prevention',
    description: 'Admin attempting to elevate to super_admin must be strictly rejected.',
    scenario: 'Admin issues an UPDATE payload with role = "super_admin".',
    passed: t5Passed,
    details: t5Passed
      ? `PASSED: Role escalation blocked. Trigger message: "${t5Check.reason}"`
      : 'FAILED: Admin was permitted to escalate to super_admin.',
    timestamp,
  });

  // -------------------------------------------------------------
  // Test 6: Member attempts to access an admin image directly through Storage -> must be denied
  // -------------------------------------------------------------
  const t6Check = canAccessStorageObject(
    mockMember.user_id,
    mockMember.role,
    mockAdmin.user_id,
    mockAdmin.role
  );
  const t6Passed = !t6Check.allowed;

  results.push({
    id: 'SEC-TEST-06',
    name: 'Test 6: Member Direct Storage Access to Admin Image Denied',
    description: 'Member requesting signed URL / downloading object from admin folder in profile-images bucket must be blocked.',
    scenario: 'Member calls storage.from("profile-images").createSignedUrl("u-admin-01/profile.jpg").',
    passed: t6Passed,
    details: t6Passed
      ? `PASSED: Direct Storage SELECT policy rejected. Reason: "${t6Check.reason}"`
      : 'FAILED: Member obtained signed storage URL for admin image.',
    timestamp,
  });

  // -------------------------------------------------------------
  // Test 7: Admin attempts to access a super_admin image directly through Storage -> must be denied
  // -------------------------------------------------------------
  const t7Check = canAccessStorageObject(
    mockAdmin.user_id,
    mockAdmin.role,
    mockSuperAdmin.user_id,
    mockSuperAdmin.role
  );
  const t7Passed = !t7Check.allowed;

  results.push({
    id: 'SEC-TEST-07',
    name: 'Test 7: Admin Direct Storage Access to Super Admin Image Denied',
    description: 'Admin requesting signed URL / downloading object from super_admin folder must be blocked by storage policies.',
    scenario: 'Admin calls storage.from("profile-images").createSignedUrl("u-superadmin-01/profile.jpg").',
    passed: t7Passed,
    details: t7Passed
      ? `PASSED: Direct Storage SELECT policy rejected. Reason: "${t7Check.reason}"`
      : 'FAILED: Admin obtained signed storage URL for super_admin image.',
    timestamp,
  });

  // -------------------------------------------------------------
  // Test 8: User attempts to update another user's profile -> must fail
  // -------------------------------------------------------------
  const t8Check = canUpdateProfile(
    mockMember.user_id,
    mockMember.role,
    mockAdmin.user_id
  );
  const t8Passed = !t8Check.allowed;

  results.push({
    id: 'SEC-TEST-08',
    name: 'Test 8: Cross-User Profile Modification Blocked (RLS)',
    description: 'A standard user attempting to UPDATE another user’s profile row must fail RLS policy.',
    scenario: 'User A executes UPDATE profiles SET bio = "Hacked" WHERE user_id = User B.',
    passed: t8Passed,
    details: t8Passed
      ? `PASSED: RLS WITH CHECK policy blocked update. Reason: "${t8Check.reason}"`
      : 'FAILED: User was able to write to another user’s profile.',
    timestamp,
  });

  // -------------------------------------------------------------
  // Test 9: User attempts to delete another user's profile image -> must fail
  // -------------------------------------------------------------
  const t9Check = canDeleteStorageImage(mockMember.user_id, mockAdmin.user_id);
  const t9Passed = !t9Check.allowed;

  results.push({
    id: 'SEC-TEST-09',
    name: 'Test 9: Cross-User Profile Image Deletion Blocked',
    description: 'User attempting to DELETE an object inside another user’s storage directory must fail.',
    scenario: 'User A executes storage.from("profile-images").remove(["u-admin-01/profile.jpg"]).',
    passed: t9Passed,
    details: t9Passed
      ? `PASSED: Storage DELETE policy blocked action. Reason: "${t9Check.reason}"`
      : 'FAILED: User was able to delete another user’s storage file.',
    timestamp,
  });

  // -------------------------------------------------------------
  // Test 10: Super admin can manage user roles
  // -------------------------------------------------------------
  const t10PromoteCheck = canModifyRole('super_admin', 'member', 'admin');
  const t10DemoteCheck = canModifyRole('super_admin', 'admin', 'member');
  const t10ElevateCheck = canModifyRole('super_admin', 'admin', 'super_admin');
  const t10Passed = t10PromoteCheck.allowed && t10DemoteCheck.allowed && t10ElevateCheck.allowed;

  results.push({
    id: 'SEC-TEST-10',
    name: 'Test 10: Super Admin Role Governance Authority',
    description: 'Super admin must have validated authority to promote, demote, and reassign user roles.',
    scenario: 'Super admin updates roles (member → admin, admin → member, admin → super_admin).',
    passed: t10Passed,
    details: t10Passed
      ? 'PASSED: Super admin authorized to manage all user roles and governance tiers.'
      : 'FAILED: Super admin was restricted from managing roles.',
    timestamp,
  });

  return results;
}
