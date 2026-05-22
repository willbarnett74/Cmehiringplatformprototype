import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  Briefcase,
  ChevronDown,
  Clock,
  DollarSign,
  ExternalLink,
  Filter,
  Mic,
  Play,
  RotateCcw,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';

import type { DimensionScores } from '../../../utils/intakeScoring';
import type { DimensionKey } from '../../../utils/intakeScoreAggregate';
import {
  ALL_EXPLORE_REGIONS,
  ALL_EXPLORE_ROLE_TYPES,
  ALL_EXPLORE_SIZES,
  buildExplorePrimaryTraitBarKeys,
  DEFAULT_EXPLORE_FILTERS,
  EXPLORE_DIMENSION_LABELS,
  EXPLORE_MOTIVATIONAL_DIMENSION_KEYS,
  exploreFilterActiveCount,
  exploreIndustryPassesFilters,
  exploreRoleInterestCompoundKey,
  expressExploreRoleInterest,
  fetchCandidateExploreRoleInterests,
  withdrawExploreRoleInterest,
  type ExploreFilters,
  type ExploreIndustry,
  type ExploreLearningLink,
  type ExploreResourceType,
  type ExploreRoleInterestRecord,
  type ExploreSampleRole,
  matchTier,
  resolveExploreRolePresentation,
  roleCardMatchColor,
  scoreForDimension,
  signalLabelFromMatch,
  traitAlignmentLabel,
} from '../../../lib/exploreIndustries';
import { isSupabaseConfigured, supabase } from '../../../lib/supabaseClient';
import { companyInitials, hashCompanyTone } from '../opportunities/messengerUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';

// ─── Sparkline ──────────────────────────────────────────────────────────────

function Sparkline({
  values,
  width,
  height,
  color,
}: {
  values: number[];
  width: number;
  height: number;
  color: string;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = width;
  const h = height;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / span) * h * 0.85 - height * 0.05;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const last = pts[pts.length - 1];
  const [lx, ly] = last.split(',').map(Number);
  return (
    <svg width={w} height={h} className="shrink-0 overflow-visible" aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts.join(' ')}
      />
      <circle cx={lx} cy={ly} r={2} fill={color} />
    </svg>
  );
}

// ─── Section chrome ───────────────────────────────────────────────────────────

function SectionHead({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
        {children}
      </span>
      <div className="h-px flex-1 bg-black/[0.08]" />
    </div>
  );
}

function learnIcon(type: ExploreResourceType) {
  const cl = 'h-[11px] w-[11px] text-[#7dbbff]';
  switch (type) {
    case 'article':
      return <BookOpen className={cl} strokeWidth={2} />;
    case 'course':
      return <Zap className={cl} strokeWidth={2} />;
    case 'podcast':
      return <Mic className={cl} strokeWidth={2} />;
    case 'video':
      return <Play className={cl} strokeWidth={2} />;
    default:
      return <BookOpen className={cl} strokeWidth={2} />;
  }
}

function learnTypeUpper(type: ExploreResourceType): string {
  switch (type) {
    case 'article':
      return 'ARTICLE';
    case 'course':
      return 'COURSE';
    case 'podcast':
      return 'PODCAST';
    case 'video':
      return 'VIDEO';
    default:
      return 'LINK';
  }
}

type ExploreFocusRoleRequest = {
  industryId: string;
  companyName: string;
  roleTitle: string;
};

function ExploreYourSavesPanel({
  signedIn,
  savedIndustries,
  roleInterests,
  industryNameById,
  busyInterestKey,
  onSelectIndustry,
  onUnsaveIndustry,
  onOpenRoleInterest,
  onRemoveRoleInterest,
}: {
  signedIn: boolean;
  savedIndustries: ExploreIndustry[];
  roleInterests: ExploreRoleInterestRecord[];
  industryNameById: Map<string, string>;
  busyInterestKey: string | null;
  onSelectIndustry: (industryId: string) => void;
  onUnsaveIndustry: (industryId: string) => void;
  onOpenRoleInterest: (interest: ExploreRoleInterestRecord) => void;
  onRemoveRoleInterest: (interest: ExploreRoleInterestRecord) => void;
}) {
  const hasSaves = savedIndustries.length > 0 || roleInterests.length > 0;
  const [open, setOpen] = useState(false);

  return (
    <div
      className="shrink-0 border-b border-[#FDE68A]/80"
      style={{ background: 'linear-gradient(180deg, #FFFBEB 0%, #FFF 100%)' }}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 px-[18px] py-2.5 text-left transition-colors hover:bg-[#FFFBEB]/80"
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-center gap-2">
          <Bookmark className="h-3.5 w-3.5 shrink-0 text-[#D97706]" strokeWidth={2} />
          <p className="text-[13px] font-semibold text-[#111827]">Your saves</p>
          {signedIn && hasSaves ? (
            <span className="font-dashboard-mono text-[10px] text-[#92400E]">
              {savedIndustries.length} · {roleInterests.length}
            </span>
          ) : null}
        </div>
        <ChevronDown
          className="h-3.5 w-3.5 shrink-0 text-[#92400E]/70 transition-transform duration-200"
          strokeWidth={2}
          style={{ transform: open ? 'rotate(180deg)' : undefined }}
        />
      </button>

      {open ? (
        <div className="border-t border-[#FDE68A]/50 px-[18px] pb-3 pt-2.5">
          {!signedIn ? (
            <p className="text-[11px] leading-relaxed text-[#9CA3AF]">
              Sign in to bookmark industries and track interest in companies — your shortlist is saved to your profile.
            </p>
          ) : !hasSaves ? (
            <p className="text-[11px] leading-relaxed text-[#9CA3AF]">
              Bookmark an industry or star a role below to build your shortlist here.
            </p>
          ) : (
            <div className="max-h-[220px] space-y-3 overflow-y-auto pr-0.5">
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Saved industries ({savedIndustries.length})
            </p>
            {savedIndustries.length === 0 ? (
              <p className="text-[11px] text-[#C4C4CC]">None yet</p>
            ) : (
              <ul className="space-y-1">
                {savedIndustries.map((ind) => {
                  const tier = matchTier(ind.base_match);
                  return (
                    <li key={ind.id}>
                      <div className="flex items-center gap-2 rounded-md border border-black/[0.06] bg-[#fafafa] py-1.5 pl-2 pr-1">
                        <button
                          type="button"
                          onClick={() => onSelectIndustry(ind.id)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p className="truncate text-[12px] font-medium text-[#111827]">{ind.name}</p>
                          <p className="font-dashboard-mono text-[10px] text-[#9CA3AF]">
                            {ind.base_match}/100 · {tier.label}
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => onUnsaveIndustry(ind.id)}
                          className="shrink-0 rounded p-1 text-[#F59E0B] hover:bg-black/[0.04]"
                          aria-label={`Remove ${ind.name} from saved industries`}
                        >
                          <Bookmark className="h-3 w-3" strokeWidth={2} fill="#F59E0B" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Interest in companies ({roleInterests.length})
            </p>
            {roleInterests.length === 0 ? (
              <p className="text-[11px] text-[#C4C4CC]">None yet — star a role to signal interest</p>
            ) : (
              <ul className="space-y-1">
                {roleInterests.map((interest) => {
                  const key = exploreRoleInterestCompoundKey(
                    interest.industry_id,
                    interest.company_name,
                    interest.role_title,
                  );
                  const tone = hashCompanyTone(interest.company_name);
                  const busy = busyInterestKey === key;
                  const industryLabel = industryNameById.get(interest.industry_id) ?? 'Explore industry';
                  return (
                    <li key={key}>
                      <div className="flex items-start gap-2 rounded-md border border-black/[0.06] bg-[#fafafa] py-1.5 pl-2 pr-1">
                        <div
                          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold"
                          style={{ background: tone.bg, color: tone.fg }}
                          aria-hidden
                        >
                          {companyInitials(interest.company_name)}
                        </div>
                        <button
                          type="button"
                          onClick={() => onOpenRoleInterest(interest)}
                          className="min-w-0 flex-1 text-left"
                        >
                          <p className="truncate text-[12px] font-medium text-[#111827]">{interest.role_title}</p>
                          <p className="truncate text-[11px] text-[#6B7280]">{interest.company_name}</p>
                          <p className="truncate text-[10px] text-[#9CA3AF]">
                            {industryLabel}
                            {interest.location ? ` · ${interest.location}` : ''}
                          </p>
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onRemoveRoleInterest(interest)}
                          className="shrink-0 rounded p-1 text-[#F59E0B] hover:bg-black/[0.04] disabled:opacity-50"
                          aria-label={`Remove interest in ${interest.role_title} at ${interest.company_name}`}
                        >
                          <Star className="h-3 w-3" strokeWidth={2} fill="#F59E0B" color="#F59E0B" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ─── Props ──────────────────────────────────────────────────────────────────

export type ExploreIndustriesWorkspaceProps = {
  industries: ExploreIndustry[];
  traitScores: DimensionScores | null;
  savedIndustryIds: Set<string>;
  onToggleSave: (industryId: string, nextSaved: boolean) => void | Promise<void>;
  loading?: boolean;
  /** When set with `userId`, role interest stars persist and can notify matching employers on CMe. */
  candidateProfileId?: string | null;
  userId?: string | null;
  onInterestToast?: (message: string) => void;
};

export function ExploreIndustriesWorkspace({
  industries,
  traitScores,
  savedIndustryIds,
  onToggleSave,
  loading = false,
  candidateProfileId = null,
  userId = null,
  onInterestToast,
}: ExploreIndustriesWorkspaceProps) {
  const [filters, setFilters] = useState<ExploreFilters>({ ...DEFAULT_EXPLORE_FILTERS });
  const [moreOpen, setMoreOpen] = useState(false);
  const [roleInterests, setRoleInterests] = useState<ExploreRoleInterestRecord[]>([]);
  const [busyInterestKey, setBusyInterestKey] = useState<string | null>(null);
  const [focusRoleRequest, setFocusRoleRequest] = useState<ExploreFocusRoleRequest | null>(null);

  const industryById = useMemo(() => new Map(industries.map((i) => [i.id, i])), [industries]);
  const industryNameById = useMemo(
    () => new Map(industries.map((i) => [i.id, i.name])),
    [industries],
  );
  const roleInterestKeys = useMemo(
    () =>
      new Set(
        roleInterests.map((r) =>
          exploreRoleInterestCompoundKey(r.industry_id, r.company_name, r.role_title),
        ),
      ),
    [roleInterests],
  );
  const savedIndustriesList = useMemo(
    () =>
      industries
        .filter((i) => savedIndustryIds.has(i.id))
        .sort((a, b) => a.display_rank - b.display_rank),
    [industries, savedIndustryIds],
  );
  const signedIn = Boolean(candidateProfileId && isSupabaseConfigured && supabase);

  const filtered = useMemo(
    () => industries.filter((i) => exploreIndustryPassesFilters(i, filters)).sort((a, b) => a.display_rank - b.display_rank),
    [industries, filters],
  );

  const [selectedId, setSelectedId] = useState<string | null>(() => filtered[0]?.id ?? industries[0]?.id ?? null);

  useEffect(() => {
    if (!filtered.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filtered.some((i) => i.id === selectedId)) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selected = filtered.find((i) => i.id === selectedId) ?? filtered[0] ?? null;

  const activeCount = exploreFilterActiveCount(filters);

  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_EXPLORE_FILTERS });
  }, []);

  const toggleSize = (size: string) => {
    setFilters((f) => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter((s) => s !== size) : [...f.sizes, size],
    }));
  };

  const toggleRoleType = (rt: string) => {
    setFilters((f) => ({
      ...f,
      roleTypes: f.roleTypes.includes(rt) ? f.roleTypes.filter((x) => x !== rt) : [...f.roleTypes, rt],
    }));
  };

  const moreFiltersHint =
    !moreOpen && (filters.region !== 'Anywhere' || filters.sizes.length > 0 || filters.roleTypes.length > 0);

  useEffect(() => {
    if (!candidateProfileId || !isSupabaseConfigured || !supabase) {
      setRoleInterests([]);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const rows = await fetchCandidateExploreRoleInterests(supabase, candidateProfileId);
        if (!cancelled) setRoleInterests(rows);
      } catch (e) {
        console.warn('[CMe] explore role interests load failed', e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [candidateProfileId]);

  const handleToggleRoleInterest = useCallback(
    async (industry: ExploreIndustry, role: ExploreSampleRole) => {
      const key = exploreRoleInterestCompoundKey(industry.id, role.company_name, role.role_title);
      if (!candidateProfileId || !userId || !isSupabaseConfigured || !supabase) {
        onInterestToast?.('Sign in to show interest — hiring teams on CMe are notified when your profile matches.');
        return;
      }
      const isOn = roleInterestKeys.has(key);
      setBusyInterestKey(key);
      try {
        if (isOn) {
          await withdrawExploreRoleInterest(supabase, candidateProfileId, industry.id, role);
          setRoleInterests((prev) =>
            prev.filter(
              (r) =>
                !(
                  r.industry_id === industry.id &&
                  r.company_name === role.company_name &&
                  r.role_title === role.role_title
                ),
            ),
          );
          onInterestToast?.('Interest removed for this role.');
        } else {
          const result = await expressExploreRoleInterest(supabase, {
            candidateId: candidateProfileId,
            userId,
            industryId: industry.id,
            industryName: industry.name,
            role,
          });
          if (result === 'inserted') {
            setRoleInterests((prev) => [
              {
                industry_id: industry.id,
                company_name: role.company_name,
                role_title: role.role_title,
                location: role.location ?? '',
                created_at: new Date().toISOString(),
              },
              ...prev,
            ]);
          }
          onInterestToast?.(
            result === 'already'
              ? 'You already showed interest in this role.'
              : 'Interest saved. If this company uses CMe with the same name, they’ll see your signal.',
          );
        }
      } catch (e) {
        console.warn('[CMe] explore role interest toggle', e);
        onInterestToast?.('Could not update interest. Please try again.');
      } finally {
        setBusyInterestKey(null);
      }
    },
    [candidateProfileId, userId, onInterestToast, roleInterestKeys],
  );

  const handleOpenRoleInterest = useCallback(
    (interest: ExploreRoleInterestRecord) => {
      setSelectedId(interest.industry_id);
      setFocusRoleRequest({
        industryId: interest.industry_id,
        companyName: interest.company_name,
        roleTitle: interest.role_title,
      });
    },
    [],
  );

  const handleRemoveRoleInterestFromSaves = useCallback(
    (interest: ExploreRoleInterestRecord) => {
      const industry = industryById.get(interest.industry_id);
      if (!industry) return;
      const role =
        industry.sample_roles.find(
          (r) => r.company_name === interest.company_name && r.role_title === interest.role_title,
        ) ?? {
          id: null,
          role_id: null,
          company_name: interest.company_name,
          role_title: interest.role_title,
          location: interest.location,
          display_match: 0,
          sort_order: 0,
          about_role: null,
          responsibilities: [],
          requirements: [],
          linked_role: null,
        };
      void handleToggleRoleInterest(industry, role);
    },
    [industryById, handleToggleRoleInterest],
  );

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden bg-white font-dashboard text-[#111827] antialiased">
      {/* Left rail — saves pinned top; filters + list scroll below */}
      <div className="flex h-full min-h-0 w-[440px] shrink-0 flex-col overflow-hidden border-r border-black/[0.08] bg-white">
        <ExploreYourSavesPanel
          signedIn={signedIn}
          savedIndustries={savedIndustriesList}
          roleInterests={roleInterests}
          industryNameById={industryNameById}
          busyInterestKey={busyInterestKey}
          onSelectIndustry={setSelectedId}
          onUnsaveIndustry={(id) => void onToggleSave(id, false)}
          onOpenRoleInterest={handleOpenRoleInterest}
          onRemoveRoleInterest={handleRemoveRoleInterestFromSaves}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {/* Filters */}
        <div className="shrink-0 border-b border-black/[0.06] bg-[#fafafa] px-[18px] pb-3 pt-[14px]">
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Filter className="h-3 w-3 text-[#6B7280]" strokeWidth={2} />
              <span className="text-[11.5px] font-semibold text-[#374151]">Filters</span>
              {activeCount > 0 ? (
                <span
                  className="px-1.5 py-px text-[10px] font-semibold text-white"
                  style={{ borderRadius: 999, background: '#7dbbff' }}
                >
                  {activeCount}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              disabled={activeCount === 0}
              onClick={resetFilters}
              className={`flex items-center gap-1 text-[10.5px] ${activeCount === 0 ? 'cursor-default text-[#D1D5DB]' : 'text-[#6B7280] hover:text-[#111827]'}`}
            >
              <RotateCcw className="h-2.5 w-2.5" strokeWidth={2} />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[10.5px] text-[#6B7280]">Min fit</span>
                <span className="font-dashboard-mono text-[10.5px] font-semibold text-[#7dbbff]">
                  {filters.minFit}+
                </span>
              </div>
              <input
                type="range"
                className="cme-range"
                min={0}
                max={100}
                step={5}
                value={filters.minFit}
                onChange={(e) => setFilters((f) => ({ ...f, minFit: Number(e.target.value) }))}
              />
            </div>
            <div>
              <p className="mb-1 text-[10.5px] text-[#6B7280]">Growth</p>
              <div className="flex gap-0.5">
                {(['any', '15+', '20+'] as const).map((g) => {
                  const active = filters.growth === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFilters((f) => ({ ...f, growth: g }))}
                      className="px-2 py-0.5 text-[10.5px] transition-colors"
                      style={{
                        borderRadius: 4,
                        border: active ? '1px solid #7dbbff' : '1px solid rgba(0,0,0,0.10)',
                        background: active ? 'rgba(125,187,255,0.08)' : '#fff',
                        color: active ? '#7dbbff' : '#6B7280',
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {g === 'any' ? 'Any' : g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMoreOpen((o) => !o)}
            className="mt-2.5 flex items-center gap-1 text-[10.5px] text-[#6B7280] transition-colors hover:text-[#374151]"
          >
            <ChevronDown
              className="h-2.5 w-2.5 transition-transform duration-150"
              strokeWidth={2}
              style={{ transform: moreOpen ? 'rotate(180deg)' : undefined }}
            />
            {moreOpen ? 'Fewer filters' : 'More filters'}
            {moreFiltersHint ? (
              <span className="font-medium text-[#7dbbff]"> · active</span>
            ) : null}
          </button>

          {moreOpen ? (
            <div className="mt-3 flex flex-col gap-2.5 border-t border-black/[0.06] pt-3">
              <div>
                <label className="mb-1 block text-[10.5px] text-[#6B7280]">Region</label>
                <select
                  value={filters.region}
                  onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value }))}
                  className="w-full rounded border border-black/[0.11] bg-white py-1 pl-2 pr-7 text-[11.5px] text-[#111827]"
                  style={{ paddingTop: 5, paddingBottom: 5 }}
                >
                  {ALL_EXPLORE_REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="mb-1 text-[10.5px] text-[#6B7280]">Company size</p>
                <div className="flex flex-wrap gap-1">
                  {ALL_EXPLORE_SIZES.map((size) => {
                    const active = filters.sizes.includes(size);
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => toggleSize(size)}
                        className="px-2 py-0.5 text-[10.5px] transition-colors"
                        style={{
                          borderRadius: 999,
                          border: active ? '1px solid #7dbbff' : '1px solid rgba(0,0,0,0.10)',
                          background: active ? 'rgba(125,187,255,0.08)' : '#fff',
                          color: active ? '#7dbbff' : '#6B7280',
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-1 text-[10.5px] text-[#6B7280]">Role type</p>
                <div className="flex flex-wrap gap-1">
                  {ALL_EXPLORE_ROLE_TYPES.map((rt) => {
                    const active = filters.roleTypes.includes(rt);
                    return (
                      <button
                        key={rt}
                        type="button"
                        onClick={() => toggleRoleType(rt)}
                        className="px-2 py-0.5 text-[10.5px] transition-colors"
                        style={{
                          borderRadius: 999,
                          border: active ? '1px solid #7dbbff' : '1px solid rgba(0,0,0,0.10)',
                          background: active ? 'rgba(125,187,255,0.08)' : '#fff',
                          color: active ? '#7dbbff' : '#6B7280',
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {rt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Industries list header */}
        <div className="flex shrink-0 items-baseline justify-between px-[22px] pb-2 pt-[14px]">
          <div>
            <p className="text-[13.5px] font-semibold tracking-[-0.01em] text-[#111827]">Industries for you</p>
            <p className="text-[11px] text-[#9CA3AF]">Ranked by trait fit · refreshed today</p>
          </div>
          <span className="font-dashboard-mono text-[11px] text-[#6B7280]">{filtered.length} matched</span>
        </div>

        {/* Cards */}
        <div className="px-[18px] pb-4">
          {loading ? (
            <p className="py-10 text-center text-[13px] text-[#6B7280]">Loading industries…</p>
          ) : !filtered.length ? (
            <div className="px-4 py-[42px] text-center">
              <p className="text-[13px] text-[#374151]">No industries match your filters</p>
              <p className="mt-1 text-[11.5px] text-[#9CA3AF]">Try lowering the min fit or widening the region.</p>
            </div>
          ) : (
            filtered.map((ind, idx) => {
              const tier = matchTier(ind.base_match);
              const active = selectedId === ind.id;
              const saved = savedIndustryIds.has(ind.id);
              const chipKeys = ind.trait_highlights.slice(0, 3);

              return (
                <div
                  key={ind.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (!active) setSelectedId(ind.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (!active) setSelectedId(ind.id);
                    }
                  }}
                  className={`relative mb-3 cursor-pointer px-[18px] pb-4 pt-[18px] transition-[transform,box-shadow,border-color] duration-150 ${
                    active ? '' : 'hover:-translate-y-px'
                  }`}
                  style={{
                    borderRadius: 12,
                    background: '#fff',
                    border: active ? '1px solid #7dbbff' : '1px solid rgba(0,0,0,0.08)',
                    boxShadow: active
                      ? '0 0 0 3px rgba(125,187,255,0.12), 0 6px 18px -10px rgba(0,0,0,0.12)'
                      : '0 1px 0 rgba(0,0,0,0.02)',
                  }}
                >
                  <span
                    className="absolute right-3.5 top-3.5 font-dashboard-mono text-[10px] text-[#C4C4CC]"
                    aria-hidden
                  >
                    #{idx + 1}
                  </span>
                  <div className="mb-3 flex justify-between gap-3 pr-7">
                    <div className="min-w-0">
                      <h3 className="text-[15.5px] font-semibold leading-snug tracking-[-0.015em] text-[#111827]">
                        {ind.name}
                      </h3>
                      <p className="mt-0.5 text-[11.5px] font-medium" style={{ color: tier.color }}>
                        {tier.label}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end">
                      <div className="flex items-baseline gap-0.5">
                        <span className="font-dashboard-mono text-2xl font-semibold" style={{ color: tier.color }}>
                          {ind.base_match}
                        </span>
                        <span className="font-dashboard-mono text-[11px] text-[#C4C4CC]">/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3.5 h-1 overflow-hidden rounded-full bg-[#F1F2F4]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${ind.base_match}%`, background: tier.color }}
                    />
                  </div>

                  <div className="mb-3.5 grid grid-cols-3 gap-0">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
                        Open roles
                      </p>
                      <p className="mt-0.5 font-dashboard-mono text-[15px] font-semibold text-[#111827]">
                        {ind.open_roles}
                      </p>
                    </div>
                    <div className="border-l border-black/[0.06] pl-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Growth</p>
                      <div className="mt-0.5 flex items-center gap-1">
                        <span className="font-dashboard-mono text-[15px] font-semibold text-[#10B981]">
                          {ind.growth_label}
                        </span>
                        <Sparkline values={ind.sparkline_values} width={36} height={14} color="#10B981" />
                      </div>
                    </div>
                    <div className="border-l border-black/[0.06] pl-2">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Salary</p>
                      <p className="mt-0.5 font-dashboard-mono text-[13px] font-semibold text-[#111827]">
                        {ind.salary_band}
                      </p>
                    </div>
                  </div>

                  <div className="mb-2.5 flex flex-wrap gap-1.5">
                    {chipKeys.map((h) => (
                      <span
                        key={h.dimension_key}
                        className="rounded-full bg-[#F4F5F7] px-2.5 py-0.5 text-[11px] text-[#374151]"
                      >
                        {EXPLORE_DIMENSION_LABELS[h.dimension_key]}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-black/[0.06] pt-2.5">
                    <span
                      className={`flex items-center gap-1 text-[11.5px] font-medium ${active ? 'text-[#7dbbff]' : 'text-[#6B7280]'}`}
                    >
                      {active ? 'Viewing details' : 'View details'}
                      <ArrowRight className={`h-3 w-3 ${active ? 'text-[#7dbbff]' : 'text-[#9CA3AF]'}`} strokeWidth={2} />
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void onToggleSave(ind.id, !saved);
                      }}
                      className="rounded p-0.5 text-[#C4C4CC] transition-colors hover:text-[#F59E0B]"
                      aria-label={saved ? 'Remove saved industry' : 'Save industry'}
                    >
                      <Bookmark
                        className="h-3.5 w-3.5"
                        strokeWidth={2}
                        fill={saved ? '#F59E0B' : 'none'}
                        color={saved ? '#F59E0B' : 'currentColor'}
                      />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        </div>
      </div>

      {/* Detail — full width of column (no max-width) so gray doesn’t frame a narrow band */}
      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#f4f4f5] px-5 pb-12 pt-5 sm:px-6 lg:px-7 lg:pb-14 lg:pt-6">
        {!selected ? (
          <div className="flex h-full items-center justify-center text-[13px] text-[#6B7280]">
            Select an industry to see details
          </div>
        ) : (
          <ExploreIndustryDetail
            key={selected.id}
            industry={selected}
            traitScores={traitScores}
            candidateProfileId={candidateProfileId}
            userId={userId}
            roleInterestKeys={roleInterestKeys}
            busyInterestKey={busyInterestKey}
            onToggleRoleInterest={handleToggleRoleInterest}
            focusRoleRequest={focusRoleRequest}
            onFocusRoleHandled={() => setFocusRoleRequest(null)}
          />
        )}
      </div>
    </div>
  );
}

function ExploreTraitBarRow({
  dimensionKey,
  traitScores,
}: {
  dimensionKey: DimensionKey;
  traitScores: DimensionScores | null;
}) {
  const score = scoreForDimension(traitScores, dimensionKey);
  const align = traitAlignmentLabel(score);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-[#374151]">{EXPLORE_DIMENSION_LABELS[dimensionKey]}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10.5px] font-semibold capitalize text-[#7dbbff]">{align}</span>
          <span className="font-dashboard-mono text-[11px] font-medium text-[#7dbbff]">{score}</span>
        </div>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-[#F1F2F4]">
        <div className="h-full rounded-full bg-[#7dbbff] transition-all" style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function ExploreRoleDetailModalBody({
  role,
  industryName,
  displayMatch,
  modalStarred,
  modalBusy,
  candidateProfileId,
  userId,
  onToggleInterest,
}: {
  role: ExploreSampleRole;
  industryName: string;
  displayMatch: number;
  modalStarred: boolean;
  modalBusy: boolean;
  candidateProfileId: string | null;
  userId: string | null;
  onToggleInterest: () => void;
}) {
  const detail = resolveExploreRolePresentation(role, industryName);
  const tone = hashCompanyTone(detail.companyName);

  return (
    <>
      <DialogHeader className="space-y-0 border-b border-black/[0.06] px-6 pb-5 pt-6 pr-14 text-left">
        <div className="flex gap-3.5">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center text-xs font-semibold"
            style={{ borderRadius: 8, background: tone.bg, color: tone.fg }}
          >
            {companyInitials(detail.companyName)}
          </div>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-left text-[17px] font-semibold leading-snug tracking-[-0.02em] text-[#111827]">
              {detail.title}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-left text-[13px] leading-snug text-[#6B7280]">
              {detail.companyName} · {detail.location}
            </DialogDescription>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[10.5px] font-medium text-[#374151]">
                {detail.roleType}
              </span>
              {detail.seniority ? (
                <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[10.5px] font-medium text-[#374151]">
                  {detail.seniority}
                </span>
              ) : null}
              <span className="rounded-md bg-[#F3F4F6] px-2 py-0.5 text-[10.5px] font-medium text-[#374151]">
                {industryName}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span
                className="font-dashboard-mono text-[26px] font-semibold leading-none tracking-[-0.03em]"
                style={{ color: roleCardMatchColor(displayMatch) }}
              >
                {displayMatch}
              </span>
              <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#9CA3AF]">
                Trait match
              </span>
            </div>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-5 px-6 py-5">
        {detail.isLinkedDemoRole ? (
          <p className="rounded-lg border border-[rgba(125,187,255,0.35)] bg-[rgba(125,187,255,0.06)] px-3 py-2 text-[11px] leading-relaxed text-[#374151]">
            This is a demo role stored in CMe — the same posting employers manage in their portal when they use
            the platform.
          </p>
        ) : null}

        <section>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
            About this role
          </h3>
          <p className="text-[13px] leading-[1.65] text-[#374151]">{detail.about}</p>
        </section>

        <section>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
            What you&apos;d do
          </h3>
          <ul className="space-y-1.5">
            {detail.responsibilities.map((item) => (
              <li key={item} className="flex gap-2 text-[13px] leading-snug text-[#374151]">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#7dbbff]" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
            What we&apos;re looking for
          </h3>
          <ul className="space-y-1.5">
            {detail.requirements.map((item) => (
              <li key={item} className="flex gap-2 text-[13px] leading-snug text-[#374151]">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#9CA3AF]" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-black/[0.06] bg-[#fafafa] px-4 py-3.5">
          <h3 className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
            <Briefcase className="h-3 w-3" strokeWidth={2} />
            About {detail.companyName}
          </h3>
          <p className="text-[13px] leading-[1.6] text-[#374151]">
            {detail.companyBlurb ??
              `${detail.companyName} operates in ${detail.companyIndustry ?? industryName}. This example posting helps you understand the kind of work and expectations before you signal interest.`}
          </p>
          {detail.companySize ? (
            <p className="mt-2 text-[11px] text-[#9CA3AF]">
              Typical team size · {detail.companySize}
            </p>
          ) : null}
        </section>

        <div className="border-t border-black/[0.06] pt-1">
          <p className="mb-4 text-[12px] leading-relaxed text-[#6B7280]">
            Showing interest tells hiring teams on CMe you&apos;d like to be considered for similar roles — they can
            see your profile when your traits align.
          </p>
          <button
            type="button"
            disabled={modalBusy}
            onClick={onToggleInterest}
            className="flex w-full items-center justify-center gap-2 border py-3.5 text-[13px] font-semibold transition-colors disabled:opacity-60"
            style={{
              borderRadius: 10,
              borderColor: modalStarred ? 'rgba(245,158,11,0.45)' : 'rgba(125,187,255,0.45)',
              background: modalStarred ? 'rgba(245,158,11,0.08)' : 'rgba(125,187,255,0.08)',
              color: modalStarred ? '#D97706' : '#7dbbff',
            }}
          >
            <Star
              className="h-5 w-5"
              strokeWidth={2}
              fill={modalStarred ? 'currentColor' : 'none'}
              aria-hidden
            />
            {modalBusy ? 'Saving…' : modalStarred ? 'Interest shown — tap to remove' : 'Show interest to company'}
          </button>
          {!candidateProfileId || !userId ? (
            <p className="mt-3 text-center text-[11px] text-[#9CA3AF]">
              Sign in with a saved profile to record interest.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}

// ─── Detail column (subcomponent for fade key) ──────────────────────────────

function ExploreIndustryDetail({
  industry: ind,
  traitScores,
  candidateProfileId = null,
  userId = null,
  roleInterestKeys,
  busyInterestKey,
  onToggleRoleInterest,
  focusRoleRequest = null,
  onFocusRoleHandled,
}: {
  industry: ExploreIndustry;
  traitScores: DimensionScores | null;
  candidateProfileId?: string | null;
  userId?: string | null;
  roleInterestKeys: Set<string>;
  busyInterestKey: string | null;
  onToggleRoleInterest: (industry: ExploreIndustry, role: ExploreSampleRole) => void | Promise<void>;
  focusRoleRequest?: ExploreFocusRoleRequest | null;
  onFocusRoleHandled?: () => void;
}) {
  const tier = matchTier(ind.base_match);
  const signal = signalLabelFromMatch(ind.base_match);
  const primaryTraitKeys = useMemo(() => buildExplorePrimaryTraitBarKeys(ind.trait_highlights), [ind.trait_highlights]);
  const [roleModal, setRoleModal] = useState<ExploreSampleRole | null>(null);

  useEffect(() => {
    if (!focusRoleRequest || focusRoleRequest.industryId !== ind.id) return;
    const role = ind.sample_roles.find(
      (r) =>
        r.company_name === focusRoleRequest.companyName && r.role_title === focusRoleRequest.roleTitle,
    );
    if (role) setRoleModal(role);
    onFocusRoleHandled?.();
  }, [focusRoleRequest, ind.id, ind.sample_roles, onFocusRoleHandled]);

  const modalInterestKey = roleModal
    ? exploreRoleInterestCompoundKey(ind.id, roleModal.company_name, roleModal.role_title)
    : null;
  const modalStarred = modalInterestKey ? roleInterestKeys.has(modalInterestKey) : false;
  const modalBusy = modalInterestKey != null && busyInterestKey === modalInterestKey;

  return (
    <div className="animate-explore-detail-fade w-full min-w-0 max-w-none">
      {/* Hero */}
      <div
        className="mb-5 border border-black/[0.08] px-6 py-5"
        style={{
          borderRadius: 10,
          background:
            'linear-gradient(180deg, rgba(125,187,255,0.10) 0%, rgba(125,187,255,0) 100%), #fff',
        }}
      >
        <div className="mb-3.5 flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Industry</span>
              <span
                className="text-[10px] font-semibold"
                style={{
                  color: tier.color,
                  background: `${tier.color}1A`,
                  borderRadius: 999,
                  padding: '2px 8px',
                }}
              >
                {signal}
              </span>
            </div>
            <h2 className="text-[26px] font-semibold leading-tight tracking-[-0.025em] text-[#111827]">{ind.name}</h2>
            <p className="mt-2 max-w-[72ch] text-[13.5px] leading-relaxed text-[#6B7280]">{ind.blurb}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5 lg:pt-1">
            <div className="flex items-baseline gap-0.5">
              <span className="font-dashboard-mono text-[38px] font-semibold tracking-[-0.03em]" style={{ color: tier.color }}>
                {ind.base_match}
              </span>
              <span className="font-dashboard-mono text-sm text-[#C4C4CC]">/100</span>
            </div>
            <p className="text-[11.5px] font-semibold" style={{ color: tier.color }}>
              {tier.label}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 border-t border-black/[0.07] pt-4 md:grid-cols-4">
          {(
            [
              {
                icon: Briefcase,
                eyebrow: 'Open roles',
                val: String(ind.open_roles),
                sub: `${ind.hiring_now} hiring now`,
                spark: false,
              },
              {
                icon: TrendingUp,
                eyebrow: 'Growth',
                val: ind.growth_label,
                sub: '12-mo signal',
                spark: true,
              },
              {
                icon: DollarSign,
                eyebrow: 'Salary range',
                val: ind.salary_band,
                sub: ind.salary_band_sub ?? '—',
                spark: false,
              },
              {
                icon: Users,
                eyebrow: 'Avg team',
                val: ind.team_size_typical,
                sub: `${ind.employers_count} employers`,
                spark: false,
              },
            ] as const
          ).map((cell, i, arr) => (
            <div
              key={cell.eyebrow}
              className={`flex gap-2 px-4 py-0 ${i < arr.length - 1 ? 'border-r border-black/[0.06]' : ''}`}
            >
              <cell.icon className="mt-0.5 h-[11px] w-[11px] shrink-0 text-[#9CA3AF]" strokeWidth={2} />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">{cell.eyebrow}</p>
                <div className="mt-1 flex items-center gap-2">
                  <p className="font-dashboard-mono text-lg font-semibold tracking-[-0.02em] text-[#111827]">
                    {cell.val}
                  </p>
                  {cell.spark ? (
                    <Sparkline values={ind.sparkline_values} width={56} height={18} color="#10B981" />
                  ) : null}
                </div>
                <p className="mt-0.5 text-[11px] text-[#9CA3AF]">{cell.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why this fits — narrative + motivational (left); primary dimensions incl. resilience & communication (right, full row height) */}
      <div className="mb-7 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-stretch lg:gap-8">
        <div className="flex min-h-0 flex-col">
          <SectionHead>Why this fits you</SectionHead>
          <p className="text-[13.5px] leading-relaxed text-[#374151]">{ind.why_narrative}</p>
          <div className="mt-6 border-t border-black/[0.06] pt-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Motivational profile
            </p>
            <div className="flex flex-col gap-3">
              {EXPLORE_MOTIVATIONAL_DIMENSION_KEYS.map((key) => (
                <ExploreTraitBarRow key={key} dimensionKey={key} traitScores={traitScores} />
              ))}
            </div>
            {!traitScores ? (
              <p className="mt-3 text-[11px] text-[#9CA3AF]">
                Complete your intake to see scores for these dimensions.
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex h-full min-h-0 min-w-0 flex-col">
          <SectionHead>Core profile dimensions</SectionHead>
          <div className="flex min-h-[140px] flex-1 flex-col justify-between">
            {primaryTraitKeys.map((key) => (
              <ExploreTraitBarRow key={key} dimensionKey={key} traitScores={traitScores} />
            ))}
          </div>
          {!traitScores ? (
            <p className="mt-4 shrink-0 border-t border-black/[0.06] pt-3 text-[11px] text-[#9CA3AF]">
              Complete your intake to see accurate trait alignment scores here.
            </p>
          ) : null}
        </div>
      </div>

      {/* Top roles */}
      <div className="mb-8">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Top roles in {ind.name}
            </span>
            <div className="h-px min-w-[24px] flex-1 bg-black/[0.08]" />
          </div>
          <button
            type="button"
            className="flex shrink-0 items-center gap-1 text-[11.5px] font-medium text-[#7dbbff]"
            onClick={() => {}}
          >
            Browse all {ind.open_roles}
            <ArrowRight className="h-3 w-3" strokeWidth={2} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {ind.sample_roles.map((r) => {
            const tone = hashCompanyTone(r.company_name);
            const fitC = roleCardMatchColor(r.display_match);
            const interestKey = exploreRoleInterestCompoundKey(ind.id, r.company_name, r.role_title);
            const starred = roleInterestKeys.has(interestKey);
            const cardKey = r.id ?? `${r.company_name}-${r.role_title}-${r.sort_order}`;
            return (
              <div
                key={cardKey}
                role="button"
                tabIndex={0}
                onClick={() => setRoleModal(r)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setRoleModal(r);
                  }
                }}
                className="flex cursor-pointer gap-3 border border-black/[0.08] bg-white py-3 pl-3.5 pr-3.5 transition-colors duration-150 hover:border-[rgba(125,187,255,0.4)] hover:bg-[#fafafa]"
                style={{ borderRadius: 8 }}
              >
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center text-[11px] font-semibold"
                  style={{ borderRadius: 7, background: tone.bg, color: tone.fg }}
                >
                  {companyInitials(r.company_name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[#111827]">{r.role_title}</p>
                  <p className="truncate text-[11.5px] text-[#6B7280]">
                    {r.company_name} · {r.location}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end justify-center">
                  <p className="font-dashboard-mono text-[13px] font-semibold leading-none" style={{ color: fitC }}>
                    {r.display_match}
                  </p>
                  <div className="mt-0.5 flex items-center gap-0.5">
                    <p className="text-[10px] text-[#9CA3AF]">match</p>
                    {starred ? (
                      <Star
                        className="h-2.5 w-2.5 text-[#F59E0B]"
                        strokeWidth={2}
                        fill="currentColor"
                        aria-label="Interest shown"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={roleModal != null} onOpenChange={(open) => !open && setRoleModal(null)}>
        <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto border border-black/[0.08] bg-white p-0 font-dashboard shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] sm:max-w-[540px]">
          {roleModal ? (
            <ExploreRoleDetailModalBody
              role={roleModal}
              industryName={ind.name}
              displayMatch={roleModal.display_match}
              modalStarred={modalStarred}
              modalBusy={modalBusy}
              candidateProfileId={candidateProfileId}
              userId={userId}
              onToggleInterest={() => void onToggleRoleInterest(ind, roleModal)}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Learn */}
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Read up on {ind.short_name}
            </span>
            <div className="h-px min-w-[24px] flex-1 bg-black/[0.08]" />
          </div>
          <span className="shrink-0 text-[11px] text-[#9CA3AF]">Curated learning resources</span>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {ind.learning_links.map((link: ExploreLearningLink) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col gap-2 border border-black/[0.08] bg-white px-4 py-3.5 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-[rgba(125,187,255,0.4)] hover:shadow-[0_8px_20px_-10px_rgba(0,0,0,0.12)]"
              style={{ borderRadius: 8 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-[22px] w-[22px] items-center justify-center"
                    style={{ borderRadius: 5, background: 'rgba(125,187,255,0.10)' }}
                  >
                    {learnIcon(link.resource_type)}
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7dbbff]">
                    {learnTypeUpper(link.resource_type)}
                  </span>
                </div>
                <ExternalLink className="h-[11px] w-[11px] shrink-0 text-[#C4C4CC]" strokeWidth={2} />
              </div>
              <p className="text-[13px] font-medium leading-snug text-[#111827]">{link.title}</p>
              <div className="mt-auto flex items-center justify-between gap-2">
                <span className="text-[11.5px] text-[#6B7280]">{link.source_name}</span>
                <span className="flex items-center gap-1 font-dashboard-mono text-[10.5px] text-[#9CA3AF]">
                  <Clock className="h-2.5 w-2.5" strokeWidth={2} />
                  {link.meta}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
