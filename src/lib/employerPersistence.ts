import type { SupabaseClient } from '@supabase/supabase-js';
import type { EmployerOnboardingStepDb } from './employerOnboardingRouting';
import type { TraitWeightsPersist } from './employerOnboardingPersistence';

export type EmployerStatus = 'pending' | 'approved' | 'rejected';

export type EmployerBusiness = {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  website: string | null;
  description: string | null;
  owner_id: string;
};

export type EmployerProfileMeta = {
  userId: string;
  role: string;
  employer_status: EmployerStatus | null;
  onboarding_complete: boolean;
  onboarding_step: string;
  onboarding_completed_at: string | null;
  businessId: string | null;
};

export function isApprovedEmployer(meta: Pick<EmployerProfileMeta, 'role' | 'employer_status'>): boolean {
  return meta.role === 'employer' && meta.employer_status === 'approved';
}

export function isPendingEmployer(meta: Pick<EmployerProfileMeta, 'role' | 'employer_status'>): boolean {
  return meta.role === 'employer' && meta.employer_status === 'pending';
}

export function isRejectedEmployer(meta: Pick<EmployerProfileMeta, 'role' | 'employer_status'>): boolean {
  return meta.role === 'employer' && meta.employer_status === 'rejected';
}

export async function fetchEmployerProfileMeta(
  client: SupabaseClient,
  userId: string,
): Promise<EmployerProfileMeta> {
  const { data: profile, error: pErr } = await client
    .from('profiles')
    .select('role, employer_status, onboarding_complete, onboarding_step, onboarding_completed_at')
    .eq('id', userId)
    .maybeSingle();
  if (pErr) throw pErr;
  if (!profile) throw new Error('Profile not found');

  const { data: business } = await client
    .from('businesses')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle();

  return {
    userId,
    role: profile.role as string,
    employer_status: (profile.employer_status as EmployerStatus | null) ?? null,
    onboarding_complete: Boolean(profile.onboarding_complete),
    onboarding_step: (profile.onboarding_step as string) ?? 'employer_company',
    onboarding_completed_at:
      typeof profile.onboarding_completed_at === 'string' ? profile.onboarding_completed_at : null,
    businessId: business?.id ?? null,
  };
}

export async function fetchEmployerBusiness(
  client: SupabaseClient,
  userId: string,
): Promise<{ business: EmployerBusiness | null; weightings: TraitWeightsPersist | null }> {
  const { data: business, error: bErr } = await client
    .from('businesses')
    .select('id, name, industry, size, website, description, owner_id')
    .eq('owner_id', userId)
    .maybeSingle();
  if (bErr) throw bErr;
  if (!business) return { business: null, weightings: null };

  const { data: wt, error: wErr } = await client
    .from('employer_trait_weightings')
    .select(
      'learning_velocity, ownership_follow_through, resilience, communication_confidence, relational_intelligence, motivational_fit',
    )
    .eq('business_id', business.id)
    .is('superseded_at', null)
    .maybeSingle();
  if (wErr) {
    console.warn('[CMe] employer_trait_weightings fetch failed:', wErr.message);
  }

  return {
    business: business as EmployerBusiness,
    weightings: wt
      ? {
          learning_velocity: wt.learning_velocity,
          ownership_follow_through: wt.ownership_follow_through,
          resilience: wt.resilience,
          communication_confidence: wt.communication_confidence,
          relational_intelligence: wt.relational_intelligence,
          motivational_fit: wt.motivational_fit,
        }
      : null,
  };
}

export async function updateEmployerBusiness(
  client: SupabaseClient,
  businessId: string,
  fields: Partial<Pick<EmployerBusiness, 'name' | 'industry' | 'size' | 'website' | 'description'>>,
): Promise<void> {
  const { error } = await client.from('businesses').update(fields).eq('id', businessId);
  if (error) throw error;
}

export function isEmployerOnboardingComplete(meta: EmployerProfileMeta): boolean {
  return (
    meta.onboarding_complete ||
    meta.onboarding_step === 'completed' ||
    meta.onboarding_completed_at != null
  );
}

export function resolveEmployerOnboardingStep(meta: EmployerProfileMeta): EmployerOnboardingStepDb {
  if (isEmployerOnboardingComplete(meta)) return 'completed';
  const step = meta.onboarding_step;
  if (
    step === 'employer_company' ||
    step === 'employer_template' ||
    step === 'employer_weights' ||
    step === 'employer_calibration'
  ) {
    return step;
  }
  return 'employer_company';
}
