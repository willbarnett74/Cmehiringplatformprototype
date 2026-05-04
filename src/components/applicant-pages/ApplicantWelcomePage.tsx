import { useState, useEffect } from 'react';
import { Compass, ArrowRight, Info, MapPin, Briefcase, User, Calendar, ChevronLeft, X } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { saveBaseDetails } from '../../lib/applicantPersistence';
import type { WelcomeUiStep } from '../../lib/onboardingRouting';
import { dbStepFromWelcomeUi } from '../../lib/onboardingRouting';

export interface ApplicantWelcomeRouteSync {
  activeStep: WelcomeUiStep;
  goToOnboardingStep: (next: 'welcome' | 'details' | 'how_it_works') => Promise<void>;
  finishServerOnboarding: () => Promise<void>;
}

interface ApplicantWelcomePageProps {
  userId: string;
  profileId: string;
  onComplete: () => void;
  /** When true, renders as a modal overlay and skips the welcome screen */
  editMode?: boolean;
  /** URL-driven onboarding: step + server persistence handled by parent */
  routeSync?: ApplicantWelcomeRouteSync;
}

const AVAILABILITY_OPTIONS = [
  { value: 'open', label: 'Open to roles' },
  { value: 'selective', label: 'Open but selective' },
  { value: 'contract', label: 'Open to contract / freelance' },
  { value: 'not_looking', label: 'Not looking right now' },
];

export function ApplicantWelcomePage({
  userId,
  profileId,
  onComplete,
  editMode = false,
  routeSync,
}: ApplicantWelcomePageProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [age, setAge] = useState('');
  const [availability, setAvailability] = useState('');
  const [saving, setSaving] = useState(false);
  const [internalStep, setInternalStep] = useState<'welcome' | 'details' | 'how-it-works'>(
    editMode ? 'details' : 'welcome',
  );

  const step = routeSync && !editMode ? routeSync.activeStep : internalStep;

  const goToUiStep = (next: WelcomeUiStep) => {
    if (routeSync && !editMode) {
      void routeSync.goToOnboardingStep(dbStepFromWelcomeUi(next));
      return;
    }
    setInternalStep(next);
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Always fetch name from profiles
    void supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.full_name) setName(data.full_name as string);
      });

    // In edit mode, pre-fill existing profile data
    if (editMode) {
      void supabase
        .from('candidate_profiles')
        .select('location, current_situation, age, availability')
        .eq('id', profileId)
        .maybeSingle()
        .then(({ data }) => {
          if (!data) return;
          if (data.location) setLocation(data.location as string);
          if (data.current_situation) setCurrentRole(data.current_situation as string);
          if (data.age != null) setAge(String(data.age));
          if (data.availability) setAvailability(data.availability as string);
        });
    }
  }, [userId, profileId, editMode]);

  const firstName = name.split(' ')[0] || '';

  const handleSubmit = async () => {
    setSaving(true);
    if (isSupabaseConfigured && supabase) {
      await saveBaseDetails(supabase, userId, profileId, {
        full_name: name.trim() || null,
        location: location.trim() || null,
        current_situation: currentRole.trim() || null,
        job_title: currentRole.trim() || null,
        age: age ? parseInt(age, 10) : null,
        availability: availability || null,
      });
    }
    setSaving(false);

    // Edit mode should still close immediately after saving. First-time users see the handoff screen next.
    if (editMode) {
      onComplete();
      return;
    }

    if (routeSync && !editMode) {
      await routeSync.goToOnboardingStep('how_it_works');
      setSaving(false);
      return;
    }

    localStorage.setItem(`cme_welcomed_${userId}`, '1');
    setInternalStep('how-it-works');
    setSaving(false);
  };

  // ─── Details form (shared between welcome flow and edit modal) ────────────

  const detailsForm = (
    <>
      <h2 className="text-2xl text-[#111827] font-semibold mb-2 tracking-tight">
        {editMode ? 'Update your details' : 'A few basics'}
      </h2>
      <p className="text-sm text-[#6B7280] mb-8 leading-relaxed">
        {editMode
          ? 'Changes save immediately and update your profile across CMe.'
          : "This fills in your profile so it's not empty when you arrive. You can update any of this later in Settings."}
      </p>

      <div className="space-y-4 mb-8">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Full name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" strokeWidth={2} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full pl-10 pr-4 py-3 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7dbbff] transition-colors"
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" strokeWidth={2} />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Auckland, NZ"
              className="w-full pl-10 pr-4 py-3 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7dbbff] transition-colors"
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* Current role */}
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1.5">
            Current role{' '}
            <span className="text-[#9CA3AF] font-normal">(or what you're studying / looking for)</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" strokeWidth={2} />
            <input
              type="text"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="e.g. Junior Developer, Marketing Graduate"
              className="w-full pl-10 pr-4 py-3 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7dbbff] transition-colors"
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* Age */}
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Age</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" strokeWidth={2} />
            <input
              type="number"
              min="16"
              max="100"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 24"
              className="w-full pl-10 pr-4 py-3 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7dbbff] transition-colors"
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Availability</label>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABILITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAvailability(opt.value)}
                className={`px-4 py-2.5 text-sm text-left border transition-all ${
                  availability === opt.value
                    ? 'bg-[#7dbbff]/10 border-[#7dbbff] text-[#7dbbff] font-medium'
                    : 'bg-white border-black/[0.08] text-[#6B7280] hover:border-[#7dbbff]/40'
                }`}
                style={{ borderRadius: '10px' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => void handleSubmit()}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#7dbbff] text-white hover:bg-[#6aabef] transition-colors font-medium text-sm disabled:opacity-60"
        style={{ borderRadius: '12px' }}
      >
        {saving ? (
          <span>Saving...</span>
        ) : editMode ? (
          <span>Save changes</span>
        ) : (
          <>
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </>
        )}
      </button>

      {!editMode && (
        <button
          onClick={() => goToUiStep('welcome')}
          className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors py-2"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Back
        </button>
      )}
    </>
  );

  // ─── Edit mode: modal overlay ─────────────────────────────────────────────

  if (editMode) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 font-dashboard text-[#111827] antialiased backdrop-blur-[2px]">
        <div
          className="relative max-h-[90vh] w-full max-w-[480px] overflow-y-auto bg-white p-8 shadow-xl"
          style={{ borderRadius: '20px' }}
        >
          <button
            onClick={onComplete}
            className="absolute top-5 right-5 p-1.5 text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F9F9FA] transition-all"
            style={{ borderRadius: '8px' }}
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
          {detailsForm}
        </div>
      </div>
    );
  }

  // ─── First-login flow: full screen ────────────────────────────────────────

  if (step === 'welcome') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-6 font-dashboard text-[#111827] antialiased">
        <div className="w-full max-w-[480px]">
          <div className="mb-14 flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#7dbbff]"
              style={{ borderRadius: '12px' }}
            >
              <Compass className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-lg font-semibold text-[#111827]">CMe</span>
          </div>

          <h1 className="mb-4 text-[32px] font-semibold leading-tight tracking-tight text-[#111827]">
            {firstName ? `Welcome, ${firstName}.` : 'Welcome.'}
          </h1>
          <p className="text-[15px] text-[#6B7280] mb-10 leading-relaxed">
            CMe matches you with roles based on{' '}
            <span className="text-[#111827] font-medium">who you are</span>, not just what's on
            your CV. You'll build a trait profile that helps employers understand how you work,
            think, and what drives you.
          </p>

          <div className="space-y-3 mb-10">
            {[
              {
                num: '01',
                title: 'Set up your basics',
                desc: "A few quick details so your profile isn't empty when you arrive.",
              },
              {
                num: '02',
                title: 'Build your trait profile',
                desc: '8 short sections covering how you work, think, and what motivates you.',
              },
              {
                num: '03',
                title: 'Get matched',
                desc: 'Employers find you based on trait fit — not keyword matching.',
              },
            ].map((item) => (
              <div
                key={item.num}
                className="flex items-start gap-4 p-4 bg-white border border-black/[0.06]"
                style={{ borderRadius: '14px' }}
              >
                <span className="mt-0.5 w-6 shrink-0 font-dashboard-mono text-xs font-semibold text-[#7dbbff]">
                  {item.num}
                </span>
                <div>
                  <p className="text-sm text-[#111827] font-medium">{item.title}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => goToUiStep('details')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#7dbbff] text-white hover:bg-[#6aabef] transition-colors font-medium text-sm"
            style={{ borderRadius: '12px' }}
          >
            <span>Get started</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'how-it-works') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-4 py-8 text-[#111827] antialiased">
        <div
          className="grid min-h-[600px] w-full max-w-[1100px] grid-cols-1 overflow-hidden border border-black/[0.08] bg-white md:grid-cols-2"
          style={{ borderRadius: '20px' }}
        >
          <section
            className="relative flex min-h-[320px] flex-col justify-between overflow-hidden p-10 text-white md:min-h-0 md:p-12"
            style={{ background: 'linear-gradient(135deg, #0F1419 0%, #1a2332 100%)' }}
          >
            <div
              className="pointer-events-none absolute"
              style={{
                top: '-80px',
                right: '-80px',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(125,187,255,0.18) 0%, rgba(125,187,255,0) 70%)',
              }}
            />
            <div
              className="pointer-events-none absolute"
              style={{
                bottom: '-60px',
                left: '-60px',
                width: '220px',
                height: '220px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, rgba(125,187,255,0.10) 0%, rgba(125,187,255,0) 70%)',
              }}
            />

            <div className="relative">
              <div className="mb-14 flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center bg-[#7dbbff]"
                  style={{ borderRadius: '8px' }}
                >
                  <Compass className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
                <span className="text-[15px] font-medium">CMe</span>
              </div>

              <h1 className="mb-4 text-[32px] font-medium leading-[1.15] tracking-tight text-white">
                Here's how this works.
              </h1>
              <p
                className="max-w-[360px] text-[14px] leading-[1.65]"
                style={{ color: 'rgba(255,255,255,0.7)' }}
              >
                Three short steps. About 45 minutes total. You can pause and come back anytime.
              </p>
            </div>

            <div
              className="relative max-w-[260px] text-[11px] leading-[1.5]"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Private by default. Only matched employers see your profile.
            </div>
          </section>

          <section className="flex flex-col bg-white p-10 md:p-12">
            <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#9CA3AF]">
              Before you start
            </div>
            <h2 className="mb-1.5 text-[18px] font-medium text-[#111827]">Build your profile</h2>
            <p className="mb-7 text-[13px] leading-[1.55] text-[#6B7280]">
              This isn't a CV upload. It's a guided flow that captures how you actually work.
            </p>

            <div className="mb-7 flex flex-col gap-3">
              {[
                {
                  number: '1',
                  title: 'Tell us how you work',
                  description: 'Eight short sections on your style, strengths, and what drives you.',
                  meta: '~45 min',
                },
                {
                  number: '2',
                  title: 'See your trait profile',
                  description: 'We turn your answers into a visual profile across six dimensions.',
                  meta: 'Auto',
                },
                {
                  number: '3',
                  title: 'Get matched, your way',
                  description: 'Choose who can see your profile. Only matched employers, never the public.',
                  meta: 'Your call',
                },
              ].map((item) => (
                <div
                  key={item.number}
                  className="grid items-center gap-3.5 px-[18px] py-4"
                  style={{
                    border: '0.5px solid rgba(0,0,0,0.08)',
                    borderRadius: '12px',
                    gridTemplateColumns: '32px 1fr auto',
                  }}
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center bg-[#EFF6FF] text-[13px] font-medium text-[#1E40AF]"
                    style={{ borderRadius: '8px' }}
                  >
                    {item.number}
                  </div>
                  <div>
                    <div className="mb-0.5 text-[14px] font-medium text-[#111827]">{item.title}</div>
                    <div className="text-[12px] leading-[1.5] text-[#6B7280]">{item.description}</div>
                  </div>
                  <div className="text-[11px] text-[#9CA3AF]">{item.meta}</div>
                </div>
              ))}
            </div>

            <div
              className="mb-6 flex items-start gap-2.5 bg-[#F9FAFB] px-3.5 py-3"
              style={{ borderRadius: '10px' }}
            >
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6B7280]" strokeWidth={2} />
              <div className="text-[12px] leading-[1.55] text-[#6B7280]">
                Answer honestly. There are no good or bad traits — only ones that fit different roles.
                Trying to &quot;look good&quot; produces a profile that won't match you well.
              </div>
            </div>

            <div
              className="mt-auto flex items-center justify-between pt-5"
              style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)' }}
            >
              <div className="text-[12px] text-[#9CA3AF]">Progress saves automatically.</div>
              <button
                type="button"
                onClick={() => {
                  if (routeSync && !editMode) {
                    void routeSync.finishServerOnboarding();
                    return;
                  }
                  onComplete();
                }}
                className="inline-flex items-center gap-1.5 border-0 bg-[#7dbbff] px-[18px] py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#5aaeff]"
                style={{ borderRadius: '10px' }}
              >
                Start building
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white" strokeWidth={2} />
              </button>
            </div>
          </section>
        </div>

        <button
          type="button"
          onClick={() => goToUiStep('details')}
          className="mt-6 flex items-center justify-center gap-1.5 text-xs text-[#9CA3AF] transition-colors hover:text-[#6B7280]"
        >
          <ChevronLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fafafa] p-6 font-dashboard text-[#111827] antialiased">
      <div className="w-full max-w-[480px]">
        <div className="mb-14 flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#7dbbff]"
            style={{ borderRadius: '12px' }}
          >
            <Compass className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-lg font-semibold text-[#111827]">CMe</span>
        </div>
        {detailsForm}
      </div>
    </div>
  );
}
