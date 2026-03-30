import { X, MapPin, Briefcase, Mail, Phone, Linkedin, Star, MessageSquare, FileText, ArrowRight, Copy, Sparkles, Building2, Download, Share2, Calendar, Award, TrendingUp, Target, Users, Zap, Brain, Heart, Palette, CheckCircle2, ArrowUpRight, ExternalLink } from 'lucide-react';
import { Candidate } from '../types/employer';
import { useState } from 'react';

interface CandidateProfileViewProps {
  candidate: Candidate;
  onClose: () => void;
  onMoveToNextStage: (candidateId: number) => void;
  onAddNote: (candidateId: number) => void;
}

export function CandidateProfileView({ candidate, onClose, onMoveToNextStage, onAddNote }: CandidateProfileViewProps) {
  const [activeSection, setActiveSection] = useState('overview');
  const [isShortlisted, setIsShortlisted] = useState(false);

  const getFitLevel = (score: number): { label: string; color: string; bgColor: string } => {
    if (score >= 90) return { label: 'Strong Fit', color: 'text-[#34D399]', bgColor: 'bg-[#34D399]/10' };
    if (score >= 85) return { label: 'Moderate Fit', color: 'text-[#3B82F6]', bgColor: 'bg-[#3B82F6]/10' };
    return { label: 'Limited Fit', color: 'text-[#9CA3AF]', bgColor: 'bg-[#9CA3AF]/10' };
  };

  const fitLevel = getFitLevel(candidate.score);

  const sections = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'traits', label: 'Signature Traits', icon: Sparkles },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'assessments', label: 'Assessments', icon: Award },
    { id: 'insights', label: 'Insights', icon: Brain },
    { id: 'documents', label: 'CV / Documents', icon: FileText },
  ];

  const traitClusters = [
    { name: 'Self-Management', value: 92, color: '#7DBBFF' },
    { name: 'Collaboration', value: 88, color: '#8B5CF6' },
    { name: 'Adaptability', value: 85, color: '#14B8A6' },
    { name: 'Creativity', value: 90, color: '#F59E0B' },
  ];

  const strengths = [
    { label: 'Autonomous Execution', description: 'Thrives with minimal oversight' },
    { label: 'Learning Velocity', description: 'Rapid skill acquisition' },
    { label: 'Team Synergy', description: 'Natural collaborator' },
  ];

  const growthAreas = [
    { label: 'Public Speaking', description: 'Building confidence in large groups' },
    { label: 'Strategic Planning', description: 'Developing long-term thinking' },
  ];

  const assessmentResults = [
    { title: 'Cognitive Agility', score: 92, percentile: 'Top 15%', description: 'Pattern recognition and problem-solving' },
    { title: 'Design Challenge', score: 88, percentile: 'Top 22%', description: 'Practical application and creativity' },
    { title: 'Culture Fit', score: 95, percentile: 'Top 8%', description: 'Alignment with team values' },
  ];

  const experiences = [
    {
      role: 'Senior Designer',
      company: 'TechCorp',
      duration: '2022 - Present',
      years: '2 yrs',
      outcomes: [
        'Led design system overhaul for 50+ product teams',
        'Increased design consistency by 85%',
        'Mentored 5 junior designers',
      ],
      color: '#7DBBFF',
    },
    {
      role: 'Product Designer',
      company: 'StartupXYZ',
      duration: '2020 - 2022',
      years: '2 yrs',
      outcomes: [
        'Designed user onboarding flow that increased activation rate by 40%',
        'Shipped 12+ major features',
        'Established design critique culture',
      ],
      color: '#8B5CF6',
    },
    {
      role: 'UX Designer',
      company: 'Agency Co',
      duration: '2018 - 2020',
      years: '2 yrs',
      outcomes: [
        'Delivered projects for 15+ clients',
        'Specialized in e-commerce and SaaS',
      ],
      color: '#14B8A6',
    },
  ];

  const insights = [
    {
      title: 'Motivation Drivers',
      icon: Heart,
      items: ['Autonomy & ownership', 'Continuous learning', 'Collaborative culture', 'Meaningful impact'],
      color: '#F59E0B',
    },
    {
      title: 'Ideal Work Environment',
      icon: Users,
      items: ['Feedback-oriented teams', 'Flexible work arrangements', 'Design-led organizations', 'Cross-functional collaboration'],
      color: '#7DBBFF',
    },
    {
      title: 'Communication Style',
      icon: MessageSquare,
      items: ['Transparent & direct', 'Thoughtful responses', 'Active listener', 'Written clarity'],
      color: '#8B5CF6',
    },
    {
      title: 'Decision-Making Approach',
      icon: Target,
      items: ['Data-informed', 'User-centric', 'Iterative refinement', 'Collaborative input'],
      color: '#14B8A6',
    },
  ];

  return (
    <div className="fixed inset-0 bg-[#F9F9FA] z-50 flex">
      {/* Left Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-black/[0.08] p-6 flex flex-col overflow-y-auto">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] mb-8 transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={2} />
          <span className="text-sm font-medium">Back to Search</span>
        </button>

        <nav className="flex-1 space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-[#7DBBFF]/10 text-[#7DBBFF]'
                    : 'text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827]'
                }`}
                style={{ borderRadius: '10px' }}
              >
                <Icon className="w-4 h-4" strokeWidth={2} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-black/[0.08]">
          <p className="text-xs text-[#9CA3AF] mb-2">Profile Completeness</p>
          <div className="w-full h-2 bg-black/[0.06] overflow-hidden" style={{ borderRadius: '4px' }}>
            <div className="h-full bg-[#7DBBFF]" style={{ width: '85%', borderRadius: '4px' }} />
          </div>
          <p className="text-xs text-[#6B7280] mt-2">85% Complete</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {/* Header with Cover Gradient */}
          <div className="relative">
            <div className="h-32 bg-gradient-to-r from-[#7DBBFF]/20 via-[#8B5CF6]/20 to-[#14B8A6]/20" />
            
            <div className="bg-white border-b border-black/[0.08]">
              <div className="max-w-5xl mx-auto px-8 -mt-16">
                {/* Profile Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 rounded-full bg-[#7DBBFF] flex items-center justify-center text-white text-2xl font-semibold shadow-lg ring-4 ring-white">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="pt-4">
                      <h1 className="text-2xl text-[#111827] font-semibold mb-2">{candidate.name}</h1>
                      <p className="text-base text-[#6B7280] mb-3">{candidate.role}</p>
                      <p className="text-sm text-[#7DBBFF] italic mb-4">
                        Driven by learning, thrives in cross-functional teams
                      </p>
                      
                      {/* Tags and Fit Level */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1.5 ${fitLevel.bgColor} ${fitLevel.color} font-semibold text-xs`} style={{ borderRadius: '8px' }}>
                          {fitLevel.label}
                        </span>
                        <span className="px-3 py-1.5 bg-[#34D399]/10 text-[#34D399] font-medium text-xs" style={{ borderRadius: '8px' }}>
                          Open to Opportunities
                        </span>
                        <span className="px-3 py-1.5 bg-[#3B82F6]/10 text-[#3B82F6] font-medium text-xs" style={{ borderRadius: '8px' }}>
                          Remote-ready
                        </span>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F9F9FA] text-[#6B7280] text-xs" style={{ borderRadius: '8px' }}>
                          <MapPin className="w-3 h-3" strokeWidth={1.5} />
                          <span>{candidate.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 pt-4">
                    <button
                      onClick={() => setIsShortlisted(!isShortlisted)}
                      className={`px-4 py-2 border text-[#111827] hover:bg-[#F9F9FA] transition-all text-sm font-medium flex items-center gap-2 ${
                        isShortlisted
                          ? 'border-[#7DBBFF] shadow-[0_0_0_3px_rgba(125,187,255,0.1)]'
                          : 'border-black/[0.08] hover:border-[#7DBBFF]/30'
                      }`}
                      style={{ borderRadius: '10px' }}
                    >
                      <Star className="w-4 h-4" strokeWidth={2} fill={isShortlisted ? '#7DBBFF' : 'none'} />
                      <span>Shortlist</span>
                    </button>
                    <button
                      onClick={() => onAddNote(candidate.id)}
                      className="px-4 py-2 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] hover:border-[#7DBBFF]/30 transition-all text-sm font-medium flex items-center gap-2"
                      style={{ borderRadius: '10px' }}
                    >
                      <MessageSquare className="w-4 h-4" strokeWidth={2} />
                      <span>Add Note</span>
                    </button>
                    <button
                      className="px-4 py-2 bg-[#7DBBFF] text-white hover:bg-[#6aabef] hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                      style={{ borderRadius: '10px' }}
                    >
                      <ArrowRight className="w-4 h-4" strokeWidth={2} />
                      <span>Invite to Assessment</span>
                    </button>
                  </div>
                </div>

                {/* Contact Info Row */}
                <div className="flex items-center gap-6 pb-6">
                  <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <Mail className="w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
                    <span>{candidate.name.toLowerCase().replace(' ', '.')}@email.com</span>
                    <button className="p-1 hover:bg-[#F9F9FA] transition-colors" style={{ borderRadius: '4px' }}>
                      <Copy className="w-3 h-3 text-[#9CA3AF]" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                    <Phone className="w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
                    <span>+1 (555) 123-4567</span>
                    <button className="p-1 hover:bg-[#F9F9FA] transition-colors" style={{ borderRadius: '4px' }}>
                      <Copy className="w-3 h-3 text-[#9CA3AF]" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Linkedin className="w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
                    <a href="#" className="text-[#7DBBFF] hover:text-[#6aabef] transition-colors">
                      linkedin.com/in/{candidate.name.toLowerCase().replace(' ', '-')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="max-w-5xl mx-auto px-8 py-8 pb-32">{/* Added pb-32 for footer clearance */}
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Profile Summary */}
                <div className="p-5 bg-[#F9F9FA] border border-black/[0.08]" style={{ borderRadius: '16px' }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-[#7DBBFF]" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#111827] mb-1">Profile Summary</p>
                      <p className="text-sm text-[#6B7280] leading-relaxed">
                        Based on CMe data, {candidate.name.split(' ')[0]} performs best in flexible, design-led teams with strong feedback cultures. Shows exceptional learning velocity and collaborative mindset.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Career Readiness & Growth */}
                <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                  <div className="flex items-center gap-2 mb-5">
                    <Sparkles className="w-5 h-5 text-[#7DBBFF]" strokeWidth={2} />
                    <h2 className="text-base text-[#111827] font-semibold">Career Readiness & Growth</h2>
                  </div>

                  {(() => {
                    const exp = candidate.totalExperience ?? 0;
                    const hasReadinessData = candidate.transitioning || candidate.openToChange || candidate.readyToStepUp || candidate.retrained || exp > 0;

                    if (!hasReadinessData) {
                      return (
                        <div className="p-4 bg-[#F9F9FA] border border-black/[0.08] text-center" style={{ borderRadius: '12px' }}>
                          <p className="text-sm text-[#9CA3AF] italic">
                            No readiness information shared by this candidate.
                          </p>
                        </div>
                      );
                    }

                    // Determine career stage
                    let stageLabel = '';
                    let stageSubtitle = '';
                    
                    if (candidate.transitioning) {
                      stageLabel = 'Career Transition / Returner';
                      stageSubtitle = 'Currently transitioning or returning to workforce';
                    } else if (exp <= 2) {
                      stageLabel = 'Early Career';
                      stageSubtitle = `${exp} ${exp === 1 ? 'year' : 'years'} of experience`;
                    } else if (exp <= 5) {
                      stageLabel = 'Developing';
                      stageSubtitle = `${exp} years of experience`;
                    } else if (exp <= 10) {
                      stageLabel = 'Established';
                      stageSubtitle = `${exp} years of experience`;
                    } else {
                      stageLabel = 'Experienced';
                      stageSubtitle = `${exp}+ years of experience`;
                    }

                    return (
                      <div className="space-y-4">
                        {/* Career Stage - Large Chip */}
                        <div>
                          <label className="block text-xs text-[#6B7280] font-medium mb-2">Career Stage</label>
                          <div className="inline-flex flex-col p-4 bg-[#E8F2FF] border-2 border-[#7DBBFF]/30" style={{ borderRadius: '12px' }}>
                            <span className="text-sm font-semibold text-[#7DBBFF] mb-1">{stageLabel}</span>
                            <span className="text-xs text-[#7DBBFF]/80">{stageSubtitle}</span>
                          </div>
                        </div>

                        {/* Readiness Tags */}
                        {(candidate.openToChange || candidate.readyToStepUp || candidate.retrained) && (
                          <div>
                            <label className="block text-xs text-[#6B7280] font-medium mb-3">Readiness Indicators</label>
                            <div className="flex flex-wrap gap-2">
                              {candidate.openToChange && (
                                <div className="flex items-start gap-2 p-3 bg-[#F3E8FF] border border-[#8B5CF6]/20" style={{ borderRadius: '10px' }}>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-[#8B5CF6] mb-0.5">Open to Career Change</p>
                                    <p className="text-xs text-[#8B5CF6]/70">Exploring new career paths and opportunities</p>
                                  </div>
                                </div>
                              )}
                              
                              {candidate.readyToStepUp && (
                                <div className="flex items-start gap-2 p-3 bg-[#D1FAE5] border border-[#10B981]/20" style={{ borderRadius: '10px' }}>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-[#10B981] mb-0.5">Ready to Step Up</p>
                                    <p className="text-xs text-[#10B981]/70">Actively seeking leadership opportunities</p>
                                  </div>
                                </div>
                              )}
                              
                              {candidate.retrained && (
                                <div className="flex items-start gap-2 p-3 bg-[#FEF3C7] border border-[#F59E0B]/20" style={{ borderRadius: '10px' }}>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-[#F59E0B] mb-0.5">Recently Retrained</p>
                                    <p className="text-xs text-[#F59E0B]/70">Recently completed reskilling or upskilling</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Total Experience Breakdown */}
                        {exp > 0 && (
                          <div className="pt-4 border-t border-black/[0.06]">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-[#6B7280]">Total Work Experience</span>
                              <span className="text-sm font-semibold text-[#111827]">{exp} {exp === 1 ? 'year' : 'years'}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Trait Cluster Visualization */}
                <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                  <h2 className="text-base text-[#111827] font-semibold mb-5">Trait Clusters</h2>
                  <div className="grid grid-cols-2 gap-6">
                    {traitClusters.map((cluster) => (
                      <div key={cluster.name}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-[#111827] font-medium">{cluster.name}</span>
                          <span className="text-sm font-semibold" style={{ color: cluster.color }}>{cluster.value}%</span>
                        </div>
                        <div className="w-full h-2 bg-black/[0.06] overflow-hidden" style={{ borderRadius: '4px' }}>
                          <div
                            className="h-full transition-all duration-500"
                            style={{ width: `${cluster.value}%`, backgroundColor: cluster.color, borderRadius: '4px' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths and Growth Areas */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Strengths */}
                  <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-[#34D399]" strokeWidth={2} />
                      <h3 className="text-base text-[#111827] font-semibold">Core Strengths</h3>
                    </div>
                    <div className="space-y-3">
                      {strengths.map((strength, idx) => (
                        <div key={idx} className="p-3 bg-[#34D399]/5 border border-[#34D399]/10" style={{ borderRadius: '10px' }}>
                          <p className="text-sm text-[#111827] font-medium mb-1">{strength.label}</p>
                          <p className="text-xs text-[#6B7280]">{strength.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Growth Areas */}
                  <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-[#3B82F6]" strokeWidth={2} />
                      <h3 className="text-base text-[#111827] font-semibold">Growth Areas</h3>
                    </div>
                    <div className="space-y-3">
                      {growthAreas.map((area, idx) => (
                        <div key={idx} className="p-3 bg-[#3B82F6]/5 border border-[#3B82F6]/10" style={{ borderRadius: '10px' }}>
                          <p className="text-sm text-[#111827] font-medium mb-1">{area.label}</p>
                          <p className="text-xs text-[#6B7280]">{area.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Signature Traits Section */}
            {activeSection === 'traits' && (
              <div className="space-y-6">
                <h2 className="text-lg text-[#111827] font-semibold">Signature Traits</h2>

                {/* Grouped Traits */}
                <div className="space-y-6">
                  {['Collaboration', 'Cognition', 'Execution'].map((group) => (
                    <div key={group} className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                      <h3 className="text-sm text-[#111827] font-semibold mb-4">{group}</h3>
                      <div className="flex flex-wrap gap-2">
                        {candidate.traits.slice(0, 3).map((trait, idx) => (
                          <div
                            key={`${group}-${idx}`}
                            className="group relative px-4 py-2.5 bg-[#7DBBFF]/10 text-[#7DBBFF] text-sm font-medium hover:bg-[#7DBBFF]/20 transition-all cursor-pointer"
                            style={{ borderRadius: '10px' }}
                          >
                            <div className="flex items-center gap-2">
                              <span>{trait}</span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3].map((dot) => (
                                  <div
                                    key={dot}
                                    className={`w-1 h-1 rounded-full ${
                                      dot <= 2 ? 'bg-[#7DBBFF]' : 'bg-[#7DBBFF]/30'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#111827] text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ borderRadius: '8px' }}>
                              High strength indicator
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#111827] transform rotate-45" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Section */}
            {activeSection === 'experience' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg text-[#111827] font-semibold">Work Experience</h2>
                  <button className="text-sm text-[#7DBBFF] hover:text-[#6aabef] font-medium flex items-center gap-1">
                    <span>View Full CV</span>
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>

                {/* Timeline */}
                <div className="relative space-y-6">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-6 bottom-6 w-px bg-black/[0.08]" />

                  {experiences.map((exp, idx) => (
                    <div key={idx} className="relative bg-white p-6 border border-black/[0.08] shadow-sm hover:border-[#7DBBFF]/30 transition-colors" style={{ borderRadius: '16px' }}>
                      <div className="flex items-start gap-4">
                        {/* Company Icon */}
                        <div className="relative z-10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${exp.color}20` }}>
                          <Building2 className="w-6 h-6" style={{ color: exp.color }} strokeWidth={1.5} />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-base text-[#111827] font-semibold mb-1">{exp.role}</h3>
                              <p className="text-sm text-[#6B7280] mb-2">{exp.company}</p>
                              <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                                <Calendar className="w-3 h-3" strokeWidth={1.5} />
                                <span>{exp.duration}</span>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 bg-[#F9F9FA] text-[#6B7280] text-xs font-medium" style={{ borderRadius: '6px' }}>
                              {exp.years}
                            </span>
                          </div>

                          {/* Outcomes */}
                          <div className="space-y-2">
                            {exp.outcomes.map((outcome, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#7DBBFF] mt-1.5 shrink-0" />
                                <p className="text-sm text-[#6B7280]">{outcome}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assessments Section */}
            {activeSection === 'assessments' && (
              <div className="space-y-6">
                <h2 className="text-lg text-[#111827] font-semibold">Assessment Results</h2>

                <div className="grid grid-cols-3 gap-4">
                  {assessmentResults.map((assessment, idx) => (
                    <div key={idx} className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                      <div className="flex items-center justify-between mb-3">
                        <Award className="w-5 h-5 text-[#7DBBFF]" strokeWidth={2} />
                        <span className="px-2 py-1 bg-[#34D399]/10 text-[#34D399] text-xs font-semibold" style={{ borderRadius: '6px' }}>
                          {assessment.percentile}
                        </span>
                      </div>
                      <h3 className="text-sm text-[#111827] font-semibold mb-1">{assessment.title}</h3>
                      <p className="text-3xl text-[#7DBBFF] font-semibold mb-2">{assessment.score}</p>
                      <p className="text-xs text-[#6B7280]">{assessment.description}</p>

                      {/* Progress Bar */}
                      <div className="mt-4 w-full h-2 bg-black/[0.06] overflow-hidden" style={{ borderRadius: '4px' }}>
                        <div
                          className="h-full bg-[#7DBBFF]"
                          style={{ width: `${assessment.score}%`, borderRadius: '4px' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights Section */}
            {activeSection === 'insights' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg text-[#111827] font-semibold">Psychological & Motivational Insights</h2>
                  <span className="text-xs text-[#9CA3AF]">Generated from CMe Assessments</span>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {insights.map((insight, idx) => {
                    const Icon = insight.icon;
                    return (
                      <div key={idx} className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${insight.color}20` }}>
                            <Icon className="w-4 h-4" style={{ color: insight.color }} strokeWidth={2} />
                          </div>
                          <h3 className="text-sm text-[#111827] font-semibold">{insight.title}</h3>
                        </div>
                        <ul className="space-y-2">
                          {insight.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: insight.color }} />
                              <span className="text-sm text-[#6B7280]">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Documents Section */}
            {activeSection === 'documents' && (
              <div className="space-y-6">
                <h2 className="text-lg text-[#111827] font-semibold">CV / Documents</h2>

                <div className="grid grid-cols-2 gap-4">
                  {/* CV Card */}
                  <div className="bg-white p-5 border border-black/[0.08] shadow-sm hover:border-[#7DBBFF]/30 transition-colors cursor-pointer" style={{ borderRadius: '16px' }}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#7DBBFF]/10 flex items-center justify-center shrink-0">
                        <FileText className="w-6 h-6 text-[#7DBBFF]" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm text-[#111827] font-semibold mb-1">Resume.pdf</h3>
                        <p className="text-xs text-[#6B7280] mb-3">Updated Feb 2026 • 245 KB</p>
                        <button className="text-xs text-[#7DBBFF] hover:text-[#6aabef] font-medium flex items-center gap-1">
                          <Download className="w-3 h-3" strokeWidth={2} />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio */}
                  <div className="bg-white p-5 border border-black/[0.08] shadow-sm hover:border-[#7DBBFF]/30 transition-colors cursor-pointer" style={{ borderRadius: '16px' }}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                        <Palette className="w-6 h-6 text-[#8B5CF6]" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm text-[#111827] font-semibold mb-1">Portfolio</h3>
                        <p className="text-xs text-[#6B7280] mb-3">Behance • 24 projects</p>
                        <a href="#" className="text-xs text-[#7DBBFF] hover:text-[#6aabef] font-medium flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" strokeWidth={2} />
                          <span>View Portfolio</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* External Links */}
                <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '16px' }}>
                  <h3 className="text-sm text-[#111827] font-semibold mb-4">External Profiles</h3>
                  <div className="space-y-3">
                    <a href="#" className="flex items-center justify-between p-3 bg-[#F9F9FA] hover:bg-[#7DBBFF]/5 transition-colors" style={{ borderRadius: '10px' }}>
                      <div className="flex items-center gap-3">
                        <Linkedin className="w-4 h-4 text-[#0077B5]" strokeWidth={1.5} />
                        <span className="text-sm text-[#111827]">LinkedIn Profile</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
                    </a>
                    <a href="#" className="flex items-center justify-between p-3 bg-[#F9F9FA] hover:bg-[#7DBBFF]/5 transition-colors" style={{ borderRadius: '10px' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded bg-[#111827]" />
                        <span className="text-sm text-[#111827]">GitHub</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="fixed bottom-0 right-0 left-64 bg-white border-t border-black/[0.08] px-8 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onAddNote(candidate.id)}
                className="px-5 py-2.5 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] hover:border-[#7DBBFF]/30 transition-all text-sm font-medium flex items-center gap-2"
                style={{ borderRadius: '10px' }}
              >
                <MessageSquare className="w-4 h-4" strokeWidth={2} />
                <span>Add Note</span>
              </button>
              <button className="px-5 py-2.5 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] hover:border-[#7DBBFF]/30 transition-all text-sm font-medium flex items-center gap-2" style={{ borderRadius: '10px' }}>
                <Share2 className="w-4 h-4" strokeWidth={2} />
                <span>Share Profile</span>
              </button>
              <button className="px-5 py-2.5 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] hover:border-[#7DBBFF]/30 transition-all text-sm font-medium flex items-center gap-2" style={{ borderRadius: '10px' }}>
                <Download className="w-4 h-4" strokeWidth={2} />
                <span>Download Summary</span>
              </button>
            </div>
            <button
              onClick={() => {
                onMoveToNextStage(candidate.id);
                onClose();
              }}
              className="px-6 py-2.5 bg-[#7DBBFF] text-white hover:bg-[#6aabef] hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
              style={{ borderRadius: '10px' }}
            >
              <span>Invite to Interview</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}