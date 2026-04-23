import { useState, useEffect } from 'react';
import {
  MessageSquare, Eye, ArrowUpRight,
  Clock, TrendingUp, Send, Users,
  Layers, Search, CheckCircle2,
  MessageCircle, Video, Phone, Bookmark, Compass,
  ChevronDown, ChevronUp,
} from 'lucide-react';

import { applicantPipelineMockData } from '../../lib/applicantOpportunitiesMock';

// ─── Types ─────────────────────────────────────────────────────────────

type SubTab = 'pipeline' | 'explore' | 'messages';
type PipelineStage = 'discovered' | 'applied' | 'interviewing' | 'offer';

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

interface Conversation {
  id: number;
  company: string;
  role: string;
  contactName: string;
  contactRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  messages: { sender: 'you' | 'them'; text: string; time: string }[];
}

// ─── Data ──────────────────────────────────────────────────────────────

const pipelineData = applicantPipelineMockData;

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

const conversations: Conversation[] = [
  {
    id: 1,
    company: 'TechFlow Inc.',
    role: 'Senior Product Designer',
    contactName: 'Sarah Chen',
    contactRole: 'Head of Design',
    lastMessage: 'Looking forward to meeting you on the 18th! Let me know if you have any questions about the team.',
    lastMessageTime: '2 hours ago',
    unread: true,
    messages: [
      { sender: 'them', text: 'Hi Alex! We were really impressed with your profile and would love to move forward with a final round interview.', time: 'Feb 14, 10:30 AM' },
      { sender: 'you', text: 'Thank you Sarah! I\'m excited about the opportunity. I\'d love to learn more about the team structure and current design challenges.', time: 'Feb 14, 11:15 AM' },
      { sender: 'them', text: 'Great questions! We\'re a team of 8 designers working across 3 product lines. Your systems thinking approach really stood out to us.', time: 'Feb 14, 2:00 PM' },
      { sender: 'you', text: 'That sounds like a great setup. I\'m available anytime next week for the final round.', time: 'Feb 14, 3:30 PM' },
      { sender: 'them', text: 'Looking forward to meeting you on the 18th! Let me know if you have any questions about the team.', time: '2 hours ago' },
    ],
  },
  {
    id: 2,
    company: 'Stripe',
    role: 'Product Design Lead',
    contactName: 'Jamie Rodriguez',
    contactRole: 'Design Director',
    lastMessage: 'We\'d like to extend an offer — details are in your email. Happy to jump on a call to discuss!',
    lastMessageTime: '1 day ago',
    unread: true,
    messages: [
      { sender: 'them', text: 'Hi Alex, thanks for going through our process. The team really enjoyed your portfolio review and the design challenge.', time: 'Feb 10, 9:00 AM' },
      { sender: 'you', text: 'Thank you Jamie! I really enjoyed the challenge — the payments flow problem was fascinating to work through.', time: 'Feb 10, 10:45 AM' },
      { sender: 'them', text: 'We\'d like to extend an offer — details are in your email. Happy to jump on a call to discuss!', time: '1 day ago' },
    ],
  },
  {
    id: 3,
    company: 'Notion',
    role: 'Product Designer',
    contactName: 'Alex Kim',
    contactRole: 'Recruiting Lead',
    lastMessage: 'Your application is currently being reviewed by the hiring team. We\'ll be in touch within the next few days.',
    lastMessageTime: '3 days ago',
    unread: false,
    messages: [
      { sender: 'you', text: 'Hi! I recently applied for the Product Designer position and wanted to express my enthusiasm for the role.', time: 'Feb 12, 4:00 PM' },
      { sender: 'them', text: 'Your application is currently being reviewed by the hiring team. We\'ll be in touch within the next few days.', time: '3 days ago' },
    ],
  },
];

export const applicantMessagingUnreadMockCount = conversations.filter((c) => c.unread).length;

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

// ─── Stage Config ──────────────────────────────────────────────────────

const stageConfig: Record<PipelineStage, { label: string; color: string; bg: string; icon: typeof Eye }> = {
  discovered: { label: 'Discovered', color: '#64748B', bg: 'rgba(100,116,139,0.12)', icon: Eye },
  applied: { label: 'Applied', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)', icon: Send },
  interviewing: { label: 'Interviewing', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', icon: Users },
  offer: { label: 'Offer', color: '#22C55E', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle2 },
};

const PIPELINE_FILTER_ORDER = ['all', 'offer', 'interviewing', 'applied', 'discovered'] as const;
type PipelineFilterStage = (typeof PIPELINE_FILTER_ORDER)[number];

// ─── Component ─────────────────────────────────────────────────────────

export type OpportunitiesEmbeddedMode = 'pipeline' | 'explore' | 'messages';

export type OpportunitiesPageProps = {
  /** When set, show only this tab (no sub-tab strip or Opportunities header). Used by applicant shell nav. */
  mode?: OpportunitiesEmbeddedMode;
  /** After navigating to Messaging, select the conversation for this company name. */
  focusCompanyName?: string | null;
  /** Pipeline only: user clicked Message on a row — parent switches to Messaging. */
  onRequestSwitchToMessaging?: (company: string) => void;
};

function subTabFromMode(mode: OpportunitiesEmbeddedMode | undefined): SubTab {
  if (mode === 'explore') return 'explore';
  if (mode === 'messages') return 'messages';
  return 'pipeline';
}

export function OpportunitiesPage({ mode, focusCompanyName, onRequestSwitchToMessaging }: OpportunitiesPageProps = {}) {
  const embedded = mode != null;
  const [activeTab, setActiveTab] = useState<SubTab>(() => subTabFromMode(mode));
  const [expandedIndustry, setExpandedIndustry] = useState<string | null>('saas');
  const [activeConversation, setActiveConversation] = useState<number>(1);
  const [chatInput, setChatInput] = useState('');
  const [savedItems, setSavedItems] = useState<Set<number>>(new Set([1, 3, 6, 8]));
  const [pipelineFilter, setPipelineFilter] = useState<PipelineFilterStage>('all');
  const [industrySort, setIndustrySort] = useState<'match' | 'growth' | 'roles'>('match');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  useEffect(() => {
    if (mode == null) return;
    setActiveTab(subTabFromMode(mode));
  }, [mode]);

  useEffect(() => {
    if (!focusCompanyName) return;
    const c = conversations.find((x) => x.company === focusCompanyName);
    if (c) setActiveConversation(c.id);
  }, [focusCompanyName]);

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

  // Pipeline counts
  const stageCounts = {
    all: pipelineData.length,
    discovered: pipelineData.filter(p => p.stage === 'discovered').length,
    applied: pipelineData.filter(p => p.stage === 'applied').length,
    interviewing: pipelineData.filter(p => p.stage === 'interviewing').length,
    offer: pipelineData.filter(p => p.stage === 'offer').length,
  };

  const filteredPipeline = pipelineFilter === 'all' ? pipelineData : pipelineData.filter(p => p.stage === pipelineFilter);

  const sortedIndustries = [...industries].sort((a, b) => {
    if (industrySort === 'match') return b.matchPercent - a.matchPercent;
    if (industrySort === 'roles') return b.openRoles - a.openRoles;
    return parseFloat(b.growth) - parseFloat(a.growth);
  });

  const activeConvo = conversations.find(c => c.id === activeConversation);
  const totalUnread = conversations.filter(c => c.unread).length;

  return (
    <div className="font-dashboard text-[#111827] antialiased">
      {/* Header + stats — full Opportunities hub only */}
      {!embedded ? (
      <div className="mb-6">
        <h1 className="text-2xl text-[#111827] font-semibold mb-2">Opportunities</h1>
        <p className="text-sm text-[#6B7280]">Explore industries, track your pipeline, and connect with companies that match your profile</p>
      </div>
      ) : null}

      {!embedded ? (
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border border-black/[0.08]" style={{ borderRadius: '14px' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#6B7280]">Active Pipeline</span>
            <Layers className="w-4 h-4 text-[#7DBBFF]" strokeWidth={2} />
          </div>
          <p className="font-dashboard-mono text-2xl font-semibold text-[#111827] tabular-nums">{pipelineData.length}</p>
          <p className="text-xs text-[#10B981] mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" strokeWidth={2} />
            <span>3 new this week</span>
          </p>
        </div>
        <div className="bg-white p-4 border border-black/[0.08]" style={{ borderRadius: '14px' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#6B7280]">Interviews</span>
            <Video className="w-4 h-4 text-[#F59E0B]" strokeWidth={2} />
          </div>
          <p className="font-dashboard-mono text-2xl font-semibold text-[#111827] tabular-nums">{stageCounts.interviewing}</p>
          <p className="text-xs text-[#F59E0B] mt-1">Next: Feb 18</p>
        </div>
        <div className="bg-white p-4 border border-black/[0.08]" style={{ borderRadius: '14px' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#6B7280]">Offers</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" strokeWidth={2} />
          </div>
          <p className="font-dashboard-mono text-2xl font-semibold text-[#111827] tabular-nums">{stageCounts.offer}</p>
          <p className="text-xs text-[#10B981] mt-1">Review pending</p>
        </div>
        <div className="bg-white p-4 border border-black/[0.08]" style={{ borderRadius: '14px' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#6B7280]">Industries Matched</span>
            <Compass className="w-4 h-4 text-[#8B5CF6]" strokeWidth={2} />
          </div>
          <p className="font-dashboard-mono text-2xl font-semibold text-[#111827] tabular-nums">{industries.length}</p>
          <p className="text-xs text-[#8B5CF6] mt-1">Based on your traits</p>
        </div>
      </div>
      ) : null}

      {!embedded ? (
      <div className="flex gap-1 mb-6 p-1 bg-[#F9F9FA] border border-black/[0.08] inline-flex" style={{ borderRadius: '12px' }}>
        {([
          { key: 'pipeline' as SubTab, label: 'Pipeline', icon: Layers, count: pipelineData.length },
          { key: 'explore' as SubTab, label: 'Explore Industries', icon: Compass, count: industries.length },
          { key: 'messages' as SubTab, label: 'Messages', icon: MessageCircle, count: totalUnread || undefined },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-white text-[#111827] shadow-sm'
                : 'text-[#6B7280] hover:text-[#111827]'
            }`}
            style={{ borderRadius: '10px' }}
          >
            <tab.icon className="w-4 h-4" strokeWidth={2} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 text-xs font-semibold ${
                activeTab === tab.key
                  ? tab.key === 'messages' && totalUnread > 0 ? 'bg-red-500 text-white' : 'bg-[#7DBBFF] text-white'
                  : tab.key === 'messages' && totalUnread > 0 ? 'bg-red-500 text-white' : 'bg-[#E5E7EB] text-[#6B7280]'
              }`} style={{ borderRadius: '6px' }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      ) : null}

      {/* ═══════════ PIPELINE TAB ═══════════ */}
      {activeTab === 'pipeline' && (
        <div className="bg-white">
          {embedded ? (
            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2 pb-4 mb-4 border-b border-[#EDEDED]">
              <div className="flex items-baseline gap-2">
                <span className="font-dashboard-mono text-xl font-semibold tabular-nums text-[#111827]">{stageCounts.all}</span>
                <span className="text-sm text-[#9CA3AF]">Total</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-dashboard-mono text-xl font-semibold tabular-nums" style={{ color: '#F59E0B' }}>{stageCounts.interviewing}</span>
                <span className="text-sm text-[#9CA3AF]">Interviewing</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-dashboard-mono text-xl font-semibold tabular-nums" style={{ color: '#22C55E' }}>{stageCounts.offer}</span>
                <span className="text-sm text-[#9CA3AF]">Offers</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-dashboard-mono text-xl font-semibold tabular-nums" style={{ color: '#3B82F6' }}>{stageCounts.applied}</span>
                <span className="text-sm text-[#9CA3AF]">Applied</span>
              </div>
              <span className="w-full sm:w-auto sm:ml-auto text-sm text-[#22C55E]">3 new this week</span>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 mb-1">
            {PIPELINE_FILTER_ORDER.map((stage) => {
              const config = stage === 'all' ? { label: 'All' } : stageConfig[stage];
              const count = stageCounts[stage];
              const active = pipelineFilter === stage;
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setPipelineFilter(stage)}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors ${
                    active ? 'bg-[#F3F4F6] text-[#111827]' : 'bg-transparent text-[#9CA3AF] hover:text-[#6B7280]'
                  }`}
                >
                  {config.label} ({count})
                </button>
              );
            })}
          </div>

          <div className="border-t border-[#EDEDED] divide-y divide-[#EDEDED]">
            {filteredPipeline.map((item) => {
              const config = stageConfig[item.stage];
              const accent = matchAccent(item.matchScore);
              const initials = rowInitials(item.company);
              const subline = [item.location, item.employmentType, item.sector, item.nextAction].filter(Boolean).join(' · ');
              return (
                <div key={item.id} className="py-4">
                  <div className="flex gap-4">
                    <div
                      className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0 text-[11px] font-semibold text-[#9CA3AF]"
                      aria-hidden
                    >
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="text-sm font-semibold text-[#111827]">{item.role}</span>
                            <span className="text-sm text-[#6B7280]">{item.company}</span>
                            <span
                              className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full"
                              style={{ color: config.color, backgroundColor: config.bg }}
                            >
                              {config.label}
                            </span>
                          </div>
                          {subline ? (
                            <p className="text-xs text-[#9CA3AF] mt-1 leading-snug">{subline}</p>
                          ) : null}
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[#9CA3AF]">
                            {item.unreadMessages != null && item.unreadMessages > 0 ? (
                              <span className="inline-flex items-center gap-1 text-[#EF4444]">
                                <MessageCircle className="w-3 h-3 shrink-0" strokeWidth={2} />
                                {item.unreadMessages} new
                              </span>
                            ) : null}
                            <span className="inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 shrink-0" strokeWidth={2} />
                              {item.lastUpdate}
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                if (onRequestSwitchToMessaging) {
                                  onRequestSwitchToMessaging(item.company);
                                } else {
                                  setActiveTab('messages');
                                  setActiveConversation(conversations.find((c) => c.company === item.company)?.id || 1);
                                }
                              }}
                              className="text-xs font-medium text-[#7DBBFF] hover:underline inline-flex items-center gap-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5" strokeWidth={2} />
                              Message
                            </button>
                            {item.stage === 'discovered' ? (
                              <button
                                type="button"
                                className="text-xs font-medium text-[#7DBBFF] hover:underline inline-flex items-center gap-1"
                              >
                                <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
                                Apply
                              </button>
                            ) : null}
                            {item.stage === 'offer' ? (
                              <button
                                type="button"
                                className="text-xs font-semibold text-[#22C55E] hover:underline inline-flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                                Review offer
                              </button>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-start gap-3 sm:pt-0">
                          <div className="text-right">
                            <p className="font-dashboard-mono text-sm font-semibold tabular-nums" style={{ color: accent.color }}>
                              {item.matchScore}
                              <span className="font-normal text-[#9CA3AF]">/100</span>
                            </p>
                            <div className="mt-1.5 w-20 h-1 rounded-full bg-[#F3F4F6] overflow-hidden ml-auto">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${Math.min(100, item.matchScore)}%`, backgroundColor: accent.bar }}
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSave(item.id)}
                            className={`p-1 transition-colors mt-0.5 ${savedItems.has(item.id) ? 'text-[#F59E0B]' : 'text-[#D1D5DB] hover:text-[#F59E0B]'}`}
                            aria-label={savedItems.has(item.id) ? 'Remove bookmark' : 'Save'}
                          >
                            <Bookmark className="w-4 h-4" strokeWidth={2} fill={savedItems.has(item.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* ═══════════ MESSAGES TAB ═══════════ */}
      {activeTab === 'messages' && (
        <div className="bg-white border border-[#E5E7EB] overflow-hidden flex h-[min(600px,calc(100vh-200px))] rounded-sm">
          {/* Conversation List */}
          <div className="w-[300px] sm:w-[320px] border-r border-[#EDEDED] flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-[#EDEDED]">
              <p className="text-[10px] font-medium tracking-[0.14em] text-[#9CA3AF] uppercase">Conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((convo) => (
                <button
                  key={convo.id}
                  type="button"
                  onClick={() => setActiveConversation(convo.id)}
                  className={`w-full px-4 py-3.5 text-left border-b border-[#EDEDED] transition-colors ${
                    activeConversation === convo.id
                      ? 'bg-[#7DBBFF]/10'
                      : 'hover:bg-[#FAFAFA]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0 text-[10px] font-semibold text-[#9CA3AF]">
                      {rowInitials(convo.company)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p
                          className={`text-sm truncate ${
                            convo.unread ? 'text-[#111827] font-semibold' : 'text-[#111827] font-medium'
                          }`}
                        >
                          {convo.company}
                        </p>
                        {convo.unread ? (
                          <div className="w-2 h-2 rounded-full shrink-0 bg-[#7DBBFF]" aria-hidden />
                        ) : null}
                      </div>
                      <p className="text-xs text-[#6B7280] mb-1 truncate">
                        {convo.contactName} · {convo.contactRole}
                      </p>
                      <p
                        className={`text-xs line-clamp-2 ${
                          convo.unread ? 'text-[#111827]' : 'text-[#9CA3AF]'
                        }`}
                      >
                        {convo.lastMessage}
                      </p>
                      <p className="mt-1 font-dashboard-mono text-[10px] text-[#9CA3AF]">{convo.lastMessageTime}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          {activeConvo ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat Header */}
              <div className="px-4 py-3 border-b border-[#EDEDED] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#F3F4F6] flex items-center justify-center shrink-0 text-[10px] font-semibold text-[#9CA3AF]">
                    {rowInitials(activeConvo.company)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-[#111827] font-semibold truncate">{activeConvo.company}</p>
                    <p className="text-xs text-[#6B7280] truncate">
                      {activeConvo.contactName} · {activeConvo.contactRole}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    className="p-2 text-[#6B7280] hover:bg-[#F9FAFA] transition-colors rounded-md border border-transparent hover:border-[#E5E7EB]"
                    aria-label="Call"
                  >
                    <Phone className="w-4 h-4" strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-[#6B7280] hover:bg-[#F9FAFA] transition-colors rounded-md border border-transparent hover:border-[#E5E7EB]"
                    aria-label="Video"
                  >
                    <Video className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5 bg-white">
                {activeConvo.messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] sm:max-w-[72%] ${msg.sender === 'you' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <div
                      className={`px-3 py-2 text-sm leading-relaxed rounded-md ${
                        msg.sender === 'you'
                          ? 'bg-[#82B7FB] text-white'
                          : 'bg-white text-[#111827] border border-[#E5E7EB]'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <p className="mt-1.5 px-0.5 font-dashboard-mono text-[10px] text-[#9CA3AF]">{msg.time}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-[#EDEDED] bg-white">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Write a message..."
                    className="flex-1 px-3 py-2.5 bg-white border border-[#E5E7EB] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7DBBFF] rounded-md"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && chatInput.trim()) {
                        showToast(`Message sent to ${activeConvo.company}`);
                        setChatInput('');
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (chatInput.trim()) {
                        showToast(`Message sent to ${activeConvo.company}`);
                        setChatInput('');
                      }
                    }}
                    className="p-2.5 bg-[#7DBBFF] text-white hover:bg-[#6aabef] transition-colors rounded-md shrink-0"
                    aria-label="Send"
                  >
                    <Send className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageCircle className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-sm text-[#6B7280]">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
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

export function ApplicantPipelinePanel(props: Pick<OpportunitiesPageProps, 'onRequestSwitchToMessaging'>) {
  return <OpportunitiesPage mode="pipeline" {...props} />;
}

export function ApplicantExploreIndustriesPanel() {
  return <OpportunitiesPage mode="explore" />;
}

export function ApplicantMessagingPanel(props: Pick<OpportunitiesPageProps, 'focusCompanyName'>) {
  return <OpportunitiesPage mode="messages" {...props} />;
}
