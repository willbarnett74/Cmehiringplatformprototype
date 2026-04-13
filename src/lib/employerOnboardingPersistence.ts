import type { SupabaseClient } from '@supabase/supabase-js';
import type { CompanyProfile } from '../components/employer-pages/onboarding/steps/CompanyProfileStep';
import type { RoleTemplate } from '../components/employer-pages/RoleTemplatePicker';

export type TraitWeightsPersist = {
  learning_velocity: number;
  ownership_follow_through: number;
  resilience: number;
  communication_confidence: number;
  relational_intelligence: number;
  motivational_fit: number;
};

/** Map UI company size values to DB check constraint on businesses.size */
export function mapCompanySizeToDb(uiSize: string): '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null {
  const map: Record<string, '1-10' | '11-50' | '51-200' | '201-500' | '500+'> = {
    '1-10': '1-10',
    '11-50': '11-50',
    '51-200': '51-200',
    '201-500': '201-500',
    '201-1000': '500+',
    '1000+': '500+',
    '500+': '500+',
  };
  return map[uiSize] ?? null;
}

export async function setProfileRoleEmployer(client: SupabaseClient, userId: string): Promise<void> {
  const { error } = await client.from('profiles').update({ role: 'employer' }).eq('id', userId);
  if (error) console.warn('[CMe] profiles role update failed:', error.message);
}

export async function insertEmployerBusiness(
  client: SupabaseClient,
  ownerId: string,
  profile: CompanyProfile,
): Promise<string | null> {
  const size = mapCompanySizeToDb(profile.companySize);
  if (!size) {
    console.warn('[CMe] Invalid company size for DB:', profile.companySize);
    return null;
  }

  const { data, error } = await client
    .from('businesses')
    .insert({
      owner_id: ownerId,
      name: profile.companyName.trim(),
      industry: profile.industry.trim(),
      size,
    })
    .select('id')
    .single();

  if (error) {
    console.warn('[CMe] businesses insert failed:', error.message);
    return null;
  }
  return data.id;
}

function templateSlug(template: RoleTemplate | null | undefined): string | null {
  if (!template?.id) return null;
  return String(template.id);
}

export async function supersedeActiveEmployerWeightings(
  client: SupabaseClient,
  businessId: string,
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await client
    .from('employer_trait_weightings')
    .update({ superseded_at: now })
    .eq('business_id', businessId)
    .is('superseded_at', null);

  if (error) console.warn('[CMe] supersede weightings failed:', error.message);
}

export async function insertEmployerTraitWeightings(
  client: SupabaseClient,
  businessId: string,
  weights: TraitWeightsPersist,
  selectedTemplate: RoleTemplate | null | undefined,
): Promise<void> {
  const { error } = await client.from('employer_trait_weightings').insert({
    business_id: businessId,
    role_template: templateSlug(selectedTemplate),
    learning_velocity: weights.learning_velocity,
    ownership_follow_through: weights.ownership_follow_through,
    resilience: weights.resilience,
    communication_confidence: weights.communication_confidence,
    relational_intelligence: weights.relational_intelligence,
    motivational_fit: weights.motivational_fit,
  });

  if (error) console.warn('[CMe] employer_trait_weightings insert failed:', error.message);
}

const WEIGHTING_COLUMNS =
  'learning_velocity, ownership_follow_through, resilience, communication_confidence, relational_intelligence, motivational_fit';

export async function fetchActiveEmployerTraitWeightings(
  client: SupabaseClient,
  businessId: string,
): Promise<TraitWeightsPersist | null> {
  const { data, error } = await client
    .from('employer_trait_weightings')
    .select(WEIGHTING_COLUMNS)
    .eq('business_id', businessId)
    .is('superseded_at', null)
    .maybeSingle();

  if (error) {
    console.warn('[CMe] employer_trait_weightings fetch failed:', error.message);
    return null;
  }
  if (!data) return null;
  return {
    learning_velocity: data.learning_velocity,
    ownership_follow_through: data.ownership_follow_through,
    resilience: data.resilience,
    communication_confidence: data.communication_confidence,
    relational_intelligence: data.relational_intelligence,
    motivational_fit: data.motivational_fit,
  };
}

export async function upsertActiveEmployerTraitWeightings(
  client: SupabaseClient,
  businessId: string,
  weights: TraitWeightsPersist,
  options?: { roleTemplateSlug?: string | null },
): Promise<boolean> {
  const columns = {
    learning_velocity: weights.learning_velocity,
    ownership_follow_through: weights.ownership_follow_through,
    resilience: weights.resilience,
    communication_confidence: weights.communication_confidence,
    relational_intelligence: weights.relational_intelligence,
    motivational_fit: weights.motivational_fit,
  };

  const { data: existing, error: selErr } = await client
    .from('employer_trait_weightings')
    .select('id')
    .eq('business_id', businessId)
    .is('superseded_at', null)
    .maybeSingle();

  if (selErr) {
    console.warn('[CMe] employer_trait_weightings select for upsert failed:', selErr.message);
    return false;
  }

  if (existing?.id) {
    const { error } = await client.from('employer_trait_weightings').update(columns).eq('id', existing.id);
    if (error) {
      console.warn('[CMe] employer_trait_weightings update failed:', error.message);
      return false;
    }
    return true;
  }

  const slug = options?.roleTemplateSlug ?? null;
  const { error } = await client.from('employer_trait_weightings').insert({
    business_id: businessId,
    role_template: slug,
    ...columns,
  });
  if (error) {
    console.warn('[CMe] employer_trait_weightings insert (upsert) failed:', error.message);
    return false;
  }
  return true;
}

export async function markEmployerProfileOnboardingComplete(
  client: SupabaseClient,
  userId: string,
): Promise<void> {
  const { error } = await client
    .from('profiles')
    .update({ onboarding_complete: true, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) console.warn('[CMe] profiles onboarding_complete failed:', error.message);
}
