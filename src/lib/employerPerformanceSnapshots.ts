import type { SupabaseClient } from '@supabase/supabase-js';
import type { PerformanceSnapshotData } from '../components/employer-pages/PerformanceSnapshotForm';

export async function insertPerformanceSnapshot(
  supabase: SupabaseClient,
  engagementId: string,
  snapshotDay: 30 | 90,
  data: PerformanceSnapshotData,
): Promise<void> {
  const bandMap: Record<string, string> = {
    Top: 'top',
    Mid: 'mid',
    Low: 'low',
    top: 'top',
    mid: 'mid',
    low: 'low',
  };
  const performance_band = bandMap[data.performance_band] ?? 'mid';
  const ratingMap = { top: 5, mid: 3, low: 2 };

  const { error } = await supabase.from('performance_snapshots').insert({
    engagement_id: engagementId,
    snapshot_day: snapshotDay,
    performance_band,
    performance_rating: ratingMap[performance_band as keyof typeof ratingMap] ?? 3,
    learning_velocity_rating: data.learning_velocity_rating,
    ownership_rating: data.ownership_rating,
    resilience_rating: data.resilience_rating,
    communication_confidence_rating: data.communication_confidence_rating,
    relational_intelligence_rating: data.relational_intelligence_rating,
    motivational_fit_rating: data.motivational_fit_rating,
    notes: data.notes ?? null,
  });
  if (error) throw error;
}

export async function fetchPerformanceSnapshotsForBusiness(
  supabase: SupabaseClient,
  businessId: string,
): Promise<
  Array<{
    engagement_id: string;
    snapshot_day: number;
    performance_band: string | null;
    performance_rating: number | null;
  }>
> {
  const { data: engs } = await supabase.from('engagements').select('id').eq('business_id', businessId);
  const ids = (engs ?? []).map((e) => e.id as string);
  if (!ids.length) return [];

  const { data, error } = await supabase
    .from('performance_snapshots')
    .select('engagement_id, snapshot_day, performance_band, performance_rating')
    .in('engagement_id', ids);
  if (error) {
    const missingColumn =
      error.code === '42703' ||
      /column/i.test(error.message) ||
      /does not exist/i.test(error.message);
    if (missingColumn) {
      console.warn('[CMe] performance_snapshots columns missing; apply employer portal migration.');
      return [];
    }
    console.warn('[CMe] performance_snapshots fetch:', error.message);
    return [];
  }
  return (data ?? []) as Array<{
    engagement_id: string;
    snapshot_day: number;
    performance_band: string | null;
    performance_rating: number | null;
  }>;
}
