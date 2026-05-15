import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Layers, Search, CheckCircle2,
  Compass,
  ChevronDown, ChevronUp,
} from 'lucide-react';

import {
  applicantOpportunitiesMockData,
} from '../../lib/applicantOpportunitiesMock';
import type { ApplicantOpportunity, EmployerLikeStage } from '../../lib/applicantOpportunitiesMock';
import { OpportunitiesMessenger } from './opportunities/OpportunitiesMessenger';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import {
  fetchApplicantOpportunities,
  insertCandidateEngagementMessage,
  upsertEngagementReadState,
  updateEngagementStageFromApplicant,
} from '../../lib/applicantEngagements';

// ─── Types ─────────────────────────────────────────────────────────────

type SubTab = 'opportunities' | 'explore';

interface Industry {
  id: string;
  name: string;
  matchPercent: number;
  description: string;
  whyYou: string;
  avgSalary: string;
  growth: string;
  openRoles: number;
  topTraits: string[];
  typicalRoles: { title: string; avgSalary: string; demand: 'High' | 'Medium' | 'Low' }[];
}

// ─── Data ──────────────────────────────────────────────────────────────

const initialOpportunitiesData = applicantOpportunitiesMockData;

const industries: Industry[] = [
  {
    id: 'saas',
    name: 'SaaS & Productivity Tools',
    matchPercent: 94,
    description: 'Companies building software-as-a-service products that help teams and individuals work more effectively. This space values design systems thinking, rapid iteration, and user-centric problem solving.',
    whyYou: 'Your strong ownership drive, problem-structuring approach, and preference for autonomy-driven environments align closely with how SaaS product teams operate. Your narrative highlights building clean solutions from ambiguity — a core need in this space.',
    avgSalary: '$145K–$195K',
    growth: '+18% YoY',
    openRoles: 342,
    topTraits: ['Problem Structuring', 'Ownership', 'Systems Thinking'],
    typicalRoles: [
      { title: 'Senior Product Designer', avgSalary: '$165K', demand: 'High' },
      { title: 'Design Systems Lead', avgSalary: '$185K', demand: 'High' },
      { title: 'UX Strategist', avgSalary: '$155K', demand: 'Medium' },
      { title: 'Product Design Manager', avgSalary: '$195K', demand: 'Medium' },
    ],
  },
  {
    id: 'fintech',
    name: 'Fintech & Financial Services',
    matchPercent: 88,
    description: 'Technology companies disrupting traditional financial services through digital banking, payments, lending, and investment platforms. High emphasis on trust, clarity, and complex information architecture.',
    whyYou: 'Your analytical framing and prioritization strengths map well to the complexity of financial interfaces. Fintech teams need designers who can distill complex flows into intuitive experiences — a pattern your narrative consistently demonstrates.',
    avgSalary: '$155K–$210K',
    growth: '+22% YoY',
    openRoles: 287,
    topTraits: ['Analytical Thinking', 'Communication', 'Attention to Detail'],
    typicalRoles: [
      { title: 'Product Designer – Payments', avgSalary: '$170K', demand: 'High' },
      { title: 'UX Lead – Consumer Banking', avgSalary: '$190K', demand: 'Medium' },
      { title: 'Design Lead – Risk & Compliance', avgSalary: '$180K', demand: 'Medium' },
      { title: 'Senior Interaction Designer', avgSalary: '$160K', demand: 'High' },
    ],
  },
  {
    id: 'healthtech',
    name: 'Health Tech & Digital Health',
    matchPercent: 82,
    description: 'Companies using technology to improve healthcare delivery, patient outcomes, and wellness. Mission-driven work with emphasis on accessibility, empathy, and regulatory awareness.',
    whyYou: 'Your research-first thinking and results orientation translate well into health tech where user research is critical and outcomes are measurable. The impact-visible nature of this work aligns with your motivational fit.',
    avgSalary: '$140K–$185K',
    growth: '+25% YoY',
    openRoles: 198,
    topTraits: ['Empathy', 'Research-Driven', 'Impact Orientation'],
    typicalRoles: [
      { title: 'Product Designer – Patient Experience', avgSalary: '$155K', demand: 'High' },
      { title: 'UX Researcher', avgSalary: '$145K', demand: 'High' },
      { title: 'Design Lead – Clinical Tools', avgSalary: '$175K', demand: 'Medium' },
      { title: 'Accessibility Designer', avgSalary: '$150K', demand: 'Low' },
    ],
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce & Marketplaces',
    matchPercent: 79,
    description: 'Platforms connecting buyers and sellers, from direct-to-consumer brands to multi-sided marketplaces. Fast-paced, data-heavy environment with strong A/B testing culture.',
    whyYou: 'Your experimental mindset and comfort with data-driven decision making are valued in e-commerce where every design choice is measurable. Your preference for fast-moving environments is a natural fit.',
    avgSalary: '$135K–$180K',
    growth: '+14% YoY',
    openRoles: 256,
    topTraits: ['Experimentation', 'Data Literacy', 'Speed'],
    typicalRoles: [
      { title: 'Product Designer – Conversion', avgSalary: '$160K', demand: 'High' },
      { title: 'Senior UX Designer – Marketplace', avgSalary: '$170K', demand: 'Medium' },
      { title: 'Growth Designer', avgSalary: '$155K', demand: 'High' },
      { title: 'Design Lead – Seller Tools', avgSalary: '$175K', demand: 'Low' },
    ],
  },
  {
    id: 'devtools',
    name: 'Developer Tools & Infrastructure',
    matchPercent: 91,
    description: 'Companies building tools, platforms, and infrastructure for software developers. Values technical empathy, information density management, and deep understanding of developer workflows.',
    whyYou: 'Your systems building strength and problem-structuring approach are exactly what developer tool companies look for. This space rewards designers who can handle complexity without oversimplifying — your narrative suggests this is your sweet spot.',
    avgSalary: '$155K–$205K',
    growth: '+20% YoY',
    openRoles: 156,
    topTraits: ['Systems Thinking', 'Technical Empathy', 'Problem Structuring'],
    typicalRoles: [
      { title: 'Product Designer – Developer Experience', avgSalary: '$175K', demand: 'High' },
      { title: 'Design Engineer', avgSalary: '$185K', demand: 'High' },
      { title: 'UX Lead – Platform', avgSalary: '$195K', demand: 'Medium' },
      { title: 'Design Systems Engineer', avgSalary: '$190K', demand: 'Medium' },
    ],
  },
];

export const exploreIndustriesMatchedCount = industries.length;

function nowMessageLabel(): string {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function industryMatchPercentColor(p: number): string {
  if (p >= 90) return '#22C55E';
  if (p >= 85) return '#3B82F6';
  if (p >= 80) return '#60A5FA';
  return '#F59E0B';
}

function growthBarWidthPercent(growthLabel: string): number {
  const n = parseInt(growthLabel.replace(/[^0-9-]/g, ''), 10);
  if (Number.isFinite(n) && n > 0) return Math.min(100, n * 4);
  return 40;
}

export type OpportunitiesEmbeddedMode = 'opportunities' | 'explore';

export type OpportunitiesPageProps = {
  /** When set, show only this tab (no sub-tab strip or Opportunities header). Used by applicant shell nav. */
  mode?: OpportunitiesEmbeddedMode;
  /** Select a specific opportunity from dashboard/notification context. */
  selectedOpportunityId?: string | null;
  /** Select a specific engagement-backed opportunity from dashboard/notification context. */
  selectedOpportunityEngagementId?: string | null;
  /** `candidate_profiles.id` for the signed-in user — loads real engagements when Supabase is configured. */
  candidateProfileId?: string | null;
  /** Increment (e.g. when user opens the Opportunities nav tab) to retry loading from Supabase. */
  opportunitiesRefreshKey?: number;
  /** Report live engagement count to the shell (nav badge / header). */
  onEngagementsCountChange?: (count: number) => void;
};

function subTabFromMode(mode: OpportunitiesEmbeddedMode | undefined): SubTab {
  if (mode === 'explore') return 'explore';
  return 'opportunities';
}

export function OpportunitiesPage({
  mode,
  selectedOpportunityId,
  selectedOpportunityEngagementId,
  candidateProfileId = null,
  onEngagementsCountChange,
  opportunitiesRefreshKey = 0,
}: OpportunitiesPageProps = {}) {
  const embedded = mode != null;
  const [activeTab, setActiveTab] = useState<SubTab>(() => subTabFromMode(mode));
  const [expandedIndustry, setExpandedIndustry] = useState<string | null>('saas');
  const [opportunities, setOpportunities] = useState<ApplicantOpportunity[]>(initialOpportunitiesData);
  const [opportunitiesSource, setOpportunitiesSource] = useState<'mock' | 'supabase'>('mock');
  const [opportunitiesLoadFailed, setOpportunitiesLoadFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(() =>
    String(selectedOpportunityId ?? initialOpportunitiesData[0]?.id ?? ''),
  );
  const [industrySort, setIndustrySort] = useState<'match' | 'growth' | 'roles'>('match');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const onEngagementsCountChangeRef = useRef(onEngagementsCountChange);
  onEngagementsCountChangeRef.current = onEngagementsCountChange;

  const usingLive =
    opportunitiesSource === 'supabase' &&
    isSupabaseConfigured &&
    !!supabase &&
    !!candidateProfileId &&
    !opportunitiesLoadFailed;

  const reloadFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !candidateProfileId) return;
    setOpportunitiesLoadFailed(false);
    try {
      const rows = await fetchApplicantOpportunities(supabase, candidateProfileId);
      setOpportunities(rows);
      setOpportunitiesSource('supabase');
      setOpportunitiesLoadFailed(false);
      onEngagementsCountChangeRef.current?.(rows.length);
    } catch (e) {
      console.warn('[CMe] Opportunities: could not load engagements', e);
      setOpportunitiesLoadFailed(true);
      setOpportunities([]);
      setOpportunitiesSource('supabase');
      onEngagementsCountChangeRef.current?.(0);
    }
  }, [candidateProfileId]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !candidateProfileId) {
      setOpportunities(initialOpportunitiesData);
      setOpportunitiesSource('mock');
      setOpportunitiesLoadFailed(false);
      onEngagementsCountChangeRef.current?.(initialOpportunitiesData.length);
      return;
    }
    void reloadFromSupabase();
  }, [candidateProfileId, reloadFromSupabase, opportunitiesRefreshKey]);

  useEffect(() => {
    if (mode == null) return;
    setActiveTab(subTabFromMode(mode));
  }, [mode]);

  useEffect(() => {
    if (!selectedOpportunityEngagementId) return;
    const opportunity = opportunities.find((x) => x.engagementId === selectedOpportunityEngagementId);
    if (opportunity) setSelectedId(opportunity.id);
  }, [opportunities, selectedOpportunityEngagementId]);

  useEffect(() => {
    if (selectedOpportunityId == null || selectedOpportunityId === '') return;
    const opportunity = opportunities.find((x) => x.id === selectedOpportunityId);
    if (opportunity) setSelectedId(opportunity.id);
  }, [opportunities, selectedOpportunityId]);

  useEffect(() => {
    if (opportunities.length === 0) return;
    if (!opportunities.some((o) => o.id === selectedId)) {
      setSelectedId(opportunities[0].id);
    }
  }, [opportunities, selectedId]);

  const showToast = (message: string) => setToast({ message, visible: true });

  useEffect(() => {
    if (toast.visible) {
      const t = setTimeout(() => setToast({ message: '', visible: false }), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const updateOpportunity = (id: string, updater: (opportunity: ApplicantOpportunity) => ApplicantOpportunity) => {
    setOpportunities((prev) => prev.map((opportunity) => (opportunity.id === id ? updater(opportunity) : opportunity)));
  };

  const handleThreadOpened = useCallback(
    (opportunity: ApplicantOpportunity) => {
      if (!usingLive || !supabase || !candidateProfileId) return;
      void upsertEngagementReadState(supabase, opportunity.engagementId, candidateProfileId).catch((e) =>
        console.warn('[CMe] read state', e),
      );
    },
    [usingLive, candidateProfileId],
  );

  const handleStagePersist = useCallback(
    (opportunity: ApplicantOpportunity, stage: EmployerLikeStage) => {
      if (!usingLive || !supabase) return;
      void updateEngagementStageFromApplicant(supabase, opportunity.engagementId, stage).catch((e) =>
        console.warn('[CMe] stage update', e),
      );
    },
    [usingLive],
  );

  const markOpportunityResponded = (
    opportunity: ApplicantOpportunity,
    body: string,
    options?: { question?: boolean; nextActionLabel?: string; toast?: string },
  ) => {
    const messageId = `msg-${opportunity.engagementId}-${Date.now()}`;
    const eventId = `evt-${opportunity.engagementId}-response-${Date.now()}`;
    updateOpportunity(opportunity.id, (current) => ({
      ...current,
      status: current.status === 'contacted' || current.status === 'discovered' ? 'responded' : current.status,
      unread: false,
      unreadMessages: 0,
      lastUpdate: 'Just now',
      applicantResponseState: options?.question ? 'asked-question' : 'interested',
      messages: [
        ...current.messages.map((msg) => ({ ...msg, read: true })),
        {
          id: messageId,
          sender: 'applicant',
          body,
          sentAt: nowMessageLabel(),
          read: true,
        },
      ],
      timeline: [
        ...current.timeline,
        {
          id: eventId,
          label: options?.question ? 'Question sent' : 'Responded',
          description: options?.question
            ? `You asked ${current.contact.name} for more context.`
            : `You replied to ${current.business.name}.`,
          happenedAt: 'Just now',
          type: 'response',
        },
      ],
      nextAction: {
        label: options?.nextActionLabel ?? 'Waiting on business follow-up',
        description: `${current.business.name} has your response and can follow up in this thread.`,
        ctaLabel: 'Send follow-up',
        state: 'reply',
      },
    }));
    showToast(options?.toast ?? `Message sent to ${opportunity.business.name}`);
  };

  const submitApplicantMessage = (
    opportunity: ApplicantOpportunity,
    body: string,
    options?: { question?: boolean; nextActionLabel?: string; toast?: string },
  ) => {
    if (usingLive && supabase && candidateProfileId) {
      void (async () => {
        try {
          await insertCandidateEngagementMessage(supabase, opportunity.engagementId, body);
          await upsertEngagementReadState(supabase, opportunity.engagementId, candidateProfileId);
          await reloadFromSupabase();
          showToast(options?.toast ?? `Message sent to ${opportunity.business.name}`);
        } catch (e) {
          console.warn('[CMe] send message', e);
          showToast('Could not save your message. Please try again.');
        }
      })();
      return;
    }
    markOpportunityResponded(opportunity, body, options);
  };

  const handlePrimaryAction = (opportunity: ApplicantOpportunity) => {
    if (opportunity.nextAction.state === 'manual') {
      showToast('Continue the conversation using the message box below.');
      return;
    }

    if (opportunity.nextAction.state === 'view-summary') {
      updateOpportunity(opportunity.id, (current) => ({
        ...current,
        saved: true,
        lastUpdate: 'Just now',
        nextAction: {
          label: 'Saved to your opportunities',
          description: 'CMe will keep this strong match visible while monitoring for business activity.',
          ctaLabel: 'Saved',
          state: 'view-summary',
        },
      }));
      showToast(`${opportunity.business.name} saved to your opportunities`);
      return;
    }

    if (opportunity.nextAction.state === 'schedule') {
      submitApplicantMessage(opportunity, 'Thanks, I am interested. Tuesday or Thursday afternoon works for me.', {
        nextActionLabel: 'Availability sent',
        toast: `Availability sent to ${opportunity.business.name}`,
      });
      return;
    }

    if (opportunity.nextAction.state === 'review-decision') {
      updateOpportunity(opportunity.id, (current) => ({
        ...current,
        unread: false,
        unreadMessages: 0,
        lastUpdate: 'Just now',
        nextAction: {
          label: 'Decision update reviewed',
          description: `${current.business.name}'s latest update has been marked as reviewed.`,
          ctaLabel: 'Send follow-up',
          state: 'reply',
        },
      }));
      showToast(`Reviewed ${opportunity.business.name}'s update`);
      return;
    }

    submitApplicantMessage(
      opportunity,
      `Hi ${opportunity.contact.name}, thanks for reaching out. I am interested in learning more about the ${opportunity.role.title} role.`,
      {
        toast: `Interest sent to ${opportunity.business.name}`,
      },
    );
  };

  const sortedIndustries = [...industries].sort((a, b) => {
    if (industrySort === 'match') return b.matchPercent - a.matchPercent;
    if (industrySort === 'roles') return b.openRoles - a.openRoles;
    return parseFloat(b.growth) - parseFloat(a.growth);
  });

  const embeddedFullBleedShell = embedded && (activeTab === 'opportunities' || activeTab === 'explore');

  const rootClass = embeddedFullBleedShell
    ? 'font-dashboard flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white text-[#111827] antialiased'
    : 'font-dashboard text-[#111827] antialiased';

  return (
    <div className={rootClass}>
      {!embedded ? (
      <div className="mb-6">
        <h1 className="text-2xl text-[#111827] font-semibold mb-2">Opportunities</h1>
        <p className="text-sm text-[#6B7280]">Explore industries, review opportunities, and connect with companies that match your profile</p>
      </div>
      ) : null}

      {!embedded ? (
        <div className="mb-6 inline-flex gap-1 border border-black/[0.08] bg-[#F9F9FA] p-1" style={{ borderRadius: '12px' }}>
          {([
            { key: 'opportunities' as SubTab, label: 'Opportunities', icon: Layers, count: opportunities.length },
            { key: 'explore' as SubTab, label: 'Explore Industries', icon: Compass, count: industries.length },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
              style={{ borderRadius: '10px' }}
            >
              <tab.icon className="h-4 w-4" strokeWidth={2} />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 text-xs font-semibold ${
                  activeTab === tab.key ? 'bg-[#7DBBFF] text-white' : 'bg-[#E5E7EB] text-[#6B7280]'
                }`}
                style={{ borderRadius: '6px' }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {activeTab === 'opportunities' ? (
        <div
          className={`flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${embedded ? '' : 'min-h-[560px]'}`}
        >
          <OpportunitiesMessenger
            opportunities={opportunities}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            updateOpportunity={updateOpportunity}
            onSendApplicantMessage={(opp, body) => submitApplicantMessage(opp, body)}
            onPrimaryAction={handlePrimaryAction}
            showToast={showToast}
            onThreadOpened={handleThreadOpened}
            onStagePersist={handleStagePersist}
            fullBleed={embedded && activeTab === 'opportunities'}
          />
        </div>
      ) : null}

      {/* ═══════════ EXPLORE INDUSTRIES TAB ═══════════ */}
      {activeTab === 'explore' && (
        <div
          className={
            embedded
              ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-white'
              : 'bg-white'
          }
        >
          <div className={embedded ? 'px-9 pb-12 pt-7' : undefined}>
          {embedded ? (
            <p className="text-sm text-[#6B7280] pb-4 mb-4 border-b border-[#EDEDED] leading-relaxed">
              Industries matched to your trait profile — where your strengths tend to have the most impact.
            </p>
          ) : (
            <div className="pb-4 mb-4 border-b border-[#EDEDED]">
              <p className="text-sm text-[#111827] font-medium mb-1">Industries matched to your trait profile</p>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Based on your profile, these are sectors where similar people often thrive — focused on fit, not only job titles.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <p className="text-sm text-[#6B7280]">
              <span className="font-semibold text-[#111827]">{industries.length}</span> industries matched
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-[#9CA3AF]">Sort</span>
              {(['match', 'growth', 'roles'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setIndustrySort(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    industrySort === s ? 'bg-[#F3F4F6] text-[#111827]' : 'text-[#9CA3AF] hover:text-[#6B7280]'
                  }`}
                >
                  {s === 'match' ? 'Best match' : s === 'growth' ? 'Growth' : 'Open roles'}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-[#EDEDED]">
            {sortedIndustries.map((industry) => {
              const isExpanded = expandedIndustry === industry.id;
              const matchColor = industryMatchPercentColor(industry.matchPercent);
              const barW = growthBarWidthPercent(industry.growth);
              return (
                <div key={industry.id} className="border-b border-[#EDEDED] last:border-b-0">
                  <button
                    type="button"
                    onClick={() => setExpandedIndustry(isExpanded ? null : industry.id)}
                    className="w-full py-4 text-left hover:bg-[#FAFAFA]/80 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <h3 className="text-sm font-semibold text-[#111827]">{industry.name}</h3>
                          <span className="font-dashboard-mono text-sm font-semibold tabular-nums" style={{ color: matchColor }}>
                            {industry.matchPercent}%
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {industry.topTraits.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[11px] text-[#6B7280] px-2 py-0.5 rounded-full border border-[#E5E7EB] bg-[#FAFAFA]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <div className="flex flex-col items-end gap-1 text-right text-[11px] text-[#9CA3AF] sm:text-xs">
                          <div>
                            {industry.openRoles} roles · <span className="text-[#22C55E]">{industry.growth}</span>
                          </div>
                          <div className="w-14 sm:w-16 h-1 rounded-full bg-[#F3F4F6] overflow-hidden">
                            <div className="h-full rounded-full bg-[#22C55E]" style={{ width: `${barW}%` }} />
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-[#9CA3AF] shrink-0" strokeWidth={2} />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[#9CA3AF] shrink-0" strokeWidth={2} />
                        )}
                      </div>
                    </div>
                  </button>

                  {isExpanded ? (
                    <div className="pb-6 pt-0 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-[#EDEDED]">
                      <div className="md:col-span-2 pt-5">
                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF] mb-2">Why this fits</p>
                        <p className="text-sm text-[#6B7280] leading-relaxed">{industry.whyYou}</p>

                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF] mt-6 mb-2">Typical roles</p>
                        <div className="border-t border-[#EDEDED] divide-y divide-[#EDEDED]">
                          {industry.typicalRoles.map((role) => (
                            <div key={role.title} className="py-2.5 flex items-start justify-between gap-4 text-sm">
                              <span className="text-[#111827] font-medium">{role.title}</span>
                              <span className="shrink-0 font-dashboard-mono tabular-nums text-[#9CA3AF]">{role.avgSalary}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-5 md:border-l md:border-[#EDEDED] md:pl-8">
                        <p className="text-[10px] tracking-[0.12em] uppercase text-[#9CA3AF] mb-3">At a glance</p>
                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between gap-4">
                            <dt className="text-[#9CA3AF]">Salary</dt>
                            <dd className="text-right font-dashboard-mono font-semibold text-[#111827]">{industry.avgSalary}</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-[#9CA3AF]">Growth</dt>
                            <dd className="text-right font-dashboard-mono font-semibold text-[#111827]">{industry.growth}</dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-[#9CA3AF]">Roles</dt>
                            <dd className="text-right font-dashboard-mono font-semibold tabular-nums text-[#111827]">{industry.openRoles}</dd>
                          </div>
                        </dl>
                        <button
                          type="button"
                          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7BB9FA] text-white hover:bg-[#6aabef] transition-colors text-sm font-medium rounded-md"
                        >
                          <Search className="w-4 h-4" strokeWidth={2} />
                          Browse roles
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-50 animate-[slideUp_0.3s_ease-out]">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#111827] text-white shadow-xl" style={{ borderRadius: '12px' }}>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" strokeWidth={2} />
            <span className="text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ApplicantOpportunitiesPanel(
  props: Pick<
    OpportunitiesPageProps,
    | 'selectedOpportunityId'
    | 'selectedOpportunityEngagementId'
    | 'candidateProfileId'
    | 'onEngagementsCountChange'
    | 'opportunitiesRefreshKey'
  >,
) {
  return <OpportunitiesPage mode="opportunities" {...props} />;
}

export function ApplicantExploreIndustriesPanel() {
  return <OpportunitiesPage mode="explore" />;
}
