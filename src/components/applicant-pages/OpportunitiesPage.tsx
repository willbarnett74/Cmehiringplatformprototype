import { useState, useEffect } from 'react';
import {
  Building2, Briefcase, MapPin, MessageSquare, Eye, Calendar, ArrowUpRight,
  Clock, TrendingUp, Send, ChevronRight, Sparkles, Users, Globe,
  Layers, Target, Search, CheckCircle2,
  MessageCircle, Video, Phone, Bookmark, BarChart3, Compass,
  Lightbulb, DollarSign, ChevronDown, ChevronUp, Info
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────

type SubTab = 'pipeline' | 'explore' | 'messages';
type PipelineStage = 'discovered' | 'applied' | 'interviewing' | 'offer';

interface PipelineItem {
  id: number;
  company: string;
  role: string;
  location: string;
  matchScore: number;
  stage: PipelineStage;
  lastUpdate: string;
  nextAction?: string;
  interviewDate?: string;
  contactPerson?: string;
  unreadMessages?: number;
  saved: boolean;
}

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

const pipelineData: PipelineItem[] = [
  { id: 1, company: 'TechFlow Inc.', role: 'Senior Product Designer', location: 'San Francisco, CA', matchScore: 94, stage: 'interviewing', lastUpdate: '2 hours ago', nextAction: 'Final round — Feb 18', interviewDate: 'Feb 18, 2:00 PM PST', contactPerson: 'Sarah Chen', unreadMessages: 2, saved: true },
  { id: 2, company: 'DesignHub', role: 'Lead UX Designer', location: 'New York, NY', matchScore: 89, stage: 'interviewing', lastUpdate: '1 day ago', nextAction: 'Technical interview — Feb 20', interviewDate: 'Feb 20, 10:00 AM EST', contactPerson: 'Marcus Lee', unreadMessages: 0, saved: false },
  { id: 3, company: 'Notion', role: 'Product Designer', location: 'San Francisco, CA', matchScore: 96, stage: 'applied', lastUpdate: '3 days ago', nextAction: 'Application in review', unreadMessages: 1, saved: true },
  { id: 4, company: 'Linear', role: 'Design Engineer', location: 'Remote', matchScore: 93, stage: 'discovered', lastUpdate: '1 week ago', nextAction: 'Strong match — consider applying', unreadMessages: 0, saved: false },
  { id: 5, company: 'InnovateCo', role: 'Product Designer', location: 'Austin, TX', matchScore: 87, stage: 'applied', lastUpdate: '5 days ago', nextAction: 'Shortlisted by hiring manager', unreadMessages: 0, saved: false },
  { id: 6, company: 'Figma', role: 'Senior Product Designer', location: 'San Francisco, CA', matchScore: 91, stage: 'applied', lastUpdate: '1 week ago', nextAction: 'Application in review', unreadMessages: 0, saved: true },
  { id: 7, company: 'CreativeMinds', role: 'Senior Designer', location: 'Remote', matchScore: 85, stage: 'discovered', lastUpdate: '2 weeks ago', nextAction: 'Viewed your profile', unreadMessages: 0, saved: false },
  { id: 8, company: 'Stripe', role: 'Product Design Lead', location: 'Remote', matchScore: 88, stage: 'offer', lastUpdate: '1 day ago', nextAction: 'Offer received — review terms', unreadMessages: 3, saved: true },
];

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

// ─── Stage Config ──────────────────────────────────────────────────────

const stageConfig: Record<PipelineStage, { label: string; color: string; bg: string; icon: typeof Eye }> = {
  discovered: { label: 'Discovered', color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', icon: Eye },
  applied: { label: 'Applied', color: '#7DBBFF', bg: 'rgba(125,187,255,0.1)', icon: Send },
  interviewing: { label: 'Interviewing', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: Users },
  offer: { label: 'Offer', color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2 },
};

// ─── Component ─────────────────────────────────────────────────────────

export function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState<SubTab>('pipeline');
  const [expandedIndustry, setExpandedIndustry] = useState<string | null>('saas');
  const [activeConversation, setActiveConversation] = useState<number>(1);
  const [chatInput, setChatInput] = useState('');
  const [savedItems, setSavedItems] = useState<Set<number>>(new Set([1, 3, 6, 8]));
  const [pipelineFilter, setPipelineFilter] = useState<PipelineStage | 'all'>('all');
  const [industrySort, setIndustrySort] = useState<'match' | 'growth' | 'roles'>('match');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

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
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl text-[#111827] font-semibold mb-2">Opportunities</h1>
        <p className="text-sm text-[#6B7280]">Explore industries, track your pipeline, and connect with companies that match your profile</p>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 border border-black/[0.08]" style={{ borderRadius: '14px' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#6B7280]">Active Pipeline</span>
            <Layers className="w-4 h-4 text-[#7DBBFF]" strokeWidth={2} />
          </div>
          <p className="text-2xl text-[#111827] font-semibold">{pipelineData.length}</p>
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
          <p className="text-2xl text-[#111827] font-semibold">{stageCounts.interviewing}</p>
          <p className="text-xs text-[#F59E0B] mt-1">Next: Feb 18</p>
        </div>
        <div className="bg-white p-4 border border-black/[0.08]" style={{ borderRadius: '14px' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#6B7280]">Offers</span>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" strokeWidth={2} />
          </div>
          <p className="text-2xl text-[#111827] font-semibold">{stageCounts.offer}</p>
          <p className="text-xs text-[#10B981] mt-1">Review pending</p>
        </div>
        <div className="bg-white p-4 border border-black/[0.08]" style={{ borderRadius: '14px' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#6B7280]">Industries Matched</span>
            <Compass className="w-4 h-4 text-[#8B5CF6]" strokeWidth={2} />
          </div>
          <p className="text-2xl text-[#111827] font-semibold">{industries.length}</p>
          <p className="text-xs text-[#8B5CF6] mt-1">Based on your traits</p>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
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

      {/* ═══════════ PIPELINE TAB ═══════════ */}
      {activeTab === 'pipeline' && (
        <div>
          {/* Pipeline Stage Filters */}
          <div className="flex items-center gap-3 mb-6">
            {(['all', 'discovered', 'applied', 'interviewing', 'offer'] as const).map(stage => {
              const config = stage === 'all' ? { label: 'All', color: '#7DBBFF', bg: 'rgba(125,187,255,0.1)', icon: Sparkles } : stageConfig[stage];
              const count = stageCounts[stage];
              return (
                <button
                  key={stage}
                  onClick={() => setPipelineFilter(stage)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-medium border transition-all ${
                    pipelineFilter === stage
                      ? 'bg-white shadow-sm'
                      : 'bg-transparent hover:bg-white/60'
                  }`}
                  style={{
                    borderRadius: '10px',
                    borderColor: pipelineFilter === stage ? config.color : 'rgba(0,0,0,0.08)',
                    color: pipelineFilter === stage ? config.color : '#6B7280',
                  }}
                >
                  <config.icon className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{config.label}</span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold" style={{
                    borderRadius: '4px',
                    backgroundColor: pipelineFilter === stage ? config.bg : '#F3F4F6',
                    color: pipelineFilter === stage ? config.color : '#9CA3AF',
                  }}>{count}</span>
                </button>
              );
            })}
          </div>

          {/* Pipeline Stage Visual */}
          <div className="bg-white p-5 border border-black/[0.08] mb-6" style={{ borderRadius: '16px' }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-[#7DBBFF]" strokeWidth={2} />
              <span className="text-sm text-[#111827] font-medium">Pipeline Overview</span>
            </div>
            <div className="flex items-center gap-2">
              {(['discovered', 'applied', 'interviewing', 'offer'] as PipelineStage[]).map((stage, idx) => {
                const config = stageConfig[stage];
                const count = stageCounts[stage];
                const total = pipelineData.length;
                return (
                  <div key={stage} className="flex items-center flex-1 gap-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <config.icon className="w-3.5 h-3.5" style={{ color: config.color }} strokeWidth={2} />
                          <span className="text-xs text-[#6B7280]">{config.label}</span>
                        </div>
                        <span className="text-xs font-semibold" style={{ color: config.color }}>{count}</span>
                      </div>
                      <div className="w-full h-2 bg-[#F3F4F6] overflow-hidden" style={{ borderRadius: '4px' }}>
                        <div className="h-full transition-all duration-500" style={{
                          width: `${(count / total) * 100}%`,
                          backgroundColor: config.color,
                          borderRadius: '4px',
                        }} />
                      </div>
                    </div>
                    {idx < 3 && <ChevronRight className="w-4 h-4 text-[#D1D5DB] shrink-0" strokeWidth={2} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pipeline Cards */}
          <div className="space-y-3">
            {filteredPipeline.map(item => {
              const config = stageConfig[item.stage];
              return (
                <div key={item.id} className="bg-white border border-black/[0.08] hover:border-[#7DBBFF]/30 hover:shadow-md transition-all group" style={{ borderRadius: '16px' }}>
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Company Logo */}
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-black/[0.06] group-hover:scale-105 transition-transform" style={{ background: `linear-gradient(135deg, ${config.bg}, rgba(139,92,246,0.08))` }}>
                        <Building2 className="w-6 h-6" style={{ color: config.color }} strokeWidth={1.5} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <h3 className="text-base text-[#111827] font-semibold">{item.company}</h3>
                            <p className="text-sm text-[#6B7280]">{item.role}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium" style={{ borderRadius: '8px', color: config.color, backgroundColor: config.bg }}>
                              <config.icon className="w-3 h-3" strokeWidth={2} />
                              <span>{config.label}</span>
                            </div>
                            <button onClick={() => toggleSave(item.id)} className={`p-1.5 transition-all ${savedItems.has(item.id) ? 'text-[#F59E0B]' : 'text-[#D1D5DB] hover:text-[#F59E0B]'}`} style={{ borderRadius: '6px' }}>
                              <Bookmark className="w-4 h-4" strokeWidth={2} fill={savedItems.has(item.id) ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-[#9CA3AF]">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" strokeWidth={2} />{item.location}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" strokeWidth={2} />{item.lastUpdate}</span>
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-[#10B981]/10 text-[#10B981] font-semibold" style={{ borderRadius: '6px' }}>
                            <Sparkles className="w-2.5 h-2.5" strokeWidth={2} />
                            <span>{item.matchScore}% match</span>
                          </div>
                          {item.unreadMessages && item.unreadMessages > 0 && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 text-red-500 font-semibold" style={{ borderRadius: '6px' }}>
                              <MessageCircle className="w-2.5 h-2.5" strokeWidth={2} />
                              <span>{item.unreadMessages} new</span>
                            </span>
                          )}
                        </div>

                        {/* Next Action */}
                        {item.nextAction && (
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 px-3 py-2 bg-[#F9FAFB] border border-black/[0.05] flex-1 mr-3" style={{ borderRadius: '10px' }}>
                              {item.stage === 'interviewing' && <Calendar className="w-3.5 h-3.5 text-[#F59E0B]" strokeWidth={2} />}
                              {item.stage === 'offer' && <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" strokeWidth={2} />}
                              {item.stage === 'applied' && <Clock className="w-3.5 h-3.5 text-[#7DBBFF]" strokeWidth={2} />}
                              {item.stage === 'discovered' && <Lightbulb className="w-3.5 h-3.5 text-[#9CA3AF]" strokeWidth={2} />}
                              <span className="text-xs text-[#111827]">{item.nextAction}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { setActiveTab('messages'); setActiveConversation(conversations.find(c => c.company === item.company)?.id || 1); }}
                                className="px-3 py-2 text-xs font-medium text-[#7DBBFF] border border-[#7DBBFF]/30 hover:bg-[#7DBBFF]/5 transition-all flex items-center gap-1.5"
                                style={{ borderRadius: '8px' }}
                              >
                                <MessageSquare className="w-3.5 h-3.5" strokeWidth={2} />
                                Message
                              </button>
                              {item.stage === 'discovered' && (
                                <button className="px-3 py-2 text-xs font-medium text-white bg-[#7DBBFF] hover:bg-[#6aabef] transition-all flex items-center gap-1.5" style={{ borderRadius: '8px' }}>
                                  <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={2} />
                                  Apply
                                </button>
                              )}
                              {item.stage === 'offer' && (
                                <button className="px-3 py-2 text-xs font-medium text-white bg-[#10B981] hover:bg-[#059669] transition-all flex items-center gap-1.5" style={{ borderRadius: '8px' }}>
                                  <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                                  Review Offer
                                </button>
                              )}
                            </div>
                          </div>
                        )}
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
        <div>
          {/* Intro Card */}
          <div className="bg-gradient-to-r from-[#7DBBFF]/[0.06] to-[#8B5CF6]/[0.04] border border-[#7DBBFF]/10 p-5 mb-6" style={{ borderRadius: '16px' }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center shrink-0">
                <Compass className="w-5 h-5 text-[#7DBBFF]" strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm text-[#111827] font-medium mb-1">Industries matched to your trait profile</p>
                <p className="text-xs text-[#6B7280] leading-relaxed">
                  Based on your ownership drive, problem-structuring approach, and preference for autonomy-driven environments, we've identified industries where people with similar profiles tend to thrive. This isn't just about job titles — it's about where your natural strengths create the most impact.
                </p>
              </div>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-[#6B7280]">
              <span className="font-semibold text-[#111827]">{industries.length}</span> industries matched to your profile
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9CA3AF]">Sort by</span>
              {(['match', 'growth', 'roles'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setIndustrySort(s)}
                  className={`px-3 py-1.5 text-xs font-medium transition-all ${
                    industrySort === s ? 'bg-white text-[#111827] shadow-sm border border-black/[0.08]' : 'text-[#6B7280] hover:text-[#111827]'
                  }`}
                  style={{ borderRadius: '8px' }}
                >
                  {s === 'match' ? 'Best Match' : s === 'growth' ? 'Growth Rate' : 'Open Roles'}
                </button>
              ))}
            </div>
          </div>

          {/* Industry Cards */}
          <div className="space-y-4">
            {sortedIndustries.map(industry => {
              const isExpanded = expandedIndustry === industry.id;
              const matchColor = industry.matchPercent >= 90 ? '#10B981' : industry.matchPercent >= 80 ? '#7DBBFF' : '#F59E0B';
              return (
                <div key={industry.id} className="bg-white border border-black/[0.08] overflow-hidden transition-all" style={{ borderRadius: '16px' }}>
                  {/* Header - Always Visible */}
                  <button
                    onClick={() => setExpandedIndustry(isExpanded ? null : industry.id)}
                    className="w-full p-5 text-left hover:bg-[#FAFBFC] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${matchColor}12` }}>
                        <Globe className="w-6 h-6" style={{ color: matchColor }} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-base text-[#111827] font-semibold">{industry.name}</h3>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-2.5 py-1" style={{ borderRadius: '8px', backgroundColor: `${matchColor}12`, color: matchColor }}>
                              <Sparkles className="w-3 h-3" strokeWidth={2} />
                              <span className="text-xs font-semibold">{industry.matchPercent}% match</span>
                            </div>
                            {isExpanded ? <ChevronUp className="w-5 h-5 text-[#9CA3AF]" strokeWidth={2} /> : <ChevronDown className="w-5 h-5 text-[#9CA3AF]" strokeWidth={2} />}
                          </div>
                        </div>
                        <p className="text-sm text-[#6B7280] line-clamp-1 pr-32">{industry.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          {industry.topTraits.map(t => (
                            <span key={t} className="text-[11px] text-[#7DBBFF] font-medium px-2 py-0.5 bg-[#7DBBFF]/8" style={{ borderRadius: '6px' }}>{t}</span>
                          ))}
                          <span className="text-xs text-[#9CA3AF] flex items-center gap-1"><Briefcase className="w-3 h-3" strokeWidth={2} />{industry.openRoles} open roles</span>
                          <span className="text-xs text-[#10B981] flex items-center gap-1"><TrendingUp className="w-3 h-3" strokeWidth={2} />{industry.growth}</span>
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-black/[0.06] px-5 pb-5">
                      <div className="grid grid-cols-3 gap-5 pt-5">
                        {/* Why This Industry */}
                        <div className="col-span-2">
                          <div className="mb-5">
                            <div className="flex items-center gap-2 mb-2.5">
                              <Target className="w-4 h-4 text-[#7DBBFF]" strokeWidth={2} />
                              <span className="text-sm text-[#111827] font-medium">Why this industry fits you</span>
                            </div>
                            <p className="text-sm text-[#6B7280] leading-relaxed">{industry.whyYou}</p>
                          </div>

                          {/* Typical Roles */}
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Briefcase className="w-4 h-4 text-[#7DBBFF]" strokeWidth={2} />
                              <span className="text-sm text-[#111827] font-medium">Typical Roles</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2.5">
                              {industry.typicalRoles.map(role => (
                                <div key={role.title} className="p-3 bg-[#F9FAFB] border border-black/[0.05] flex items-center justify-between" style={{ borderRadius: '10px' }}>
                                  <div>
                                    <p className="text-sm text-[#111827] font-medium">{role.title}</p>
                                    <p className="text-xs text-[#9CA3AF]">{role.avgSalary}</p>
                                  </div>
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 ${
                                    role.demand === 'High' ? 'bg-[#10B981]/10 text-[#10B981]' :
                                    role.demand === 'Medium' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' :
                                    'bg-[#9CA3AF]/10 text-[#9CA3AF]'
                                  }`} style={{ borderRadius: '4px' }}>
                                    {role.demand} demand
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Industry Stats */}
                        <div className="space-y-3">
                          <div className="p-4 bg-[#F9FAFB] border border-black/[0.05]" style={{ borderRadius: '12px' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-4 h-4 text-[#10B981]" strokeWidth={2} />
                              <span className="text-xs text-[#6B7280]">Salary Range</span>
                            </div>
                            <p className="text-base text-[#111827] font-semibold">{industry.avgSalary}</p>
                          </div>
                          <div className="p-4 bg-[#F9FAFB] border border-black/[0.05]" style={{ borderRadius: '12px' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-4 h-4 text-[#7DBBFF]" strokeWidth={2} />
                              <span className="text-xs text-[#6B7280]">Industry Growth</span>
                            </div>
                            <p className="text-base text-[#111827] font-semibold">{industry.growth}</p>
                          </div>
                          <div className="p-4 bg-[#F9FAFB] border border-black/[0.05]" style={{ borderRadius: '12px' }}>
                            <div className="flex items-center gap-2 mb-2">
                              <Briefcase className="w-4 h-4 text-[#F59E0B]" strokeWidth={2} />
                              <span className="text-xs text-[#6B7280]">Open Roles</span>
                            </div>
                            <p className="text-base text-[#111827] font-semibold">{industry.openRoles}</p>
                          </div>
                          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7DBBFF] text-white hover:bg-[#6aabef] transition-all text-sm font-medium" style={{ borderRadius: '10px' }}>
                            <Search className="w-4 h-4" strokeWidth={2} />
                            <span>Browse Roles</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════ MESSAGES TAB ═══════════ */}
      {activeTab === 'messages' && (
        <div className="bg-white border border-black/[0.08] overflow-hidden flex" style={{ borderRadius: '16px', height: '600px' }}>
          {/* Conversation List */}
          <div className="w-[320px] border-r border-black/[0.06] flex flex-col">
            <div className="p-4 border-b border-black/[0.06]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full px-4 py-2 pl-9 bg-[#F9FAFB] border border-black/[0.06] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7DBBFF]"
                  style={{ borderRadius: '10px' }}
                />
                <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={2} />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map(convo => (
                <button
                  key={convo.id}
                  onClick={() => setActiveConversation(convo.id)}
                  className={`w-full p-4 text-left border-b border-black/[0.04] transition-all ${
                    activeConversation === convo.id ? 'bg-[#7DBBFF]/5 border-l-2 border-l-[#7DBBFF]' : 'hover:bg-[#FAFBFC]'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7DBBFF]/20 to-[#8B5CF6]/20 flex items-center justify-center shrink-0 border border-black/[0.06]">
                      <Building2 className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`text-sm truncate ${convo.unread ? 'text-[#111827] font-semibold' : 'text-[#111827] font-medium'}`}>{convo.company}</p>
                        {convo.unread && <div className="w-2 h-2 rounded-full bg-[#7DBBFF] shrink-0" />}
                      </div>
                      <p className="text-xs text-[#6B7280] mb-1">{convo.contactName} · {convo.contactRole}</p>
                      <p className={`text-xs truncate ${convo.unread ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>{convo.lastMessage}</p>
                      <p className="text-[10px] text-[#9CA3AF] mt-1">{convo.lastMessageTime}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          {activeConvo ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-black/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7DBBFF]/20 to-[#8B5CF6]/20 flex items-center justify-center border border-black/[0.06]">
                    <Building2 className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm text-[#111827] font-semibold">{activeConvo.company}</p>
                    <p className="text-xs text-[#6B7280]">{activeConvo.contactName} · {activeConvo.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-[#6B7280] hover:bg-[#F9F9FA] transition-all" style={{ borderRadius: '8px' }}>
                    <Phone className="w-4 h-4" strokeWidth={2} />
                  </button>
                  <button className="p-2 text-[#6B7280] hover:bg-[#F9F9FA] transition-all" style={{ borderRadius: '8px' }}>
                    <Video className="w-4 h-4" strokeWidth={2} />
                  </button>
                  <button className="p-2 text-[#6B7280] hover:bg-[#F9F9FA] transition-all" style={{ borderRadius: '8px' }}>
                    <Info className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {activeConvo.messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-3 ${
                      msg.sender === 'you'
                        ? 'bg-[#7DBBFF] text-white'
                        : 'bg-[#F3F4F6] text-[#111827]'
                    }`} style={{ borderRadius: msg.sender === 'you' ? '14px 14px 4px 14px' : '14px 14px 14px 4px' }}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-1.5 ${msg.sender === 'you' ? 'text-white/60' : 'text-[#9CA3AF]'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-black/[0.06]">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-[#F9FAFB] border border-black/[0.06] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7DBBFF]"
                    style={{ borderRadius: '10px' }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && chatInput.trim()) {
                        showToast(`Message sent to ${activeConvo.company}`);
                        setChatInput('');
                      }
                    }}
                  />
                  <button
                    onClick={() => { if (chatInput.trim()) { showToast(`Message sent to ${activeConvo.company}`); setChatInput(''); } }}
                    className="p-2.5 bg-[#7DBBFF] text-white hover:bg-[#6aabef] transition-all"
                    style={{ borderRadius: '10px' }}
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
