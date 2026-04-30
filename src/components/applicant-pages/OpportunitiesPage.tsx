import { useState, useEffect } from 'react';
import {
  Clock, TrendingUp, Send,
  Layers, Search, CheckCircle2,
  MessageCircle, Video, Phone, Bookmark, Compass,
  ChevronDown, ChevronUp, Building2,
} from 'lucide-react';

import {
  applicantLifecycleConfig,
  applicantOpportunitiesMockData,
} from '../../lib/applicantOpportunitiesMock';
import type { ApplicantOpportunity } from '../../lib/applicantOpportunitiesMock';

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

// ─── Flat list helpers (handoff / HTML reference) ────────────────────────

function rowInitials(companyName: string): string {
  const parts = companyName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return companyName.slice(0, 2).toUpperCase() || '—';
}

function matchAccent(score: number): { color: string; bar: string } {
  if (score >= 85) return { color: '#22C55E', bar: '#22C55E' };
  if (score >= 70) return { color: '#3B82F6', bar: '#3B82F6' };
  return { color: '#F59E0B', bar: '#F59E0B' };
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

function nowMessageLabel(): string {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const OPPORTUNITY_FILTER_ORDER = [
  'all',
  'contacted',
  'responded',
  'interviewing',
  'decision',
  'discovered',
  'hired',
  'rejected',
] as const;
type OpportunityFilterStage = (typeof OPPORTUNITY_FILTER_ORDER)[number];

function OpportunityDetail({
  opportunity,
  chatInput,
  onChatInputChange,
  onSend,
  onPrimaryAction,
  onAskQuestion,
}: {
  opportunity: ApplicantOpportunity;
  chatInput: string;
  onChatInputChange: (value: string) => void;
  onSend: () => void;
  onPrimaryAction: () => void;
  onAskQuestion: () => void;
}) {
  const config = applicantLifecycleConfig[opportunity.status];
  const accent = matchAccent(opportunity.matchScore);
  const hasMessages = opportunity.messages.length > 0;

  return (
    <section className="overflow-hidden border border-[#E5E7EB] bg-white" style={{ borderRadius: 14 }}>
      <div className="border-b border-[#EDEDED] p-5">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{ color: config.color, backgroundColor: config.bg }}
              >
                {config.label}
              </span>
              {opportunity.unread ? (
                <span className="inline-flex items-center rounded-full bg-[#EF4444]/10 px-2 py-0.5 text-[11px] font-semibold text-[#EF4444]">
                  Unread
                </span>
              ) : null}
            </div>
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-[#111827]">
              {opportunity.business.name} reached out about {opportunity.role.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6B7280]">{opportunity.business.intro}</p>
          </div>
          <div className="shrink-0 text-left sm:text-right">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#9CA3AF]">Match</p>
            <p className="font-dashboard-mono text-3xl font-semibold tabular-nums" style={{ color: accent.color }}>
              {opportunity.matchScore}
              <span className="text-sm font-normal text-[#9CA3AF]">/100</span>
            </p>
            <div className="mt-2 h-1 w-24 overflow-hidden rounded-full bg-[#F3F4F6] sm:ml-auto">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(100, opportunity.matchScore)}%`, backgroundColor: accent.bar }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-md bg-[#FAFAFA] p-3">
            <p className="mb-1 text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">Role</p>
            <p className="font-medium text-[#111827]">{opportunity.role.title}</p>
            <p className="mt-0.5 text-xs text-[#6B7280]">
              {opportunity.role.location} · {opportunity.role.employmentType}
            </p>
          </div>
          <div className="rounded-md bg-[#FAFAFA] p-3">
            <p className="mb-1 text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">Business</p>
            <p className="font-medium text-[#111827]">{opportunity.business.industry}</p>
            <p className="mt-0.5 text-xs text-[#6B7280]">{opportunity.business.size} employees</p>
          </div>
          <div className="rounded-md bg-[#FAFAFA] p-3">
            <p className="mb-1 text-[10px] uppercase tracking-[0.1em] text-[#9CA3AF]">Contact</p>
            <p className="font-medium text-[#111827]">{opportunity.contact.name}</p>
            <p className="mt-0.5 text-xs text-[#6B7280]">{opportunity.contact.title}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
        <div className="p-5">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Why this matches you</p>
            <div className="grid gap-3">
              {opportunity.whyMatches.map((reason, index) => (
                <div key={reason} className="flex gap-3">
                  <span className="mt-0.5 font-dashboard-mono text-[11px] text-[#C4C4CC]">{index + 1}</span>
                  <p className="text-sm leading-relaxed text-[#374151]">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Message thread</p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="rounded-md border border-transparent p-1.5 text-[#6B7280] transition-colors hover:border-[#E5E7EB] hover:bg-[#F9FAFA]"
                  aria-label="Call"
                >
                  <Phone className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  className="rounded-md border border-transparent p-1.5 text-[#6B7280] transition-colors hover:border-[#E5E7EB] hover:bg-[#F9FAFA]"
                  aria-label="Video"
                >
                  <Video className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>
            <div className="space-y-4 rounded-md border border-[#EDEDED] bg-[#FAFAFA] p-4">
              {hasMessages ? (
                opportunity.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex max-w-[88%] flex-col ${
                      msg.sender === 'applicant' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div
                      className={`rounded-md px-3 py-2 text-sm leading-relaxed ${
                        msg.sender === 'applicant'
                          ? 'bg-[#82B7FB] text-white'
                          : 'border border-[#E5E7EB] bg-white text-[#111827]'
                      }`}
                    >
                      {msg.body}
                    </div>
                    <p className="mt-1.5 px-0.5 font-dashboard-mono text-[10px] text-[#9CA3AF]">{msg.sentAt}</p>
                  </div>
                ))
              ) : (
                <div className="rounded-md border border-dashed border-[#D1D5DB] bg-white p-4 text-sm text-[#6B7280]">
                  No business messages yet. This match is ready to watch from your opportunities list.
                </div>
              )}
              <div className="flex items-center gap-2 border-t border-[#EDEDED] pt-4">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => onChatInputChange(e.target.value)}
                  placeholder="Write a message in this opportunity..."
                  className="flex-1 rounded-md border border-[#E5E7EB] bg-white px-3 py-2.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:border-[#7DBBFF] focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSend();
                  }}
                />
                <button
                  type="button"
                  onClick={onSend}
                  className="shrink-0 rounded-md bg-[#7DBBFF] p-2.5 text-white transition-colors hover:bg-[#6aabef]"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside className="border-t border-[#EDEDED] bg-[#FBFBFB] p-5 lg:border-l lg:border-t-0">
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-4">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Next action</p>
            <p className="text-sm font-semibold text-[#111827]">{opportunity.nextAction.label}</p>
            <p className="mt-2 text-xs leading-relaxed text-[#6B7280]">{opportunity.nextAction.description}</p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={onPrimaryAction}
                className="flex items-center justify-center gap-2 rounded-md bg-[#7DBBFF] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#6aabef]"
              >
                <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                {opportunity.nextAction.ctaLabel}
              </button>
              <button
                type="button"
                onClick={onAskQuestion}
                className="flex items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#FAFAFA]"
              >
                Ask a question
              </button>
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Timeline</p>
            <div className="relative pl-5">
              <div className="pointer-events-none absolute bottom-1.5 left-[5px] top-1.5 w-px bg-black/[0.07]" aria-hidden />
              {opportunity.timeline.map((event, idx) => (
                <div key={event.id} className="relative flex gap-3.5" style={{ paddingBottom: idx === opportunity.timeline.length - 1 ? 0 : 16 }}>
                  <span
                    className="absolute left-[2px] mt-1.5 h-[7px] w-[7px] shrink-0 rounded-full border-[1.5px] border-white"
                    style={{ background: config.color, boxShadow: `0 0 0 1px ${config.color}` }}
                  />
                  <div className="pl-4">
                    <p className="text-[12.5px] font-semibold text-[#111827]">{event.label}</p>
                    <p className="mt-1 text-[12px] leading-normal text-[#6B7280]">{event.description}</p>
                    <p className="mt-1 font-dashboard-mono text-[10px] text-[#9CA3AF]">{event.happenedAt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-md bg-[#F3F4F6] p-3">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9CA3AF]" strokeWidth={2} />
            <p className="text-xs leading-relaxed text-[#6B7280]">
              Future Supabase records can map this detail view to one engagement, related engagement_messages,
              and timeline-style engagement_events.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

// ─── Component ─────────────────────────────────────────────────────────

export type OpportunitiesEmbeddedMode = 'opportunities' | 'explore';

export type OpportunitiesPageProps = {
  /** When set, show only this tab (no sub-tab strip or Opportunities header). Used by applicant shell nav. */
  mode?: OpportunitiesEmbeddedMode;
  /** Select a specific opportunity from dashboard/notification context. */
  selectedOpportunityId?: number | null;
  /** Select a specific engagement-backed opportunity from dashboard/notification context. */
  selectedOpportunityEngagementId?: string | null;
};

function subTabFromMode(mode: OpportunitiesEmbeddedMode | undefined): SubTab {
  if (mode === 'explore') return 'explore';
  return 'opportunities';
}

export function OpportunitiesPage({ mode, selectedOpportunityId, selectedOpportunityEngagementId }: OpportunitiesPageProps = {}) {
  const embedded = mode != null;
  const [activeTab, setActiveTab] = useState<SubTab>(() => subTabFromMode(mode));
  const [expandedIndustry, setExpandedIndustry] = useState<string | null>('saas');
  const [opportunities, setOpportunities] = useState<ApplicantOpportunity[]>(initialOpportunitiesData);
  const [selectedId, setSelectedId] = useState<number>(() => selectedOpportunityId ?? initialOpportunitiesData[0]?.id ?? 1);
  const [chatInput, setChatInput] = useState('');
  const [savedItems, setSavedItems] = useState<Set<number>>(
    () => new Set(initialOpportunitiesData.filter((o) => o.saved).map((o) => o.id)),
  );
  const [opportunityFilter, setOpportunityFilter] = useState<OpportunityFilterStage>('all');
  const [industrySort, setIndustrySort] = useState<'match' | 'growth' | 'roles'>('match');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

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
    if (selectedOpportunityId == null) return;
    const opportunity = opportunities.find((x) => x.id === selectedOpportunityId);
    if (opportunity) setSelectedId(opportunity.id);
  }, [opportunities, selectedOpportunityId]);

  const showToast = (message: string) => setToast({ message, visible: true });

  useEffect(() => {
    if (toast.visible) {
      const t = setTimeout(() => setToast({ message: '', visible: false }), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const toggleSave = (id: number) => {
    setSavedItems(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); showToast('Removed from saved'); }
      else { n.add(id); showToast('Saved to your list'); }
      return n;
    });
  };

  const updateOpportunity = (id: number, updater: (opportunity: ApplicantOpportunity) => ApplicantOpportunity) => {
    setOpportunities((prev) => prev.map((opportunity) => (opportunity.id === id ? updater(opportunity) : opportunity)));
  };

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

  const handlePrimaryAction = (opportunity: ApplicantOpportunity) => {
    if (opportunity.nextAction.state === 'view-summary') {
      setSavedItems((prev) => new Set(prev).add(opportunity.id));
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
      markOpportunityResponded(opportunity, 'Thanks, I am interested. Tuesday or Thursday afternoon works for me.', {
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

    markOpportunityResponded(opportunity, `Hi ${opportunity.contact.name}, thanks for reaching out. I am interested in learning more about the ${opportunity.role.title} role.`, {
      toast: `Interest sent to ${opportunity.business.name}`,
    });
  };

  const handleAskQuestion = (opportunity: ApplicantOpportunity) => {
    const question = `Hi ${opportunity.contact.name}, thanks for reaching out. Could you share more about the team and what success looks like in the first six months?`;
    markOpportunityResponded(opportunity, question, {
      question: true,
      toast: `Question sent to ${opportunity.business.name}`,
    });
    setChatInput('');
  };

  const stageCounts = OPPORTUNITY_FILTER_ORDER.reduce((acc, stage) => {
    acc[stage] = stage === 'all'
      ? opportunities.length
      : opportunities.filter((p) => p.status === stage).length;
    return acc;
  }, {} as Record<OpportunityFilterStage, number>);

  const filteredOpportunities =
    opportunityFilter === 'all'
      ? opportunities
      : opportunities.filter((p) => p.status === opportunityFilter);

  const sortedIndustries = [...industries].sort((a, b) => {
    if (industrySort === 'match') return b.matchPercent - a.matchPercent;
    if (industrySort === 'roles') return b.openRoles - a.openRoles;
    return parseFloat(b.growth) - parseFloat(a.growth);
  });

  const activeOpportunity =
    opportunities.find((o) => o.id === selectedId) ?? filteredOpportunities[0] ?? opportunities[0];
  const totalUnread = opportunities.filter((o) => o.unread).length;

  return (
    <div className="font-dashboard text-[#111827] antialiased">
      {/* Header + stats — full Opportunities hub only */}
      {!embedded ? (
      <div className="mb-6">
        <h1 className="text-2xl text-[#111827] font-semibold mb-2">Opportunities</h1>
        <p className="text-sm text-[#6B7280]">Explore industries, review opportunities, and connect with companies that match your profile</p>
      </div>
      ) : null}

      {!embedded ? (
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="border border-black/[0.08] bg-white p-4" style={{ borderRadius: '14px' }}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">Active Opportunities</span>
              <Layers className="h-4 w-4 text-[#7DBBFF]" strokeWidth={2} />
            </div>
            <p className="font-dashboard-mono text-2xl font-semibold tabular-nums text-[#111827]">{opportunities.length}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-[#10B981]">
              <TrendingUp className="h-3 w-3" strokeWidth={2} />
              <span>{stageCounts.contacted} new reach-outs</span>
            </p>
          </div>
          <div className="border border-black/[0.08] bg-white p-4" style={{ borderRadius: '14px' }}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">Reached out</span>
              <MessageCircle className="h-4 w-4 text-[#3B82F6]" strokeWidth={2} />
            </div>
            <p className="font-dashboard-mono text-2xl font-semibold tabular-nums text-[#111827]">{stageCounts.contacted}</p>
            <p className="mt-1 text-xs text-[#EF4444]">{totalUnread} unread</p>
          </div>
          <div className="border border-black/[0.08] bg-white p-4" style={{ borderRadius: '14px' }}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">Interviewing</span>
              <Video className="h-4 w-4 text-[#F59E0B]" strokeWidth={2} />
            </div>
            <p className="font-dashboard-mono text-2xl font-semibold tabular-nums text-[#111827]">{stageCounts.interviewing}</p>
            <p className="mt-1 text-xs text-[#F59E0B]">Next action ready</p>
          </div>
          <div className="border border-black/[0.08] bg-white p-4" style={{ borderRadius: '14px' }}>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-[#6B7280]">Industries Matched</span>
              <Compass className="h-4 w-4 text-[#8B5CF6]" strokeWidth={2} />
            </div>
            <p className="font-dashboard-mono text-2xl font-semibold tabular-nums text-[#111827]">{industries.length}</p>
            <p className="mt-1 text-xs text-[#8B5CF6]">Based on your traits</p>
          </div>
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

      {/* ═══════════ OPPORTUNITIES TAB ═══════════ */}
      {activeTab === 'opportunities' && (
        <div className="bg-white">
          {embedded ? (
            <div className="mb-4 flex flex-wrap items-baseline gap-x-8 gap-y-2 border-b border-[#EDEDED] pb-4">
              <div className="flex items-baseline gap-2">
                <span className="font-dashboard-mono text-xl font-semibold tabular-nums text-[#111827]">{stageCounts.all}</span>
                <span className="text-sm text-[#9CA3AF]">Total</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-dashboard-mono text-xl font-semibold tabular-nums" style={{ color: '#3B82F6' }}>{stageCounts.contacted}</span>
                <span className="text-sm text-[#9CA3AF]">Reached out</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-dashboard-mono text-xl font-semibold tabular-nums" style={{ color: '#F59E0B' }}>{stageCounts.interviewing}</span>
                <span className="text-sm text-[#9CA3AF]">Interviewing</span>
              </div>
              <span className="w-full text-sm text-[#22C55E] sm:ml-auto sm:w-auto">{totalUnread} unread</span>
            </div>
          ) : null}

          <div className="mb-4 flex flex-wrap gap-2">
            {OPPORTUNITY_FILTER_ORDER.filter((stage) => stage === 'all' || stageCounts[stage] > 0).map((stage) => {
              const config = stage === 'all' ? { label: 'All' } : applicantLifecycleConfig[stage];
              const count = stageCounts[stage];
              const active = opportunityFilter === stage;
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setOpportunityFilter(stage)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    active ? 'bg-[#F3F4F6] text-[#111827]' : 'bg-transparent text-[#9CA3AF] hover:text-[#6B7280]'
                  }`}
                >
                  {config.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(300px,420px)_1fr]">
            <div className="divide-y divide-[#EDEDED] border-y border-[#EDEDED]">
              {filteredOpportunities.map((item) => {
                const config = applicantLifecycleConfig[item.status];
                const accent = matchAccent(item.matchScore);
                const initials = rowInitials(item.business.name);
                const selected = activeOpportunity?.id === item.id;
                const subline = [
                  item.role.location,
                  item.role.employmentType,
                  item.role.sector,
                  item.nextAction.label,
                ].filter(Boolean).join(' · ');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`block w-full px-3 py-4 text-left transition-colors ${
                      selected ? 'bg-[#7DBBFF]/10' : 'hover:bg-[#FAFAFA]'
                    }`}
                  >
                    <div className="flex gap-4">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[11px] font-semibold text-[#9CA3AF]"
                        aria-hidden
                      >
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-sm font-semibold text-[#111827]">{item.role.title}</span>
                          <span className="text-sm text-[#6B7280]">{item.business.name}</span>
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                            style={{ color: config.color, backgroundColor: config.bg }}
                          >
                            {config.label}
                          </span>
                        </div>
                        <p className="mt-1 text-xs leading-snug text-[#9CA3AF]">{subline}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#9CA3AF]">
                          {item.unreadMessages > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[#EF4444]">
                              <MessageCircle className="h-3 w-3 shrink-0" strokeWidth={2} />
                              {item.unreadMessages} new
                            </span>
                          ) : null}
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" strokeWidth={2} />
                            {item.lastUpdate}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-dashboard-mono text-sm font-semibold tabular-nums" style={{ color: accent.color }}>
                          {item.matchScore}
                          <span className="font-normal text-[#9CA3AF]">/100</span>
                        </p>
                        <div className="ml-auto mt-1.5 h-1 w-16 overflow-hidden rounded-full bg-[#F3F4F6]">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.min(100, item.matchScore)}%`, backgroundColor: accent.bar }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSave(item.id);
                          }}
                          className={`mt-3 p-1 transition-colors ${savedItems.has(item.id) ? 'text-[#F59E0B]' : 'text-[#D1D5DB] hover:text-[#F59E0B]'}`}
                          aria-label={savedItems.has(item.id) ? 'Remove bookmark' : 'Save'}
                        >
                          <Bookmark className="h-4 w-4" strokeWidth={2} fill={savedItems.has(item.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {activeOpportunity ? (
              <OpportunityDetail
                opportunity={activeOpportunity}
                chatInput={chatInput}
                onChatInputChange={setChatInput}
                onSend={() => {
                  const body = chatInput.trim();
                  if (!body) return;
                  markOpportunityResponded(activeOpportunity, body);
                  setChatInput('');
                }}
                onPrimaryAction={() => handlePrimaryAction(activeOpportunity)}
                onAskQuestion={() => handleAskQuestion(activeOpportunity)}
              />
            ) : null}
          </div>
        </div>
      )}

      {/* ═══════════ EXPLORE INDUSTRIES TAB ═══════════ */}
      {activeTab === 'explore' && (
        <div className="bg-white">
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
  props: Pick<OpportunitiesPageProps, 'selectedOpportunityId' | 'selectedOpportunityEngagementId'>,
) {
  return <OpportunitiesPage mode="opportunities" {...props} />;
}

export function ApplicantExploreIndustriesPanel() {
  return <OpportunitiesPage mode="explore" />;
}
