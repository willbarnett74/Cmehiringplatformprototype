/**
 * Auth Routing Logic — Spec 7, Section 2
 *
 * Defines role-based routing rules for CMe.
 * Supabase Auth handles the mechanics; this module defines the routing logic only.
 *
 * File: src/lib/authRouting.ts
 */

export type UserRole = 'candidate' | 'employer';
export type IntakeStatus = 'draft' | 'complete';

export interface AuthProfile {
  role: UserRole;
  intake_status?: IntakeStatus;
  has_business_record?: boolean;
}

export type RouteTarget =
  | 'candidate_dashboard'
  | 'intake_flow'
  | 'employer_dashboard'
  | 'employer_onboarding';

export interface NavItem {
  id: string;
  label: string;
  locked: boolean;
}

export interface RoutingResult {
  target: RouteTarget;
  lockedNav: boolean;
  navItems: NavItem[];
}

/**
 * Spec 7 §2.2 — Candidate sidebar nav items.
 */
const CANDIDATE_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', locked: false },
  { id: 'profile', label: 'Profile', locked: false },
  { id: 'opportunities', label: 'Opportunities', locked: false },
  { id: 'companies', label: 'Companies', locked: false },
];

/**
 * Spec 7 §2.2 — Employer sidebar nav items.
 */
const EMPLOYER_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', locked: false },
  { id: 'search', label: 'Search', locked: false },
  { id: 'candidates', label: 'Candidates', locked: false },
  { id: 'insights', label: 'Insights', locked: false },
  { id: 'settings', label: 'Settings', locked: false },
];

/**
 * Determines routing target and nav state based on auth profile.
 *
 * Rules (Spec 7, §2.2):
 *   - candidate + intake_status = 'draft'  → intake_flow, all nav locked except Dashboard
 *   - candidate + intake_status = 'complete' → candidate_dashboard, full nav
 *   - employer + no business record          → employer_onboarding, all nav locked except Dashboard
 *   - employer + has business record         → employer_dashboard, full nav
 */
export function resolveRoute(profile: AuthProfile): RoutingResult {
  if (profile.role === 'candidate') {
    const intakeComplete = profile.intake_status === 'complete';
    return {
      target: intakeComplete ? 'candidate_dashboard' : 'intake_flow',
      lockedNav: !intakeComplete,
      navItems: CANDIDATE_NAV.map((item) =>
        !intakeComplete && item.id !== 'dashboard'
          ? { ...item, locked: true }
          : item
      ),
    };
  }

  // employer
  const hasOnboarded = profile.has_business_record ?? false;
  return {
    target: hasOnboarded ? 'employer_dashboard' : 'employer_onboarding',
    lockedNav: !hasOnboarded,
    navItems: EMPLOYER_NAV.map((item) =>
      !hasOnboarded && item.id !== 'dashboard'
        ? { ...item, locked: true }
        : item
    ),
  };
}

/**
 * Returns the root screen component name for a given role.
 * Spec 7, §2.2:
 *   candidate → ApplicantScreen.tsx (renders with sidebar: Dashboard, Profile, Opportunities, Companies)
 *   employer  → EmployerScreen.tsx  (renders with sidebar: Dashboard, Search, Candidates, Insights, Settings)
 */
export function getRootScreenForRole(
  role: UserRole
): 'ApplicantScreen' | 'EmployerScreen' {
  return role === 'candidate' ? 'ApplicantScreen' : 'EmployerScreen';
}
