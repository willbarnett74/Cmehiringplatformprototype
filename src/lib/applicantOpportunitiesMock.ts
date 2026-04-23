/**
 * Static pipeline data shared by OpportunitiesPage and the applicant dashboard
 * until roles/matches are backed by Supabase.
 */

export type PipelineStage = 'discovered' | 'applied' | 'interviewing' | 'offer';

export interface ApplicantPipelineItem {
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
  /** Shown on dashboard row: employment type */
  employmentType?: string;
  /** Shown on dashboard row: industry/sector */
  sector?: string;
}

export const applicantPipelineMockData: ApplicantPipelineItem[] = [
  { id: 1, company: 'TechFlow Inc.', role: 'Senior Product Designer', location: 'San Francisco, CA', matchScore: 94, stage: 'interviewing', lastUpdate: '2 hours ago', nextAction: 'Final round — Feb 18', interviewDate: 'Feb 18, 2:00 PM PST', contactPerson: 'Sarah Chen', unreadMessages: 2, saved: true, employmentType: 'Full-time', sector: 'SaaS' },
  { id: 2, company: 'DesignHub', role: 'Lead UX Designer', location: 'New York, NY', matchScore: 89, stage: 'interviewing', lastUpdate: '1 day ago', nextAction: 'Technical interview — Feb 20', interviewDate: 'Feb 20, 10:00 AM EST', contactPerson: 'Marcus Lee', unreadMessages: 0, saved: false, employmentType: 'Full-time', sector: 'Design' },
  { id: 3, company: 'Notion', role: 'Product Designer', location: 'San Francisco, CA', matchScore: 96, stage: 'applied', lastUpdate: '3 days ago', nextAction: 'Application in review', unreadMessages: 1, saved: true, employmentType: 'Full-time', sector: 'SaaS' },
  { id: 4, company: 'Linear', role: 'Design Engineer', location: 'Remote', matchScore: 93, stage: 'discovered', lastUpdate: '1 week ago', nextAction: 'Strong match — consider applying', unreadMessages: 0, saved: false, employmentType: 'Full-time', sector: 'DevTools' },
  { id: 5, company: 'InnovateCo', role: 'Product Designer', location: 'Austin, TX', matchScore: 87, stage: 'applied', lastUpdate: '5 days ago', nextAction: 'Shortlisted by hiring manager', unreadMessages: 0, saved: false, employmentType: 'Full-time', sector: 'Technology' },
  { id: 6, company: 'Figma', role: 'Senior Product Designer', location: 'San Francisco, CA', matchScore: 91, stage: 'applied', lastUpdate: '1 week ago', nextAction: 'Application in review', unreadMessages: 0, saved: true, employmentType: 'Full-time', sector: 'Design' },
  { id: 7, company: 'CreativeMinds', role: 'Senior Designer', location: 'Remote', matchScore: 85, stage: 'discovered', lastUpdate: '2 weeks ago', nextAction: 'Viewed your profile', unreadMessages: 0, saved: false, employmentType: 'Contract', sector: 'Agency' },
  { id: 8, company: 'Stripe', role: 'Product Design Lead', location: 'Remote', matchScore: 88, stage: 'offer', lastUpdate: '1 day ago', nextAction: 'Offer received — review terms', unreadMessages: 3, saved: true, employmentType: 'Full-time', sector: 'Fintech' },
];

export function fitLabelAndColor(fit: number): { label: string; color: string } {
  if (fit >= 85) return { label: 'Excellent fit', color: '#10B981' };
  if (fit >= 70) return { label: 'Strong fit', color: '#10B981' };
  if (fit >= 55) return { label: 'Good fit', color: '#7dbbff' };
  return { label: 'Partial fit', color: '#F59E0B' };
}
