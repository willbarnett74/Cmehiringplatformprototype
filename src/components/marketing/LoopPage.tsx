import {
  ArrowLeft,
  Check,
  Layers,
  MessageSquareText,
  Sparkles,
  Target,
  UserCheck,
  Zap,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useMemo, useState } from 'react';
import { MarketingShell } from './MarketingShell';
import {
  Eyebrow,
  GhostCta,
  MARKETING_COLORS,
  PrimaryCta,
  SectionHeader,
} from './MarketingPrimitives';

type Perspective = 'employer' | 'candidate';

type LoopStage = {
  id: string;
  number: string;
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  employer: string;
  candidate: string;
  metric: string;
};

const LOOP_STAGES: LoopStage[] = [
  {
    id: 'discover',
    number: '01',
    title: 'Discover',
    icon: Sparkles,
    employer: 'Define what success looks like for this role before candidate screening starts.',
    candidate: 'Understand the role expectations and where your strengths can create impact.',
    metric: 'Role brief clarity + weighting confidence',
  },
  {
    id: 'match',
    number: '02',
    title: 'Match',
    icon: Target,
    employer: 'Rank candidates by behavioural fit, not resume keyword overlap.',
    candidate: 'See where your profile aligns strongest and where growth opportunities sit.',
    metric: 'Trait-fit score + confidence band',
  },
  {
    id: 'interview',
    number: '03',
    title: 'Interview',
    icon: MessageSquareText,
    employer: 'Use targeted prompts tied to traits so interviews test real role-relevant signals.',
    candidate: 'Get fair, role-grounded conversations centered on behaviours and fit.',
    metric: 'Signal consistency from interview evidence',
  },
  {
    id: 'hire',
    number: '04',
    title: 'Hire',
    icon: UserCheck,
    employer: 'Make final decisions with transparent fit reasoning across all six dimensions.',
    candidate: 'Receive a decision path based on demonstrated fit, not guesswork.',
    metric: 'Decision confidence + rationale coverage',
  },
  {
    id: 'onboard',
    number: '05',
    title: 'Onboard',
    icon: Check,
    employer: 'Run 30-day check-ins to compare expected trait strengths with real workplace signal.',
    candidate: 'Track your early role experience and how expectations match day-to-day reality.',
    metric: '30-day onboarding alignment snapshot',
  },
  {
    id: 'learn',
    number: '06',
    title: 'Learn',
    icon: Layers,
    employer: 'Feed 90-day outcomes back into matching so each hire improves the next one.',
    candidate: 'Contribute post-hire insight that strengthens future opportunities and matching.',
    metric: '90-day outcome feedback loop',
  },
];

function MoatStrip() {
  return (
    <section className="mx-auto max-w-[1120px] px-6 pt-6 pb-12 md:px-9">
      <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-6 md:p-8">
        <Eyebrow color={MARKETING_COLORS.blue}>
          <span className="h-1.5 w-1.5 rounded-full bg-[#7dbbff]" />
          The unoccupied quadrant
        </Eyebrow>
        <p className="mt-3 max-w-3xl text-[15px] leading-7 text-white/72">
          Most hiring systems end at offer acceptance. CMe keeps learning through onboarding and
          real outcomes, then loops that learning into the next hire.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3 text-[10.5px] font-semibold tracking-[0.16em] uppercase md:gap-6">
          <div className="font-dashboard-mono text-white/52">Where most platforms stop</div>
          <div className="font-dashboard-mono text-[#7dbbff] text-right">Where CMe keeps going</div>
        </div>

        <div className="relative mt-3 grid grid-cols-6 gap-2 md:gap-3">
          <div className="pointer-events-none absolute top-0 bottom-0 left-[66.3%] w-px border-l border-dashed border-[#7dbbff66]" />
          {LOOP_STAGES.map((stage, index) => {
            const highlighted = index >= 4;
            const Icon = stage.icon;
            return (
              <div
                key={stage.id}
                className={`rounded-xl border px-2 py-3 text-center md:px-3 ${
                  highlighted
                    ? 'border-[#7dbbff66] bg-[#7dbbff1a] text-white'
                    : 'border-white/10 bg-white/[0.015] text-white/55'
                }`}
              >
                <div className="font-dashboard-mono text-[10px] tracking-[0.08em]">{stage.number}</div>
                <div className="mt-2 flex justify-center">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <div className="mt-2 text-[11px] leading-tight font-medium">{stage.title}</div>
              </div>
            );
          })}
        </div>

        <div className="relative mt-7 h-[78px]">
          <div className="absolute top-0 left-[8%] right-[24%] h-[56px] rounded-b-[36px] border-x border-b border-dashed border-[#7dbbff88]" />
          <div className="absolute left-[11%] top-[40px] text-[#7dbbff]">
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
          </div>
          <p className="font-dashboard-mono absolute left-1/2 top-[62px] -translate-x-1/2 text-[10px] tracking-[0.12em] text-white/62 whitespace-nowrap">
            ↻ closes the loop - back to the start
          </p>
        </div>
      </div>
    </section>
  );
}

function PerspectiveToggle({
  perspective,
  onChange,
}: {
  perspective: Perspective;
  onChange: (next: Perspective) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/14 bg-white/[0.03] p-1">
      <button
        type="button"
        onClick={() => onChange('employer')}
        className={`rounded-full px-4 py-2 text-sm transition-colors ${
          perspective === 'employer'
            ? 'bg-[#7dbbff] text-[#030213] font-semibold'
            : 'text-white/72 hover:text-white'
        }`}
      >
        View as employer
      </button>
      <button
        type="button"
        onClick={() => onChange('candidate')}
        className={`rounded-full px-4 py-2 text-sm transition-colors ${
          perspective === 'candidate'
            ? 'bg-[#10B981] text-[#032016] font-semibold'
            : 'text-white/72 hover:text-white'
        }`}
      >
        View as candidate
      </button>
    </div>
  );
}

function DataFlywheel({ accent }: { accent: string }) {
  const reduceMotion = useReducedMotion();
  const rings = useMemo(
    () => [
      { radius: 134, duration: 28, reverse: false, opacity: '5e' },
      { radius: 102, duration: 34, reverse: true, opacity: '45' },
      { radius: 72, duration: 20, reverse: false, opacity: '99' },
    ],
    [],
  );

  return (
    <div className="relative mx-auto h-[320px] w-[320px]">
      {rings.map((ring) => (
        <motion.div
          key={ring.radius}
          className="absolute top-1/2 left-1/2 rounded-full border"
          style={{
            width: ring.radius * 2,
            height: ring.radius * 2,
            marginLeft: -ring.radius,
            marginTop: -ring.radius,
            borderColor: `${accent}${ring.opacity}`,
          }}
          animate={reduceMotion ? undefined : { rotate: ring.reverse ? -360 : 360 }}
          transition={
            reduceMotion
              ? undefined
              : { duration: ring.duration, repeat: Infinity, ease: 'linear' }
          }
        >
          <div
            className="absolute top-0 left-1/2 h-[8px] w-[8px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: accent, boxShadow: `0 0 12px ${accent}` }}
          />
        </motion.div>
      ))}
      <div
        className="absolute top-1/2 left-1/2 flex h-[84px] w-[84px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
        style={{
          background: `linear-gradient(135deg, #ffffff 0%, ${accent} 100%)`,
          boxShadow: `0 10px 34px ${accent}88`,
        }}
      >
        <Zap className="h-8 w-8 text-[#030213]" strokeWidth={2} />
      </div>
      {[
        { x: 0, y: -148, t: 'TRAITS' },
        { x: 132, y: 82, t: 'MATCH' },
        { x: -132, y: 82, t: 'OUTCOME' },
      ].map((label) => (
        <span
          key={label.t}
          className="font-dashboard-mono absolute text-[10px] font-semibold tracking-[0.12em] text-white/75"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${label.x}px), calc(-50% + ${label.y}px))`,
          }}
        >
          {label.t}
        </span>
      ))}
    </div>
  );
}

export function LoopPage() {
  const [perspective, setPerspective] = useState<Perspective>('employer');
  const [activeStageId, setActiveStageId] = useState('learn');
  const activeStage = LOOP_STAGES.find((stage) => stage.id === activeStageId) ?? LOOP_STAGES[5];
  const accent = perspective === 'employer' ? MARKETING_COLORS.blue : MARKETING_COLORS.green;
  const ActiveIcon = activeStage.icon;

  return (
    <MarketingShell active="The loop" accent={accent}>
      <main className="px-6 pb-16 md:px-9">
        <section className="mx-auto max-w-[1120px] pt-10 pb-6 text-center">
          <Eyebrow color={accent}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
            The loop
          </Eyebrow>
          <h1 className="mx-auto mt-4 max-w-[940px] text-[44px] leading-[1.06] font-bold tracking-[-0.035em] text-white md:text-[62px]">
            Hiring doesn&apos;t end at the
            <br />
            offer letter.
          </h1>
          <p className="mx-auto mt-4 max-w-[660px] text-base leading-[1.65] text-white/72">
            CMe tracks what happens after hiring so your next decision is smarter than your last.
            The system keeps learning from real outcomes, not just pre-hire guesses.
          </p>
        </section>

        <MoatStrip />

        <section className="mx-auto max-w-[1120px] pb-6">
          <div className="mb-5 flex justify-center">
            <PerspectiveToggle perspective={perspective} onChange={setPerspective} />
          </div>

          <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-5 md:p-7">
            <div className="grid gap-2 md:grid-cols-6 md:gap-3">
              {LOOP_STAGES.map((stage) => {
                const Icon = stage.icon;
                const isActive = stage.id === activeStageId;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setActiveStageId(stage.id)}
                    className={`rounded-xl border px-3 py-3 text-left transition-colors ${
                      isActive
                        ? 'border-transparent text-white'
                        : 'border-white/10 bg-white/[0.015] text-white/68 hover:text-white'
                    }`}
                    style={{
                      background: isActive ? `${accent}2a` : undefined,
                    }}
                  >
                    <div className="font-dashboard-mono text-[10px] tracking-[0.08em]">{stage.number}</div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Icon className="h-4 w-4" strokeWidth={2} />
                      <span className="text-sm font-medium">{stage.title}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-[#0c0d14] p-5 md:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeStage.id}-${perspective}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${accent}26` }}
                      >
                        <ActiveIcon className="h-4.5 w-4.5" strokeWidth={2} />
                      </span>
                      <h3 className="text-xl font-semibold tracking-[-0.015em] text-white">
                        {activeStage.title}
                      </h3>
                    </div>
                    <span className="font-dashboard-mono rounded-full border border-white/12 px-3 py-1 text-[10px] tracking-[0.1em] text-white/66 uppercase">
                      {perspective}
                    </span>
                  </div>
                  <p className="max-w-3xl text-[15px] leading-7 text-white/74">
                    {perspective === 'employer' ? activeStage.employer : activeStage.candidate}
                  </p>
                  <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                    <span className="font-dashboard-mono text-[10px] tracking-[0.1em] text-white/58 uppercase">
                      Stage metric
                    </span>
                    <p className="mt-1 text-sm text-white/82">{activeStage.metric}</p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1120px] py-8">
          <div
            className="grid items-center gap-8 rounded-2xl border p-6 md:grid-cols-[1fr_0.92fr] md:p-9"
            style={{
              borderColor: `${accent}33`,
              background:
                'linear-gradient(135deg, rgba(125,187,255,0.10), rgba(139,92,246,0.06))',
            }}
          >
            <div>
              <SectionHeader
                eyebrow="Data flywheel"
                title="Every closed loop makes the next hire smarter."
                kicker="When post-hire outcomes feed back into matching, hiring quality compounds over time for both employers and candidates."
                accent={accent}
              />
              <div className="mt-6 flex flex-wrap gap-3">
                <PrimaryCta href="/onboarding/sign-in">Get started</PrimaryCta>
                <GhostCta href="/product">Back to Product</GhostCta>
              </div>
            </div>
            <DataFlywheel accent={accent} />
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
