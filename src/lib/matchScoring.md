# Match Scoring Implementation — Spec 5

## Overview

This module implements CMe's core match scoring algorithm that computes compatibility between candidates and employers based on dimensional trait alignment, not just work history.

## Files Created

### 1. `/src/lib/matchScoring.ts`

**Purpose:** Core match scoring logic that computes weighted alignment scores.

**Key Functions:**

- `computeMatchScore(candidateScores, employerWeights)` — Main scoring algorithm
  - Takes candidate dimension scores (0-100) and employer trait weights (sum to 100)
  - Returns match score (0-100) with breakdown by dimension
  - Normalizes weights if they don't sum to 100

- `normalize(value, min, max)` — Normalizes values to 0-100 range

- `getTraitHealth(score)` — Categorizes trait scores into 'high', 'medium', 'low'
  - High: score ≥ 75 (green dot)
  - Medium: 50–74 (amber dot)
  - Low: < 50 (red dot)

- `getTraitHealthColor(health)` — Returns Tailwind color class for health indicators

- `mockEdgeFunctionTrigger(candidateId, employerId)` — Simulates Supabase Edge Function
  - In production: triggers when `intake_status = 'complete'`
  - Fetches candidate trait scores from `candidate_profiles`
  - Fetches employer weights from `employer_trait_weightings`
  - Computes match score
  - Creates/updates `engagements` row with `match_score`

**Dimension Mapping:**

Employer dimensions → Candidate traits:
- `logicalReasoning` → `cognitiveAgility`
- `communicationConfidence` → `communication`
- `relationalIntelligence` → `collaboration`
- `motivationalFit` → `ownership`
- `adaptability` → `adaptability`
- `culturalAutonomy` → `decisionMaking`

**Algorithm:**

```
matchScore = Σ(candidate_dimension_score × employer_weight) / 100

Example:
- Candidate has cognitiveAgility = 91
- Employer weights logicalReasoning at 20%
- Contribution to match score: 91 × 20 / 100 = 18.2

Sum all dimensions → final match score (0-100)
```

## Components Updated

### 2. `/components/employer-pages/CandidatesPage.tsx`

**Changes:**

- Updated `CandidateCard` to display match score with **%** suffix (e.g., "94%")
- Added **Trait Health Indicators** section:
  - Shows up to 6 colored dots representing candidate trait scores
  - Green dot (≥75), amber dot (50-74), red dot (<50)
  - Hover tooltip displays dimension name and exact score
  - Uses `getTraitHealthColor()` from match scoring library

**Visual Layout:**

```
┌─────────────────────┐
│ [Drag]      94% ← Match score with %
│ Jordan Chen
│ Senior Product Designer
│ San Francisco, CA
│ [Ownership] [Learning Speed]
│ Trait Health: ● ● ● ● ● ● ← Colored dots
├─────────────────────┤
│ [✓ Hired badge]
└─────────────────────┘
```

## Pages Created

### 3. `/src/pages/AssessmentLink.tsx`

**Purpose:** Public cold-start flow for candidates invited by employers.

**Flow:**

1. **Landing Screen:**
   - Shows employer name and role title
   - Explains CMe's trait-based matching approach
   - Benefits: trait matching, privacy, 15-min assessment
   - CTA: "Start Assessment"

2. **Intake Screen:**
   - Reuses existing `IntakeFlowPage` component
   - Shows employer context in header banner
   - Candidate completes all 8 sections

3. **Completion Screen:**
   - Success confirmation
   - Shows computed match score (if available)
   - Next steps for candidate
   - Powered by CMe branding

**URL Pattern (production):**

```
/assessment/:token
```

**Token Contents (signed JWT):**
- Candidate email
- Employer ID
- Role template ID
- Expiration timestamp

**Backend Flow (production):**

```
1. Candidate completes intake → intake_status = 'complete'
2. Supabase Edge Function triggers automatically
3. Edge Function:
   - Fetches candidate_profiles.trait_scores
   - Fetches employer_trait_weightings
   - Calls computeMatchScore()
   - Inserts/updates engagements row with match_score
4. Engagement record created:
   - candidate_id
   - employer_id
   - stage: 'newSignals'
   - match_score: 94.2
```

## Navigation

### 4. `/App.tsx`

**Changes:**

- Added "Assessment Link" tab to main navigation
- Updated `handleNavigateToPath()` to support 'assessment' route
- Renders `<AssessmentLink />` when tab is active

### 5. `/components/OverviewScreen.tsx`

**Changes:**

- Added "Assessment Link Demo" option to path selection modal
- Allows users to preview cold-start candidate flow from landing page

## Production Implementation Notes

### Supabase Edge Function

**File:** `supabase/functions/compute-match-score/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { computeMatchScore } from './matchScoring.ts'; // Copy from /src/lib

serve(async (req) => {
  const { candidateId, employerId } = await req.json();
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // 1. Fetch candidate trait scores
  const { data: candidate } = await supabase
    .from('candidate_profiles')
    .select('trait_scores')
    .eq('candidate_id', candidateId)
    .single();
  
  // 2. Fetch employer weights
  const { data: employer } = await supabase
    .from('employer_trait_weightings')
    .select('*')
    .eq('employer_id', employerId)
    .single();
  
  // 3. Compute match score
  const result = computeMatchScore(
    candidate.trait_scores,
    {
      logicalReasoning: employer.logical_reasoning,
      communicationConfidence: employer.communication_confidence,
      relationalIntelligence: employer.relational_intelligence,
      motivationalFit: employer.motivational_fit,
      adaptability: employer.adaptability,
      culturalAutonomy: employer.cultural_autonomy,
    }
  );
  
  // 4. Update engagement with match score
  await supabase
    .from('engagements')
    .upsert({
      candidate_id: candidateId,
      employer_id: employerId,
      match_score: result.matchScore,
      stage: 'newSignals',
    });
  
  return new Response(JSON.stringify({ success: true, matchScore: result.matchScore }));
});
```

### Database Trigger

**SQL Migration:**

```sql
-- Trigger Edge Function when intake is completed
CREATE OR REPLACE FUNCTION trigger_match_scoring()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.intake_status = 'complete' AND OLD.intake_status != 'complete' THEN
    PERFORM pg_notify('compute_match_score', json_build_object(
      'candidate_id', NEW.candidate_id,
      'employer_id', NEW.employer_id -- From assessment link token
    )::text);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_intake_complete
  AFTER UPDATE ON candidate_profiles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_match_scoring();
```

## Testing

### Mock Data

All mock candidates in `EmployerScreen.tsx` now include `traitScores`:

```typescript
{
  id: 1,
  name: 'Jordan Chen',
  score: 94,
  traitScores: {
    adaptability: 85,
    decisionMaking: 90,
    communication: 88,
    cognitiveAgility: 92,
    collaboration: 87,
    ownership: 94,
  },
}
```

### Utility Functions

- `generateMockCandidateScores()` — Creates random candidate scores for testing
- `generateMockEmployerWeights()` — Creates random employer weights that sum to 100

## Design Alignment

- **Color Palette:**
  - High trait health: `#10B981` (green)
  - Medium trait health: `#F59E0B` (amber)
  - Low trait health: `#EF4444` (red)
  - Primary accent: `#7DBBFF` (blue)

- **Border Radius:**
  - Cards: `14px`
  - Modals: `24px`
  - Buttons: `14px`
  - Health indicator dots: `rounded-full`

- **Typography:**
  - Match score: `text-base font-semibold`
  - Trait health label: `text-xs text-[#9CA3AF]`
  - Tooltips: `text-xs text-white bg-[#111827]`

## Future Enhancements

1. **Real-time Scoring:** WebSocket updates when match scores are computed
2. **Score History:** Track how match scores evolve as candidate profile updates
3. **Threshold Alerts:** Notify employer when candidate exceeds minimum match threshold
4. **Dimension Breakdown:** Show employer which specific dimensions contributed most to match
5. **A/B Testing:** Test different weighting algorithms to optimize match accuracy
6. **Calibration:** Adjust scoring based on historical hiring outcomes

## Related Specs

- **Spec 1:** `candidate_profiles` and `engagements` tables
- **Spec 4:** Intake scoring (produces trait_scores consumed by match scoring)
- **Spec 5:** This spec — match scoring computation and assessment links

---

**Last Updated:** March 14, 2026  
**Author:** CMe Platform Team  
**Status:** ✅ Complete
