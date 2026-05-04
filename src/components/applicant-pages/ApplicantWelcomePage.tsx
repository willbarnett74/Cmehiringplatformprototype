import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Compass,
  MapPin,
  Shuffle,
  TrendingUp,
  User,
  X,
  type LucideIcon,
} from 'lucide-react';
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
  editMode?: boolean;
  routeSync?: ApplicantWelcomeRouteSync;
}

const systemFont =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

const splitCardGridStyle: CSSProperties = {
  gridTemplateRows: 'minmax(0, 1fr)',
  boxSizing: 'border-box',
  height: 'clamp(640px, 78vh, 960px)',
  minHeight: 'clamp(640px, 78vh, 960px)',
  maxHeight: 'clamp(640px, 78vh, 960px)',
  width: '100%',
  maxWidth: 'min(1680px, calc(100vw - clamp(32px, 5vw, 96px)))',
  border: '1px solid rgba(0,0,0,0.08)',
  borderRadius: '20px',
};

function inputFieldStyle(iconPad: boolean): CSSProperties {
  return {
    border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: '10px',
    fontSize: 'clamp(13px, 0.78rem + 0.35vw, 16px)',
    lineHeight: '1.5',
    padding: iconPad
      ? 'clamp(11px, 1vw, 14px) clamp(12px, 1.2vw, 16px) clamp(11px, 1vw, 14px) 2.5rem'
      : 'clamp(11px, 1vw, 14px) clamp(12px, 1.2vw, 16px)',
  };
}

function labelStyleScaled(): CSSProperties {
  return {
    fontSize: 'clamp(12px, 0.7rem + 0.25vw, 14px)',
    lineHeight: '1.5',
  };
}

const AVAILABILITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'open', label: 'Open to roles' },
  { value: 'selective', label: 'Selective' },
  { value: 'contract', label: 'Contract only' },
  { value: 'not_looking', label: 'Not looking' },
];

function parseCurrentSituation(raw: string | null | undefined): {
  role: string;
  stage: string;
  move: string;
} {
  if (!raw?.trim()) return { role: '', stage: '', move: '' };
  const lines = raw.split('\n').map((s) => s.trim()).filter(Boolean);
  if (lines.length >= 2) {
    return {
      role: lines[0] ?? '',
      stage: lines[1] ?? '',
      move: lines.slice(2).join('\n') || '',
    };
  }
  return { role: raw, stage: '', move: '' };
}

function buildCurrentSituation(role: string, stage: string, move: string): string | null {
  const parts = [role.trim(), stage.trim(), move.trim()].filter(Boolean);
  return parts.length ? parts.join('\n') : null;
}

const howItWorksStepCards = [
  {
    num: '1',
    title: 'Tell us how you work',
    description: 'Eight short sections on your style, strengths, and what drives you.',
    meta: '~45 min',
  },
  {
    num: '2',
    title: 'See your trait profile',
    description: 'We turn your answers into a visual profile across six dimensions.',
    meta: 'Auto',
  },
  {
    num: '3',
    title: 'Get matched, your way',
    description: 'Choose who can see your profile. Only matched employers, never the public.',
    meta: 'Your call',
  },
] as const;

function TextField({
  label,
  icon: Icon,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled,
}: {
  label: string;
  icon?: LucideIcon;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  const pad = inputFieldStyle(!!Icon);
  return (
    <label className="block w-full">
      <span className="mb-1.5 block font-medium text-[#6B7280]" style={labelStyleScaled()}>
        {label}
      </span>
      <span className="relative block">
        {Icon && (
          <Icon
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            strokeWidth={1.8}
            style={{
              left: 'clamp(12px, 1vw, 16px)',
              width: 'clamp(14px, 1rem + 0.2vw, 18px)',
              height: 'clamp(14px, 1rem + 0.2vw, 18px)',
            }}
          />
        )}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="box-border w-full bg-white text-[#111827] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#7dbbff] disabled:opacity-60"
          style={pad}
          placeholder={placeholder}
        />
      </span>
    </label>
  );
}

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
  const [careerStage, setCareerStage] = useState('');
  const [moveConsidering, setMoveConsidering] = useState('');
  const [availability, setAvailability] = useState('open');
  const [saving, setSaving] = useState(false);
  const [internalStep, setInternalStep] = useState<'welcome' | 'details' | 'how-it-works'>(
    editMode ? 'details' : 'welcome',
  );

  const step = routeSync && !editMode ? routeSync.activeStep : internalStep;

  const welcomeGridRef = useRef<HTMLDivElement>(null);
  const leftWelcomeEyebrowRef = useRef<HTMLDivElement>(null);
  const rightWelcomeEyebrowRef = useRef<HTMLDivElement>(null);
  const [welcomeRightShiftPx, setWelcomeRightShiftPx] = useState(0);

  const goToUiStep = (next: WelcomeUiStep) => {
    if (routeSync && !editMode) {
      void routeSync.goToOnboardingStep(dbStepFromWelcomeUi(next));
      return;
    }
    setInternalStep(next);
  };

  useLayoutEffect(() => {
    if (step !== 'welcome') {
      setWelcomeRightShiftPx(0);
      return;
    }

    const measureAndApply = () => {
      const leftEl = leftWelcomeEyebrowRef.current;
      const rightEl = rightWelcomeEyebrowRef.current;
      if (!leftEl || !rightEl) return;
      const dy = leftEl.getBoundingClientRect().top - rightEl.getBoundingClientRect().top;
      setWelcomeRightShiftPx((prev) => {
        if (Math.abs(dy) < 0.25) return prev;
        return Math.round((prev + dy) * 10) / 10;
      });
    };

    let nestedRaf = 0;
    const outerRaf = requestAnimationFrame(() => {
      measureAndApply();
      nestedRaf = requestAnimationFrame(measureAndApply);
    });

    const ro = new ResizeObserver(measureAndApply);
    const grid = welcomeGridRef.current;
    if (grid) ro.observe(grid);
    const l = leftWelcomeEyebrowRef.current;
    const r = rightWelcomeEyebrowRef.current;
    if (l) ro.observe(l);
    if (r) ro.observe(r);
    window.addEventListener('resize', measureAndApply);
    return () => {
      cancelAnimationFrame(outerRaf);
      cancelAnimationFrame(nestedRaf);
      ro.disconnect();
      window.removeEventListener('resize', measureAndApply);
    };
  }, [step, name]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    void supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.full_name) setName(data.full_name as string);
      });

    if (editMode) {
      void supabase
        .from('candidate_profiles')
        .select('location, current_situation, availability')
        .eq('id', profileId)
        .maybeSingle()
        .then(({ data }) => {
          if (!data) return;
          if (data.location) setLocation(data.location as string);
          const parsed = parseCurrentSituation(data.current_situation as string | null);
          setCurrentRole(parsed.role);
          setCareerStage(parsed.stage);
          setMoveConsidering(parsed.move);
          if (data.availability) setAvailability(data.availability as string);
          else setAvailability('open');
        });
    }
  }, [userId, profileId, editMode]);

  const firstName = name.split(' ')[0] || '';

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setSaving(true);
    const situation = buildCurrentSituation(currentRole, careerStage, moveConsidering);
    if (isSupabaseConfigured && supabase) {
      await saveBaseDetails(supabase, userId, profileId, {
        full_name: name.trim() || null,
        location: location.trim() || null,
        current_situation: situation,
        job_title: currentRole.trim() || null,
        availability: availability || null,
      });
    }
    setSaving(false);

    if (editMode) {
      onComplete();
      return;
    }

    if (routeSync && !editMode) {
      await routeSync.goToOnboardingStep('how_it_works');
      return;
    }

    localStorage.setItem(`cme_welcomed_${userId}`, '1');
    setInternalStep('how-it-works');
  };

  const detailsFormInner = (
    <>
      {!editMode ? null : (
        <>
          <h2 className="mb-2 text-2xl font-semibold tracking-tight text-[#111827]">Update your details</h2>
          <p className="mb-8 text-sm leading-relaxed text-[#6B7280]">
            Changes save immediately and update your profile across CMe.
          </p>
        </>
      )}

      <div className="flex w-full flex-col gap-4">
        <TextField
          label="Full name"
          icon={User}
          placeholder="Alex Rivera"
          value={name}
          onChange={setName}
          disabled={saving}
        />
        <TextField
          label="Location"
          icon={MapPin}
          placeholder="London, UK"
          value={location}
          onChange={setLocation}
          disabled={saving}
        />
        <TextField
          label="What field are you in?"
          icon={Briefcase}
          placeholder="e.g. Product, data, operations…"
          value={currentRole}
          onChange={setCurrentRole}
          disabled={saving}
        />
        <TextField
          label="Where are you in your career?"
          icon={TrendingUp}
          placeholder="e.g. Senior IC, first-time manager, returning from a break…"
          value={careerStage}
          onChange={setCareerStage}
          disabled={saving}
        />
        <TextField
          label="What kind of move are you considering?"
          icon={Shuffle}
          placeholder="e.g. Lateral into a new domain, step up in scope, contract…"
          value={moveConsidering}
          onChange={setMoveConsidering}
          disabled={saving}
        />

        <div>
          <p className="mb-2 font-medium text-[#6B7280]" style={labelStyleScaled()}>
            Availability
          </p>
          <div className="flex flex-wrap gap-2">
            {AVAILABILITY_OPTIONS.map((opt) => {
              const selected = availability === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  disabled={saving}
                  onClick={() => setAvailability(opt.value)}
                  className="font-medium transition disabled:opacity-60"
                  style={{
                    borderRadius: '10px',
                    padding: 'clamp(8px, 1vw, 12px) clamp(12px, 1.5vw, 18px)',
                    fontSize: 'clamp(12px, 0.7rem + 0.25vw, 14px)',
                    lineHeight: '1.5',
                    border: selected ? '1px solid #7DBBFF' : '1px solid rgba(0,0,0,0.08)',
                    background: selected ? 'rgba(125,187,255,0.1)' : '#ffffff',
                    color: selected ? '#111827' : '#6B7280',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="shrink-0" style={{ minHeight: 'clamp(4px, 0.5vh, 8px)' }} aria-hidden />
      </div>
    </>
  );

  if (editMode) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6 text-[#111827] antialiased backdrop-blur-[2px]"
        style={{ fontFamily: systemFont }}
      >
        <div
          className="relative max-h-[90vh] w-full max-w-[480px] overflow-y-auto bg-white p-8 shadow-xl"
          style={{ borderRadius: '20px' }}
        >
          <button
            type="button"
            onClick={onComplete}
            className="absolute right-5 top-5 rounded-lg p-1.5 text-[#9CA3AF] transition-all hover:bg-[#F9F9FA] hover:text-[#6B7280]"
            style={{ borderRadius: '8px' }}
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
          <form id="applicant-edit-modal-form" onSubmit={(e) => void handleSubmit(e)}>
            {detailsFormInner}
            <button
              type="submit"
              disabled={saving}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7dbbff] px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#5aaeff] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'welcome') {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#fafafa] text-[#111827]"
        style={{ fontFamily: systemFont, padding: 'clamp(16px, 2.5vw, 48px)' }}
      >
        <div
          ref={welcomeGridRef}
          className="grid w-full grid-cols-1 overflow-hidden bg-white md:grid-cols-2"
          style={splitCardGridStyle}
        >
          <section
            className="relative flex h-full min-h-[320px] min-w-0 flex-1 flex-col justify-between overflow-hidden text-white md:min-h-0"
            style={{
              padding: 'clamp(32px, 4.5vw, 96px)',
              background: 'linear-gradient(135deg, #0F1419 0%, #1a2332 100%)',
            }}
          >
            <div
              className="pointer-events-none absolute"
              style={{
                top: '-100px',
                right: '-100px',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(125,187,255,0.18) 0%, rgba(125,187,255,0) 70%)',
              }}
            />
            <div
              className="pointer-events-none absolute"
              style={{
                bottom: '-80px',
                left: '-80px',
                width: '260px',
                height: '260px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(125,187,255,0.10) 0%, rgba(125,187,255,0) 70%)',
              }}
            />

            <div className="relative z-10 shrink-0">
              <div className="flex items-center" style={{ gap: '10px' }}>
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#7DBBFF] text-white"
                  style={{ borderRadius: '8px' }}
                >
                  <Compass className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
                <span className="font-medium" style={{ fontSize: '17px', lineHeight: '1.5' }}>
                  CMe
                </span>
              </div>
            </div>

            <div className="relative z-10 min-w-0 w-full shrink-0">
              <div
                ref={leftWelcomeEyebrowRef}
                className="mb-2 font-medium uppercase tracking-[0.06em]"
                style={{ fontSize: '12px', color: 'rgba(125,187,255,0.85)' }}
              >
                {firstName ? `Welcome, ${firstName}` : 'Welcome'}
              </div>
              <h1
                className="mb-4 text-white"
                style={{
                  fontSize: '48px',
                  fontWeight: 600,
                  lineHeight: '1.1',
                  letterSpacing: '-0.01em',
                }}
              >
                CVs tell employers what you&apos;ve done.
                <br />
                <span style={{ color: '#7DBBFF' }}>CMe shows them how you work.</span>
              </h1>
              <p style={{ fontSize: '16px', lineHeight: '1.65', color: 'rgba(255,255,255,0.7)' }}>
                Two people with identical CVs can be wildly different at work. Some thrive under pressure. Some go
                quiet. Some build consensus. Some drive change. CMe captures that — so the matches you get actually
                fit.
              </p>
            </div>

            <div className="relative z-10 shrink-0" aria-hidden />
          </section>

          <section
            className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white"
            style={{ padding: 'clamp(32px, 4.5vw, 96px)' }}
          >
            <div
              className="relative z-10 flex w-full min-w-0 shrink-0 flex-col"
              style={{
                transform: `translateY(${welcomeRightShiftPx}px)`,
              }}
            >
              <div
                ref={rightWelcomeEyebrowRef}
                className="mb-2 font-medium uppercase tracking-[0.06em] text-[#9CA3AF]"
                style={{ fontSize: '12px', lineHeight: '1.5' }}
              >
                What&apos;s next
              </div>
              <h2
                className="mb-4 text-[#111827]"
                style={{
                  fontSize: 'clamp(32px, 3.2vw, 40px)',
                  fontWeight: 500,
                  lineHeight: '1.22',
                  letterSpacing: '-0.01em',
                }}
              >
                Let&apos;s build your profile.
              </h2>
              <p style={{ fontSize: '16px', lineHeight: '1.65', color: '#6B7280' }}>
                A few quick basics, then a guided flow that captures how you actually work. Takes about 45 minutes —
                you can pause and come back anytime.
              </p>
            </div>

            <div
              className="relative z-10 mt-auto flex shrink-0 items-center justify-between"
              style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)', paddingTop: '22px' }}
            >
              <div
                className="flex min-h-10 items-center text-[#9CA3AF]"
                style={{ fontSize: '13px', lineHeight: '1.5' }}
              >
                Step 1 of 3
              </div>
              <button
                type="button"
                onClick={() => goToUiStep('details')}
                className="inline-flex items-center gap-1.5 bg-[#7DBBFF] py-2.5 font-medium text-white transition-colors hover:bg-[#5aaeff]"
                style={{
                  border: 'none',
                  borderRadius: '50px',
                  paddingLeft: '18px',
                  paddingRight: '18px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                Let&apos;s begin
                <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (step === 'how-it-works') {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-[#fafafa] text-[#111827]"
        style={{ fontFamily: systemFont, padding: 'clamp(16px, 2.5vw, 48px)' }}
      >
        <div
          className="grid w-full grid-cols-1 overflow-hidden bg-white md:grid-cols-2"
          style={splitCardGridStyle}
        >
          <section
            className="relative flex h-full min-h-[320px] min-w-0 flex-1 flex-col justify-between overflow-hidden text-white md:min-h-0"
            style={{
              padding: 'clamp(32px, 4.5vw, 96px)',
              background: 'linear-gradient(135deg, #0F1419 0%, #1a2332 100%)',
            }}
          >
            <div
              className="pointer-events-none absolute"
              style={{
                top: '-80px',
                right: '-80px',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(125,187,255,0.18) 0%, rgba(125,187,255,0) 70%)',
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
                background: 'radial-gradient(circle, rgba(125,187,255,0.10) 0%, rgba(125,187,255,0) 70%)',
              }}
            />

            <div className="relative z-10 shrink-0">
              <div className="flex items-center" style={{ gap: '10px' }}>
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#7DBBFF] text-white"
                  style={{ borderRadius: '8px' }}
                >
                  <Compass className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
                <span className="font-medium" style={{ fontSize: '17px', lineHeight: '1.5' }}>
                  CMe
                </span>
              </div>
            </div>

            <div className="relative z-10 min-w-0 w-full shrink-0">
              <div
                className="mb-2 font-medium uppercase tracking-[0.06em]"
                style={{ fontSize: '12px', color: 'rgba(125,187,255,0.85)' }}
              >
                Explanation
              </div>
              <h1
                className="mb-4 text-white"
                style={{
                  fontSize: '48px',
                  fontWeight: 600,
                  lineHeight: '1.1',
                  letterSpacing: '-0.01em',
                }}
              >
                Here&apos;s how this
                <br />
                <span style={{ color: '#7DBBFF' }}>works.</span>
              </h1>
              <p style={{ fontSize: '16px', lineHeight: '1.65', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
                Three short steps. About 45 minutes total. You can pause and come back anytime.
              </p>
              <p
                style={{
                  fontSize: '16px',
                  lineHeight: '1.65',
                  color: 'rgba(255,255,255,0.7)',
                  margin: 'clamp(14px, 1.75vh, 20px) 0 0 0',
                }}
              >
                This isn&apos;t a test of who you should be. It&apos;s a measure of who you are — the traits that
                don&apos;t fit on a CV. Answer honestly; the questions weigh traits against each other, so
                there&apos;s no way to game it.
              </p>
            </div>

            <div className="relative z-10 shrink-0" aria-hidden />
          </section>

          <section
            className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col gap-1 overflow-hidden bg-white"
            style={{ padding: 'clamp(32px, 4.5vw, 96px)' }}
          >
            <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-center overflow-hidden">
                <div className="relative z-10 mx-auto w-full max-w-[520px] shrink-0">
                  <div
                    className="mb-2 font-medium uppercase tracking-[0.06em] text-[#9CA3AF]"
                    style={{ fontSize: '11px', lineHeight: '1.5' }}
                  >
                    Before you start
                  </div>
                  <h2 className="mb-1.5 font-medium text-[#111827]" style={{ fontSize: '18px', lineHeight: '1.35' }}>
                    Build your profile
                  </h2>
                  <p
                    style={{
                      fontSize: '13px',
                      lineHeight: '1.55',
                      color: '#6B7280',
                      margin: '0 0 clamp(16px, 2.2vh, 24px) 0',
                    }}
                  >
                    This isn&apos;t a CV upload. It&apos;s a guided flow that captures how you actually work.
                  </p>

                  <div className="mb-5 flex flex-col gap-3">
                    {howItWorksStepCards.map((stepCard) => (
                      <div
                        key={stepCard.num}
                        className="grid items-center"
                        style={{
                          border: '0.5px solid rgba(0,0,0,0.08)',
                          borderRadius: '12px',
                          padding: 'clamp(12px, 1.4vh, 16px) clamp(14px, 1.5vw, 18px)',
                          gridTemplateColumns: '32px 1fr auto',
                          gap: 'clamp(10px, 1.2vw, 14px)',
                        }}
                      >
                        <div
                          className="flex h-8 w-8 shrink-0 items-center justify-center font-medium text-[#1E40AF]"
                          style={{ borderRadius: '8px', background: '#EFF6FF', fontSize: '13px', lineHeight: '1.5' }}
                        >
                          {stepCard.num}
                        </div>
                        <div className="min-w-0">
                          <div className="mb-0.5 font-medium text-[#111827]" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                            {stepCard.title}
                          </div>
                          <div style={{ fontSize: '12px', lineHeight: '1.5', color: '#6B7280' }}>
                            {stepCard.description}
                          </div>
                        </div>
                        <div className="shrink-0 self-center text-[#9CA3AF]" style={{ fontSize: '11px', lineHeight: '1.5' }}>
                          {stepCard.meta}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="relative z-10 flex shrink-0 items-center justify-between"
              style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)', paddingTop: '22px' }}
            >
              <div
                className="flex min-h-10 items-center text-[#9CA3AF]"
                style={{ fontSize: '13px', lineHeight: '1.5' }}
              >
                Step 3 of 3
              </div>
              <div className="flex shrink-0 items-center" style={{ gap: 'clamp(16px, 2.5vw, 24px)' }}>
                {!editMode && (
                  <button
                    type="button"
                    onClick={() => goToUiStep('details')}
                    className="inline-flex items-center gap-2 font-medium text-[#6B7280] transition hover:text-[#111827]"
                    style={{
                      fontSize: '14px',
                      lineHeight: '1.5',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                    }}
                  >
                    <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (routeSync && !editMode) {
                      void routeSync.finishServerOnboarding();
                      return;
                    }
                    onComplete();
                  }}
                  className="inline-flex items-center gap-1.5 bg-[#7DBBFF] py-2.5 font-medium text-white transition-colors hover:bg-[#5aaeff]"
                  style={{
                    border: 'none',
                    borderRadius: '50px',
                    paddingLeft: '18px',
                    paddingRight: '18px',
                    fontSize: '14px',
                    lineHeight: '1.5',
                  }}
                >
                  Start building
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-[#fafafa] text-[#111827]"
      style={{ fontFamily: systemFont, padding: 'clamp(16px, 2.5vw, 48px)' }}
    >
      <div className="grid w-full grid-cols-1 overflow-hidden bg-white md:grid-cols-2" style={splitCardGridStyle}>
        <section
          className="relative flex h-full min-h-[320px] min-w-0 flex-1 flex-col justify-between overflow-hidden text-white md:min-h-0"
          style={{
            padding: 'clamp(32px, 4.5vw, 96px)',
            background: 'linear-gradient(135deg, #0F1419 0%, #1a2332 100%)',
          }}
        >
          <div
            className="pointer-events-none absolute"
            style={{
              top: '-100px',
              right: '-100px',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(125,187,255,0.18) 0%, rgba(125,187,255,0) 70%)',
            }}
          />
          <div
            className="pointer-events-none absolute"
            style={{
              bottom: '-80px',
              left: '-80px',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(125,187,255,0.10) 0%, rgba(125,187,255,0) 70%)',
            }}
          />

          <div className="relative z-10 shrink-0">
            <div className="flex items-center" style={{ gap: '10px' }}>
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center bg-[#7DBBFF] text-white"
                style={{ borderRadius: '8px' }}
              >
                <Compass className="h-4 w-4 text-white" strokeWidth={2} />
              </div>
              <span className="font-medium" style={{ fontSize: '17px', lineHeight: '1.5' }}>
                CMe
              </span>
            </div>
          </div>

          <div className="relative z-10 min-w-0 w-full shrink-0">
            <div
              className="mb-2 font-medium uppercase tracking-[0.06em]"
              style={{ fontSize: '12px', color: 'rgba(125,187,255,0.85)' }}
            >
              Profile basics
            </div>
            <h1
              className="mb-4 text-white"
              style={{
                fontSize: '48px',
                fontWeight: 600,
                lineHeight: '1.1',
                letterSpacing: '-0.01em',
              }}
            >
              Tell us about
              <br />
              <span style={{ color: '#7DBBFF' }}>yourself.</span>
            </h1>
            <p style={{ fontSize: '16px', lineHeight: '1.65', color: 'rgba(255,255,255,0.7)' }}>
              A few quick fields to set context — you&apos;ll shape the rest in the profile builder. Nothing here needs
              to be perfect.
            </p>
          </div>

          <div className="relative z-10 shrink-0" aria-hidden />
        </section>

        <section
          className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col gap-1 overflow-hidden bg-white"
          style={{ padding: 'clamp(32px, 4.5vw, 96px)' }}
        >
          <form
            id="applicant-basics-form"
            onSubmit={(e) => void handleSubmit(e)}
            className="relative z-10 flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-y-auto overscroll-y-contain"
          >
            {detailsFormInner}
          </form>

          <div
            className="relative z-10 flex shrink-0 items-center justify-between"
            style={{ borderTop: '0.5px solid rgba(0,0,0,0.08)', paddingTop: '22px' }}
          >
            <div
              className="flex min-h-10 items-center text-[#9CA3AF]"
              style={{ fontSize: '13px', lineHeight: '1.5' }}
            >
              Step 2 of 3
            </div>
            <div className="flex shrink-0 items-center" style={{ gap: 'clamp(16px, 2.5vw, 24px)' }}>
              <button
                type="button"
                onClick={() => goToUiStep('welcome')}
                className="inline-flex items-center gap-2 font-medium text-[#6B7280] transition hover:text-[#111827]"
                style={{
                  fontSize: '14px',
                  lineHeight: '1.5',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                }}
              >
                <ArrowLeft className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                Back
              </button>
              <button
                type="submit"
                form="applicant-basics-form"
                disabled={saving}
                className="inline-flex items-center gap-1.5 bg-[#7DBBFF] py-2.5 font-medium text-white transition-colors hover:bg-[#5aaeff] disabled:opacity-60"
                style={{
                  border: 'none',
                  borderRadius: '50px',
                  paddingLeft: '18px',
                  paddingRight: '18px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                }}
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
