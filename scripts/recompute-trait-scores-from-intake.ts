/**
 * Recompute candidate_profiles trait columns from intake_responses using the same
 * aggregation as the app (intakeScoreAggregate). Requires service role key.
 *
 * Usage: `npm run recompute-traits`
 * Env: VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import {
  emptyDimensionInputs,
  ingestPayloadIntoBuckets,
  dimensionScoresFromInputs,
  computeMotivationalFitAverage,
} from '../src/utils/intakeScoreAggregate.ts';

function loadEnvLocal(): Record<string, string> {
  const p = resolve(process.cwd(), '.env.local');
  if (!existsSync(p)) return {};
  const out: Record<string, string> = {};
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const s = line.trim();
    if (!s || s.startsWith('#')) continue;
    const i = s.indexOf('=');
    if (i === -1) continue;
    const k = s.slice(0, i).trim();
    let v = s.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[k] = v;
  }
  return out;
}

const env = { ...process.env, ...loadEnvLocal() } as Record<string, string | undefined>;
const url = env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (.env.local).');
  process.exit(1);
}

const supabase = createClient(url, key);
const { data: profiles, error: e1 } = await supabase.from('candidate_profiles').select('id').eq('intake_status', 'complete');
if (e1) {
  console.error(e1.message);
  process.exit(1);
}

for (const row of profiles ?? []) {
  const { data: resRows, error: e2 } = await supabase
    .from('intake_responses')
    .select('response_value')
    .eq('candidate_id', row.id);
  if (e2) {
    console.error(row.id, e2.message);
    continue;
  }
  const inputs = emptyDimensionInputs();
  for (const r of resRows ?? []) {
    if (!r.response_value) continue;
    try {
      ingestPayloadIntoBuckets(JSON.parse(r.response_value as string) as Record<string, unknown>, inputs);
    } catch {
      /* skip bad row */
    }
  }
  const scores = dimensionScoresFromInputs(inputs);
  const motivational_fit = computeMotivationalFitAverage(scores);
  const { error: e3 } = await supabase
    .from('candidate_profiles')
    .update({
      ...scores,
      motivational_fit,
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id);
  if (e3) console.error('update', row.id, e3.message);
  else console.log('updated', row.id, scores);
}
