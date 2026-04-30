/**
 * Static opportunity data shared by OpportunitiesPage and the applicant dashboard
 * until engagements, engagement_messages, and engagement_events are backed by Supabase.
 */

export type EmployerLikeStage =
  | 'discovered'
  | 'contacted'
  | 'responded'
  | 'interviewing'
  | 'decision'
  | 'hired'
  | 'rejected';

export type ApplicantLifecycleLabel =
  | 'Matched'
  | 'Reached out'
  | 'Responded'
  | 'Interviewing'
  | 'Decision'
  | 'Hired'
  | 'Not selected';

export type ApplicantCTAState =
  | 'reply'
  | 'show-interest'
  | 'schedule'
  | 'review-decision'
  | 'view-summary'
  | 'closed';

export const applicantLifecycleConfig: Record<
  EmployerLikeStage,
  { label: ApplicantLifecycleLabel; color: string; bg: string }
> = {
  discovered: { label: 'Matched', color: '#64748B', bg: 'rgba(100,116,139,0.12)' },
  contacted: { label: 'Reached out', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' },
  responded: { label: 'Responded', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
  interviewing: { label: 'Interviewing', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
  decision: { label: 'Decision', color: '#0EA5E9', bg: 'rgba(14,165,233,0.12)' },
  hired: { label: 'Hired', color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  rejected: { label: 'Not selected', color: '#6B7280', bg: 'rgba(107,114,128,0.12)' },
};

export interface ApplicantOpportunityMessage {
  id: string;
  sender: 'applicant' | 'business';
  body: string;
  sentAt: string;
  read: boolean;
}

export interface ApplicantOpportunityEvent {
  id: string;
  label: string;
  description: string;
  happenedAt: string;
  type: 'match' | 'view' | 'reach-out' | 'response' | 'interview' | 'decision';
}

export interface ApplicantOpportunity {
  id: number;
  engagementId: string;
  business: {
    name: string;
    industry: string;
    size: string;
    intro: string;
  };
  role: {
    title: string;
    location: string;
    employmentType: string;
    sector: string;
  };
  contact: {
    name: string;
    title: string;
  };
  matchScore: number;
  status: EmployerLikeStage;
  reachOutMessage: string;
  unread: boolean;
  lastUpdate: string;
  whyMatches: string[];
  messages: ApplicantOpportunityMessage[];
  timeline: ApplicantOpportunityEvent[];
  nextAction: {
    label: string;
    description: string;
    ctaLabel: string;
    state: ApplicantCTAState;
  };
  applicantResponseState: 'not-responded' | 'interested' | 'asked-question' | 'declined' | 'complete';
  saved: boolean;
  /** Compatibility fields for older dashboard/list call sites while the UI moves to Opportunity. */
  company: string;
  location: string;
  employmentType: string;
  sector: string;
  unreadMessages: number;
}

export const applicantOpportunitiesMockData: ApplicantOpportunity[] = [
  {
    id: 1,
    engagementId: 'eng-techflow-alex-001',
    business: {
      name: 'TechFlow Inc.',
      industry: 'SaaS & Productivity',
      size: '51-200',
      intro:
        'TechFlow builds workflow automation tools for product teams and is growing its design systems practice.',
    },
    role: {
      title: 'Senior Product Designer',
      location: 'San Francisco, CA',
      employmentType: 'Full-time',
      sector: 'SaaS',
    },
    contact: { name: 'Sarah Chen', title: 'Head of Design' },
    matchScore: 94,
    status: 'contacted',
    reachOutMessage:
      'Hi Alex, your systems thinking and ownership signals stood out. I would love to share more about our Senior Product Designer role and learn what you want next.',
    unread: true,
    lastUpdate: '2 hours ago',
    whyMatches: [
      'Your ownership and follow-through score maps to the team lead expectations for this role.',
      'Your profile highlights structuring ambiguous problems into clear product decisions.',
      'You prefer autonomy with visible impact, which matches TechFlow’s small product squads.',
    ],
    messages: [
      {
        id: 'msg-techflow-1',
        sender: 'business',
        body:
          'Hi Alex, your systems thinking and ownership signals stood out. I would love to share more about our Senior Product Designer role and learn what you want next.',
        sentAt: 'Today, 9:12 AM',
        read: false,
      },
    ],
    timeline: [
      {
        id: 'evt-techflow-match',
        label: 'Matched',
        description: 'CMe identified TechFlow as a high-fit business for your profile.',
        happenedAt: 'Yesterday',
        type: 'match',
      },
      {
        id: 'evt-techflow-view',
        label: 'Profile viewed',
        description: 'Sarah Chen reviewed your profile and trait summary.',
        happenedAt: 'Today, 8:54 AM',
        type: 'view',
      },
      {
        id: 'evt-techflow-contacted',
        label: 'Reached out',
        description: 'TechFlow sent an intro message about the Senior Product Designer role.',
        happenedAt: 'Today, 9:12 AM',
        type: 'reach-out',
      },
    ],
    nextAction: {
      label: 'Business is waiting for your response',
      description: 'Reply, show interest, or ask a question to keep this opportunity moving.',
      ctaLabel: "I'm interested",
      state: 'show-interest',
    },
    applicantResponseState: 'not-responded',
    saved: true,
    company: 'TechFlow Inc.',
    location: 'San Francisco, CA',
    employmentType: 'Full-time',
    sector: 'SaaS',
    unreadMessages: 1,
  },
  {
    id: 2,
    engagementId: 'eng-designhub-alex-001',
    business: {
      name: 'DesignHub',
      industry: 'Design collaboration',
      size: '201-500',
      intro:
        'DesignHub helps creative teams manage design systems, critique, and product documentation in one workspace.',
    },
    role: {
      title: 'Lead UX Designer',
      location: 'New York, NY',
      employmentType: 'Full-time',
      sector: 'Design',
    },
    contact: { name: 'Marcus Lee', title: 'Design Director' },
    matchScore: 89,
    status: 'responded',
    reachOutMessage:
      'Your profile looks closely aligned with the Lead UX Designer role. Would you be open to a first conversation this week?',
    unread: false,
    lastUpdate: '1 day ago',
    whyMatches: [
      'The role needs a designer who can move between strategy and execution.',
      'Your communication and collaboration signals align with a cross-functional lead role.',
      'Your narrative shows comfort mentoring peers through ambiguous design decisions.',
    ],
    messages: [
      {
        id: 'msg-designhub-1',
        sender: 'business',
        body:
          'Your profile looks closely aligned with the Lead UX Designer role. Would you be open to a first conversation this week?',
        sentAt: 'Yesterday, 10:00 AM',
        read: true,
      },
      {
        id: 'msg-designhub-2',
        sender: 'applicant',
        body:
          'Thanks Marcus, I am interested. I would like to understand the team structure and what success looks like in the first six months.',
        sentAt: 'Yesterday, 12:18 PM',
        read: true,
      },
    ],
    timeline: [
      {
        id: 'evt-designhub-match',
        label: 'Matched',
        description: 'DesignHub matched strongly against your profile and preferred role types.',
        happenedAt: '3 days ago',
        type: 'match',
      },
      {
        id: 'evt-designhub-contacted',
        label: 'Reached out',
        description: 'Marcus Lee sent a first message.',
        happenedAt: 'Yesterday',
        type: 'reach-out',
      },
      {
        id: 'evt-designhub-responded',
        label: 'Responded',
        description: 'You replied and asked for more context.',
        happenedAt: 'Yesterday',
        type: 'response',
      },
    ],
    nextAction: {
      label: 'Waiting on business follow-up',
      description: 'Your response is in. DesignHub can now confirm the next conversation.',
      ctaLabel: 'Send follow-up',
      state: 'reply',
    },
    applicantResponseState: 'asked-question',
    saved: false,
    company: 'DesignHub',
    location: 'New York, NY',
    employmentType: 'Full-time',
    sector: 'Design',
    unreadMessages: 0,
  },
  {
    id: 3,
    engagementId: 'eng-notion-alex-001',
    business: {
      name: 'Notion',
      industry: 'SaaS & productivity',
      size: '500+',
      intro:
        'Notion creates connected workspaces for teams and individuals, with a focus on clarity, flexibility, and craft.',
    },
    role: {
      title: 'Product Designer',
      location: 'San Francisco, CA',
      employmentType: 'Full-time',
      sector: 'SaaS',
    },
    contact: { name: 'Alex Kim', title: 'Recruiting Lead' },
    matchScore: 96,
    status: 'discovered',
    reachOutMessage:
      'Notion has not reached out yet. This is a strong match surfaced from your profile signals.',
    unread: false,
    lastUpdate: '3 days ago',
    whyMatches: [
      'Your top traits fit product teams that value written clarity and craft.',
      'Your preferred role types overlap with Notion’s product design tracks.',
      'Your profile suggests strong comfort with ambiguous user problems.',
    ],
    messages: [],
    timeline: [
      {
        id: 'evt-notion-match',
        label: 'Matched',
        description: 'CMe found a strong business and role fit.',
        happenedAt: '3 days ago',
        type: 'match',
      },
    ],
    nextAction: {
      label: 'Strong match identified',
      description: 'Save this opportunity while CMe monitors for business activity.',
      ctaLabel: 'Save opportunity',
      state: 'view-summary',
    },
    applicantResponseState: 'not-responded',
    saved: true,
    company: 'Notion',
    location: 'San Francisco, CA',
    employmentType: 'Full-time',
    sector: 'SaaS',
    unreadMessages: 0,
  },
  {
    id: 4,
    engagementId: 'eng-linear-alex-001',
    business: {
      name: 'Linear',
      industry: 'Developer tools',
      size: '51-200',
      intro:
        'Linear builds issue tracking and product planning tools for high-performing software teams.',
    },
    role: {
      title: 'Design Engineer',
      location: 'Remote',
      employmentType: 'Full-time',
      sector: 'DevTools',
    },
    contact: { name: 'Nora Patel', title: 'Product Lead' },
    matchScore: 93,
    status: 'contacted',
    reachOutMessage:
      'Your mix of systems thinking and product design craft looks relevant to our Design Engineer opening. Open to learning more?',
    unread: true,
    lastUpdate: '1 week ago',
    whyMatches: [
      'Your systems thinking signal is high for a design engineering environment.',
      'The role rewards autonomy and deep product judgment.',
      'Your profile emphasizes solving complex workflows without losing clarity.',
    ],
    messages: [
      {
        id: 'msg-linear-1',
        sender: 'business',
        body:
          'Your mix of systems thinking and product design craft looks relevant to our Design Engineer opening. Open to learning more?',
        sentAt: 'Last week',
        read: false,
      },
    ],
    timeline: [
      {
        id: 'evt-linear-match',
        label: 'Matched',
        description: 'Linear appeared as a high-fit developer tools opportunity.',
        happenedAt: '2 weeks ago',
        type: 'match',
      },
      {
        id: 'evt-linear-contacted',
        label: 'Reached out',
        description: 'Nora Patel sent an introductory message.',
        happenedAt: '1 week ago',
        type: 'reach-out',
      },
    ],
    nextAction: {
      label: 'Decide whether to continue',
      description: 'Linear has reached out and is waiting on your signal.',
      ctaLabel: 'Reply',
      state: 'reply',
    },
    applicantResponseState: 'not-responded',
    saved: false,
    company: 'Linear',
    location: 'Remote',
    employmentType: 'Full-time',
    sector: 'DevTools',
    unreadMessages: 1,
  },
  {
    id: 5,
    engagementId: 'eng-stripe-alex-001',
    business: {
      name: 'Stripe',
      industry: 'Fintech',
      size: '500+',
      intro:
        'Stripe builds financial infrastructure for internet businesses and values clarity in complex product systems.',
    },
    role: {
      title: 'Product Design Lead',
      location: 'Remote',
      employmentType: 'Full-time',
      sector: 'Fintech',
    },
    contact: { name: 'Jamie Rodriguez', title: 'Design Director' },
    matchScore: 88,
    status: 'decision',
    reachOutMessage:
      'The team enjoyed your portfolio review. We would like to discuss next steps and decision timing.',
    unread: true,
    lastUpdate: '1 day ago',
    whyMatches: [
      'The role needs a designer comfortable turning complex systems into usable flows.',
      'Your analytical framing aligns with payments and risk product work.',
      'Your impact motivation maps well to infrastructure used by many businesses.',
    ],
    messages: [
      {
        id: 'msg-stripe-1',
        sender: 'business',
        body:
          'The team enjoyed your portfolio review. We would like to discuss next steps and decision timing.',
        sentAt: '1 day ago',
        read: false,
      },
    ],
    timeline: [
      {
        id: 'evt-stripe-match',
        label: 'Matched',
        description: 'Stripe matched to your product systems and analytical strengths.',
        happenedAt: '2 weeks ago',
        type: 'match',
      },
      {
        id: 'evt-stripe-interview',
        label: 'Interviewing',
        description: 'Portfolio review completed with the design team.',
        happenedAt: '3 days ago',
        type: 'interview',
      },
      {
        id: 'evt-stripe-decision',
        label: 'Decision',
        description: 'The team is discussing next steps.',
        happenedAt: '1 day ago',
        type: 'decision',
      },
    ],
    nextAction: {
      label: 'Review decision update',
      description: 'Stripe has moved this opportunity into decision timing.',
      ctaLabel: 'Review update',
      state: 'review-decision',
    },
    applicantResponseState: 'interested',
    saved: true,
    company: 'Stripe',
    location: 'Remote',
    employmentType: 'Full-time',
    sector: 'Fintech',
    unreadMessages: 1,
  },
  {
    id: 6,
    engagementId: 'eng-figma-alex-001',
    business: {
      name: 'Figma',
      industry: 'Design tooling',
      size: '500+',
      intro:
        'Figma builds collaborative design products for teams creating interfaces, systems, and product workflows.',
    },
    role: {
      title: 'Senior Product Designer',
      location: 'San Francisco, CA',
      employmentType: 'Full-time',
      sector: 'Design',
    },
    contact: { name: 'Priya Shah', title: 'Recruiter' },
    matchScore: 91,
    status: 'interviewing',
    reachOutMessage:
      'We would like to schedule a portfolio conversation with the product design team.',
    unread: false,
    lastUpdate: '1 week ago',
    whyMatches: [
      'Your design systems experience lines up with the role focus.',
      'Your collaboration score supports highly cross-functional product work.',
      'Your career direction mentions design tools and high-craft product teams.',
    ],
    messages: [
      {
        id: 'msg-figma-1',
        sender: 'business',
        body: 'We would like to schedule a portfolio conversation with the product design team.',
        sentAt: '1 week ago',
        read: true,
      },
      {
        id: 'msg-figma-2',
        sender: 'applicant',
        body: 'Sounds great. I can do Tuesday or Thursday afternoon.',
        sentAt: '6 days ago',
        read: true,
      },
    ],
    timeline: [
      {
        id: 'evt-figma-match',
        label: 'Matched',
        description: 'Figma matched strongly on craft, collaboration, and role direction.',
        happenedAt: '2 weeks ago',
        type: 'match',
      },
      {
        id: 'evt-figma-contacted',
        label: 'Reached out',
        description: 'Priya Shah invited you to a portfolio conversation.',
        happenedAt: '1 week ago',
        type: 'reach-out',
      },
      {
        id: 'evt-figma-interview',
        label: 'Interviewing',
        description: 'Portfolio conversation is being scheduled.',
        happenedAt: '6 days ago',
        type: 'interview',
      },
    ],
    nextAction: {
      label: 'Schedule interview',
      description: 'Confirm a time for the portfolio conversation.',
      ctaLabel: 'Schedule interview',
      state: 'schedule',
    },
    applicantResponseState: 'interested',
    saved: true,
    company: 'Figma',
    location: 'San Francisco, CA',
    employmentType: 'Full-time',
    sector: 'Design',
    unreadMessages: 0,
  },
];

export function fitLabelAndColor(fit: number): { label: string; color: string } {
  if (fit >= 85) return { label: 'Excellent fit', color: '#10B981' };
  if (fit >= 70) return { label: 'Strong fit', color: '#10B981' };
  if (fit >= 55) return { label: 'Good fit', color: '#7dbbff' };
  return { label: 'Partial fit', color: '#F59E0B' };
}
