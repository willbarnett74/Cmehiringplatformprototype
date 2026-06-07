import type { SupabaseClient } from '@supabase/supabase-js';

function randomToken(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

export async function createEmployerRole(
  supabase: SupabaseClient,
  businessId: string,
  fields: {
    title: string;
    location?: string;
    role_type?: string;
    description?: string;
  },
): Promise<{ id: string; assessment_link_token: string }> {
  const token = randomToken();
  const { data, error } = await supabase
    .from('roles')
    .insert({
      business_id: businessId,
      title: fields.title.trim(),
      location: fields.location?.trim() ?? null,
      role_type: fields.role_type?.trim() ?? 'Full-time',
      description: fields.description?.trim() ?? null,
      status: 'open',
      assessment_link_token: token,
    })
    .select('id, assessment_link_token')
    .single();
  if (error) throw error;
  return data as { id: string; assessment_link_token: string };
}

export function assessmentLinkUrl(token: string): string {
  if (typeof window === 'undefined') return `/assessment-link?token=${token}`;
  return `${window.location.origin}/assessment-link?token=${token}`;
}

export async function fetchOpenRoles(supabase: SupabaseClient, businessId: string) {
  const { data, error } = await supabase
    .from('roles')
    .select('id, title, location, role_type, status, assessment_link_token, created_at')
    .eq('business_id', businessId)
    .eq('status', 'open')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
