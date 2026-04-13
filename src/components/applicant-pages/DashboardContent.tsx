import { useState, useEffect } from 'react';
import { User, ArrowRight, Target, Brain, MapPin, Briefcase, GraduationCap, Clock, Award, ShieldCheck, Lightbulb, CheckCircle2, AlertCircle, BarChart3, Building2, Zap, MessageSquare, Users, TrendingUp, Flame, Eye } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { ensureApplicantProfile } from '../../lib/applicantPersistence';

interface DashboardContentProps {
  onProfileBuilderClick: (stepId?: number) => void;
}

export function DashboardContent({ onProfileBuilderClick }: DashboardContentProps) {
  const [name, setName] = useState('Alex Rivera');
  const [location, setLocation] = useState('San Francisco, CA');
  const [experienceYears, setExperienceYears] = useState('6 years');
  const [education, setEducation] = useState('B.A. Interaction Design');
  const [availability, setAvailability] = useState('Open to offers');
  const [summary, setSummary] = useState(
    'Experienced product designer specializing in early-stage startups with a focus on taking messy, ambiguous problems and building clean, scalable solutions. Thrives in environments that balance experimentation with clear accountability.',
  );
  const [intakeComplete, setIntakeComplete] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user?.id) return;

      const { data: profileRow } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', session.user.id)
        .maybeSingle();
      if (profileRow?.full_name) setName(profileRow.full_name);

      const profileId = await ensureApplicantProfile(supabase, session.user.id);
      if (!profileId) return;

      const { data } = await supabase
        .from('candidate_profiles')
        .select('location,experience_years,education_summary,availability,experience_narrative,intake_status')
        .eq('id', profileId)
        .maybeSingle();

      if (data) {
        if (data.location) setLocation(data.location);
        if (data.experience_years != null) setExperienceYears(`${data.experience_years} years`);
        if (data.education_summary) setEducation(data.education_summary);
        if (data.availability) setAvailability(data.availability);
        if (data.experience_narrative) setSummary(data.experience_narrative);
        if (data.intake_status === 'complete') setIntakeComplete(true);
      }
    });
  }, []);

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Main CTA Card */}
      <div className="bg-white p-6 border border-black/[0.08] shadow-sm mb-6" style={{ borderRadius: '20px' }}>
        <div className="flex items-center justify-between">
          {intakeComplete ? (
            <>
              <div>
                <h3 className="text-base text-[#111827] font-semibold mb-2">Your Profile is Ready</h3>
                <p className="text-sm text-[#6B7280]">Your trait scores have been computed — explore your results below</p>
              </div>
              <button
                onClick={() => onProfileBuilderClick()}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#10B981] text-white hover:bg-[#0ea572] transition-colors"
                style={{ borderRadius: '10px' }}
              >
                <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
                <span className="text-sm font-medium">View Profile</span>
              </button>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-base text-[#111827] font-semibold mb-2">Complete Your Intake</h3>
                <p className="text-sm text-[#6B7280]">Answer 8 short sections to build your trait profile and get matched</p>
              </div>
              <button
                onClick={() => onProfileBuilderClick(1)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#7dbbff] text-white hover:bg-[#6aabef] transition-colors"
                style={{ borderRadius: '10px' }}
              >
                <span className="text-sm font-medium">Start Intake</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Section 1: General Overview */}
      <div className="bg-white p-6 border border-black/[0.08] shadow-sm mb-6" style={{ borderRadius: '20px' }}>
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-[#7dbbff]" strokeWidth={2} />
          <h3 className="text-base text-[#111827] font-semibold">General Overview</h3>
        </div>

        <div className="flex items-start gap-6">
          {/* Avatar & Name */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-20 h-20 rounded-full bg-[#7dbbff] flex items-center justify-center mb-3">
              <span className="text-white text-xl font-semibold">{initials}</span>
            </div>
            <p className="text-sm text-[#111827] font-semibold">{name}</p>
            <p className="text-xs text-[#6B7280]">Product Designer</p>
          </div>

          {/* Info Grid */}
          <div className="flex-1 grid grid-cols-3 gap-4">
            <div className="p-3 bg-[#F9F9FA]" style={{ borderRadius: '12px' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                <span className="text-xs text-[#6B7280]">Location</span>
              </div>
              <p className="text-sm text-[#111827] font-medium">{location}</p>
            </div>
            <div className="p-3 bg-[#F9F9FA]" style={{ borderRadius: '12px' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                <span className="text-xs text-[#6B7280]">Experience</span>
              </div>
              <p className="text-sm text-[#111827] font-medium">{experienceYears}</p>
            </div>
            <div className="p-3 bg-[#F9F9FA]" style={{ borderRadius: '12px' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                <span className="text-xs text-[#6B7280]">Education</span>
              </div>
              <p className="text-sm text-[#111827] font-medium">{education}</p>
            </div>
            <div className="p-3 bg-[#F9F9FA]" style={{ borderRadius: '12px' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                <span className="text-xs text-[#6B7280]">Current Company</span>
              </div>
              <p className="text-sm text-[#111827] font-medium">TechCorp Inc.</p>
            </div>
            <div className="p-3 bg-[#F9F9FA]" style={{ borderRadius: '12px' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Clock className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                <span className="text-xs text-[#6B7280]">Availability</span>
              </div>
              <p className="text-sm text-[#111827] font-medium">{availability}</p>
            </div>
            <div className="p-3 bg-[#F9F9FA]" style={{ borderRadius: '12px' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <Target className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                <span className="text-xs text-[#6B7280]">Career Focus</span>
              </div>
              <p className="text-sm text-[#111827] font-medium">Product & Strategy</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-5 pt-5 border-t border-black/[0.08]">
          <p className="text-xs text-[#6B7280] mb-2">Background Summary</p>
          <p className="text-sm text-[#111827] leading-relaxed">
            {summary}
          </p>
        </div>
      </div>

      {/* Row: 2 columns */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Section 2: Narrative Insights */}
        <div className="bg-white p-6 border border-black/[0.08] shadow-sm col-span-2" style={{ borderRadius: '20px' }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[#7dbbff]" strokeWidth={2} />
              <h3 className="text-base text-[#111827] font-semibold">Narrative Insights</h3>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#7dbbff]/8" style={{ borderRadius: '8px' }}>
              <Eye className="w-3.5 h-3.5 text-[#7dbbff]" strokeWidth={2} />
              <span className="text-xs text-[#7dbbff] font-medium">High-Level View</span>
            </div>
          </div>
          <p className="text-xs text-[#6B7280] mb-6">Key trait signals surfaced from your background narrative — a preview, not the full picture</p>

          {/* Trait Signal Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { trait: 'Ownership & Drive', descriptor: 'Takes charge naturally', icon: Target, signal: 'Strong', signalColor: '#10B981', level: 4, blurb: 'Your narrative centers on personal initiative — stepping in without being asked and seeing things through.' },
              { trait: 'Problem Structuring', descriptor: 'Finds order in chaos', icon: Brain, signal: 'Strong', signalColor: '#10B981', level: 4, blurb: 'You gravitate toward untangling ambiguity and building frameworks before jumping to execution.' },
              { trait: 'Learning Velocity', descriptor: 'Picks up fast', icon: Zap, signal: 'Moderate', signalColor: '#7dbbff', level: 3, blurb: 'References to rapid tool adoption and cross-domain exploration suggest a quick learning curve.' },
              { trait: 'Communication Style', descriptor: 'Clear & intentional', icon: MessageSquare, signal: 'Moderate', signalColor: '#7dbbff', level: 3, blurb: 'Your language patterns reflect structured, purposeful communication over casual or reactive exchanges.' },
              { trait: 'Resilience', descriptor: 'Steady under pressure', icon: Flame, signal: 'Emerging', signalColor: '#F59E0B', level: 2, blurb: 'Some signals of composure under stress, but more data from later sections will sharpen this.' },
              { trait: 'Collaboration Orientation', descriptor: 'Selective team player', icon: Users, signal: 'Emerging', signalColor: '#F59E0B', level: 2, blurb: 'Narrative suggests effectiveness in small, focused teams rather than large cross-functional groups.' },
            ].map(item => (
              <div key={item.trait} className="p-4 bg-[#F9FAFB] border border-black/[0.05] relative overflow-hidden" style={{ borderRadius: '14px' }}>
                {/* Signal strength indicator bar */}
                <div className="absolute top-0 left-0 h-1 w-full bg-[#F3F4F6]">
                  <div className="h-full transition-all" style={{ width: `${(item.level / 5) * 100}%`, backgroundColor: item.signalColor, borderRadius: '0 2px 2px 0' }} />
                </div>
                <div className="flex items-start justify-between mt-1 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${item.signalColor}15` }}>
                      <item.icon className="w-4 h-4" style={{ color: item.signalColor }} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="text-sm text-[#111827] font-medium">{item.trait}</p>
                      <p className="text-[11px] text-[#9CA3AF]">{item.descriptor}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 mt-1" style={{ color: item.signalColor, backgroundColor: `${item.signalColor}12`, borderRadius: '6px' }}>{item.signal}</span>
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed">{item.blurb}</p>
              </div>
            ))}
          </div>

          {/* Synthesized Narrative */}
          <div className="bg-gradient-to-r from-[#7dbbff]/[0.06] to-[#7dbbff]/[0.02] border border-[#7dbbff]/10 p-5 mb-6" style={{ borderRadius: '14px' }}>
            <p className="text-xs text-[#7dbbff] font-medium mb-2 uppercase tracking-wide">How You Come Across</p>
            <p className="text-sm text-[#111827] leading-relaxed">
              You present as someone who thrives when given a hard problem and the freedom to solve it. Your narrative emphasizes 
              <span className="text-[#111827] font-medium"> building structure from ambiguity</span>, 
              <span className="text-[#111827] font-medium"> owning outcomes end-to-end</span>, and working in environments where 
              <span className="text-[#111827] font-medium"> experimentation is the norm, not the exception</span>. 
              You're likely most energized in roles where you can move fast, learn by doing, and see the direct impact of your work.
            </p>
          </div>

          {/* Bottom Row: Natural Strengths + Work Context */}
          <div className="grid grid-cols-2 gap-5">
            {/* Natural Strengths */}
            <div>
              <p className="text-xs text-[#6B7280] mb-3">Natural Strengths Identified</p>
              <div className="flex flex-wrap gap-2">
                {['Problem Structuring', 'Systems Building', 'Prioritization', 'Self-Direction', 'Analytical Framing'].map(strength => (
                  <span key={strength} className="px-3 py-1.5 bg-[#7dbbff]/10 text-[#7dbbff] text-xs font-medium" style={{ borderRadius: '10px' }}>{strength}</span>
                ))}
              </div>
            </div>

            {/* Work Context Fit */}
            <div>
              <p className="text-xs text-[#6B7280] mb-3">Preferred Work Context</p>
              <div className="space-y-2">
                {[
                  { label: 'Startup / Early-stage', level: 4 },
                  { label: 'Autonomy-driven', level: 5 },
                  { label: 'Experimental mindset', level: 4 },
                  { label: 'Impact-visible roles', level: 3 },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-xs text-[#111827]">{item.label}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`w-5 h-1.5 ${i <= item.level ? 'bg-[#7dbbff]' : 'bg-[#E5E7EB]'}`} style={{ borderRadius: '2px' }} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Achievement Spotlight */}
        <div className="bg-white p-6 border border-black/[0.08] shadow-sm col-span-2" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-2 mb-5">
            <Award className="w-5 h-5 text-[#7dbbff]" strokeWidth={2} />
            <h3 className="text-base text-[#111827] font-semibold">Achievement Spotlight</h3>
          </div>
          <p className="text-xs text-[#6B7280] mb-4">Analysis of your proudest professional moment</p>

          {/* Achievement Summary */}
          <div className="bg-[#F9FAFB] border border-black/[0.06] p-4 mb-5" style={{ borderRadius: '12px' }}>
            <p className="text-sm text-[#111827] leading-relaxed italic">
              "Led a complete redesign of the company's onboarding flow, reducing user drop-off from 60% to 22% and improving NPS by 40 points through research-driven decision making."
            </p>
          </div>

          {/* What This Reveals */}
          <div className="mb-5">
            <p className="text-xs text-[#6B7280] mb-3">What This Reveals</p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm text-[#111827] font-medium">Initiative & Ownership</p>
                  <p className="text-xs text-[#6B7280]">Narrative centers on personal action — "I organized", "I pushed for research"</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#7dbbff]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <BarChart3 className="w-4 h-4 text-[#7dbbff]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm text-[#111827] font-medium">Results Orientation</p>
                  <p className="text-xs text-[#6B7280]">Quantifies impact with specific metrics — drop-off rates, NPS improvement</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F59E0B]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Brain className="w-4 h-4 text-[#F59E0B]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm text-[#111827] font-medium">Research-First Thinking</p>
                  <p className="text-xs text-[#6B7280]">Resisted pressure to jump to solutions, prioritized understanding the problem</p>
                </div>
              </div>
            </div>
          </div>

          {/* Behavioral Tags */}
          <div className="pt-4 border-t border-black/[0.08]">
            <p className="text-xs text-[#6B7280] mb-2.5">Behavioral Tags</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-[#10B981]/10 text-[#10B981] text-xs font-medium" style={{ borderRadius: '10px' }}>High Ownership</span>
              <span className="px-3 py-1.5 bg-[#7dbbff]/10 text-[#7dbbff] text-xs font-medium" style={{ borderRadius: '10px' }}>Data-Driven</span>
              <span className="px-3 py-1.5 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium" style={{ borderRadius: '10px' }}>Proactive Challenger</span>
              <span className="px-3 py-1.5 bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-medium" style={{ borderRadius: '10px' }}>End-to-End Execution</span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Consistency & Signal Quality */}
      <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#7dbbff]" strokeWidth={2} />
            <h3 className="text-base text-[#111827] font-semibold">Consistency & Signal Quality</h3>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#10B981]/10" style={{ borderRadius: '8px' }}>
            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-xs text-[#10B981] font-medium">Strong Consistency</span>
          </div>
        </div>
        <p className="text-xs text-[#6B7280] mb-5">How your narrative responses align with structured assessment scores from Sections 2–6</p>

        <div className="grid grid-cols-3 gap-5">
          {/* Consistency Score */}
          <div className="p-4 bg-[#F9F9FA] border border-black/[0.06]" style={{ borderRadius: '14px' }}>
            <p className="text-xs text-[#6B7280] mb-3">Overall Narrative Consistency</p>
            <div className="flex items-end gap-2 mb-3">
              <p className="text-3xl text-[#111827] font-semibold">87</p>
              <p className="text-sm text-[#6B7280] mb-1">/100</p>
            </div>
            <div className="w-full h-2 bg-[#E5E7EB] rounded-full overflow-hidden mb-2">
              <div className="h-full bg-[#10B981] rounded-full" style={{ width: '87%' }} />
            </div>
            <p className="text-xs text-[#6B7280]">Narratives strongly align with scored responses</p>
          </div>

          {/* Signal Breakdown */}
          <div className="p-4 bg-[#F9F9FA] border border-black/[0.06]" style={{ borderRadius: '14px' }}>
            <p className="text-xs text-[#6B7280] mb-3">Signal Breakdown</p>
            <div className="space-y-3">
              {[
                { label: 'Ownership signals', status: 'Confirmed', color: '#10B981' },
                { label: 'Velocity & pacing', status: 'Confirmed', color: '#10B981' },
                { label: 'Problem-solving style', status: 'Confirmed', color: '#10B981' },
                { label: 'Collaboration style', status: 'Minor gap', color: '#F59E0B' },
                { label: 'Stress response', status: 'Pending', color: '#6B7280' },
              ].map(signal => (
                <div key={signal.label} className="flex items-center justify-between">
                  <span className="text-xs text-[#111827]">{signal.label}</span>
                  <span className="text-xs font-medium" style={{ color: signal.color }}>{signal.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Flagged Observations */}
          <div className="p-4 bg-[#F9F9FA] border border-black/[0.06]" style={{ borderRadius: '14px' }}>
            <p className="text-xs text-[#6B7280] mb-3">Observations</p>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-xs text-[#111827] leading-relaxed">Background narrative consistently reflects high ownership — supported by Section 2 & 4 scores</p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-xs text-[#111827] leading-relaxed">Problem-solving described as "finding clean paths" aligns with analytical thinking scores</p>
              </div>
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" strokeWidth={2} />
                <p className="text-xs text-[#111827] leading-relaxed">Narrative emphasizes individual work; Section 5 indicates moderate team collaboration preference</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}