import {
  Activity,
  Briefcase,
  FlaskConical,
  Globe,
  Layers,
  Lock,
  SlidersHorizontal,
  Target,
  User,
  Zap,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { MarketingShell } from './MarketingShell';
import {
  Eyebrow,
  GhostCta,
  MARKETING_COLORS,
  MarketingCard,
  Pill,
  PrimaryCta,
  SectionHeader,
} from './MarketingPrimitives';

const SIX_TRAITS = [
  'Learning Velocity',
  'Ownership',
  'Resilience',
  'Communication Confidence',
  'Relational Intelligence',
  'Motivational Fit',
];

const SIX_DIMENSIONS = [
  {
    name: 'Learning Velocity',
    def: 'How quickly someone picks up new skills, absorbs feedback, and adapts to unfamiliar problems.',
  },
  {
    name: 'Ownership & Follow-Through',
    def: 'Taking genuine responsibility for outcomes and following through regardless of conditions.',
  },
  {
    name: 'Resilience',
    def: 'Composure and recovery under pressure, setbacks, and ambiguity.',
  },
  {
    name: 'Communication Confidence',
    def: 'Clarity and assurance in expressing ideas and engaging others.',
  },
  {
    name: 'Relational Intelligence',
    def: 'Reading people and situations, building trust, navigating team dynamics.',
  },
  {
    name: 'Motivational Fit',
    def: 'Alignment between what genuinely drives a person and what a role offers - grounded in Self-Determination Theory.',
  },
];

const DATA_OWNERSHIP = [
  { icon: User, line: 'You own your profile and can take it anywhere.' },
  {
    icon: Layers,
    line: 'Employers see scoped, aggregate-by-default views - never raw inputs stripped of context.',
  },
  { icon: Globe, line: "Hosted inside New Zealand data-sovereignty boundaries." },
  { icon: Target, line: "Every form tells you what's collected and why, before you answer." },
];

const PRODUCT_FEATURES = [
  {
    icon: Target,
    title: 'Trait-based matching',
    body: 'Match scoring runs on behavioural signal - not keyword overlap or resume fuzz.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Configurable role weightings',
    body: 'Tell us what matters for this role. Six dimensions, ten templates, full control.',
  },
  {
    icon: FlaskConical,
    title: 'Psychometric assessment',
    body: 'Structured questions plus LLM-scored open text. Grounded in Big Five research.',
  },
  {
    icon: Activity,
    title: 'Post-hire performance loop',
    body: '30 and 90-day snapshots from both sides close the loop between hire and outcome.',
  },
  {
    icon: Lock,
    title: 'Hard to game',
    body: 'Opposing trait axes and randomised ordering mean candidates cannot reverse-engineer a good answer.',
  },
  {
    icon: User,
    title: 'Candidate-owned profile',
    body: 'One profile, persistent and portable. Works across roles, employers, and time.',
  },
];

const EMPLOYER_POINTS = [
  {
    t: 'Define what matters',
    body: 'Configure trait weightings across six dimensions, or start from one of ten role templates.',
  },
  {
    t: 'Find candidates who fit',
    body: 'Match scoring ranks candidates against your specific priorities - not generic keywords.',
  },
  {
    t: 'Track what works',
    body: '30 and 90-day snapshots feed back into your insight layer. Every hire teaches the next hire.',
  },
];

const CANDIDATE_POINTS = [
  {
    t: 'Discover your traits',
    body: 'A guided assessment surfaces your behavioural profile across six dimensions, grounded in Big Five research.',
  },
  {
    t: 'One profile, many opportunities',
    body: 'Your CMe profile works across roles and employers - and keeps working after you are hired.',
  },
  {
    t: 'Get real insight',
    body: 'See where your traits align with role types and how your experience maps to what employers value.',
  },
];

function CompactFlywheel({ accent = MARKETING_COLORS.blue }: { accent?: string }) {
  const reduceMotion = useReducedMotion();
  const rings = [
    { radius: 126, duration: 24, reverse: false, borderOpacity: '66' },
    { radius: 96, duration: 30, reverse: true, borderOpacity: '44' },
    { radius: 66, duration: 18, reverse: false, borderOpacity: 'aa' },
  ];

  return (
    <div className="relative mx-auto h-[300px] w-[300px]">
      {rings.map((ring) => (
        <motion.div
          key={ring.radius}
          className="absolute top-1/2 left-1/2 rounded-full border"
          style={{
            width: ring.radius * 2,
            height: ring.radius * 2,
            marginLeft: -ring.radius,
            marginTop: -ring.radius,
            borderColor: `${accent}${ring.borderOpacity}`,
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  rotate: ring.reverse ? -360 : 360,
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: ring.duration,
                  repeat: Infinity,
                  ease: 'linear',
                }
          }
        >
          <div
            className="absolute top-0 left-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }}
          />
        </motion.div>
      ))}
      <div
        className="absolute top-1/2 left-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
        style={{
          background: `linear-gradient(135deg, #ffffff 0%, ${accent} 100%)`,
          boxShadow: `0 10px 32px ${accent}88`,
        }}
      >
        <Zap className="h-[26px] w-[26px] text-[#030213]" strokeWidth={2} />
      </div>
      {[
        { x: 0, y: -138, label: 'TRAITS' },
        { x: 120, y: 78, label: 'MATCH' },
        { x: -120, y: 78, label: 'OUTCOME' },
      ].map((item) => (
        <span
          key={item.label}
          className="font-dashboard-mono absolute text-[10px] font-semibold tracking-[0.12em] text-white/70"
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${item.x}px), calc(-50% + ${item.y}px))`,
          }}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

function AudienceCard({
  side,
  title,
  accent,
  points,
}: {
  side: 'employer' | 'candidate';
  title: string;
  accent: string;
  points: typeof EMPLOYER_POINTS;
}) {
  const Icon = side === 'employer' ? Briefcase : User;
  return (
    <MarketingCard className="p-7">
      <div className="flex items-start gap-3">
        <div
          className="flex h-[38px] w-[38px] items-center justify-center rounded-[9px] border"
          style={{ backgroundColor: `${accent}1f`, borderColor: `${accent}40` }}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color: accent }} strokeWidth={2} />
        </div>
        <div>
          <Eyebrow color={accent}>{side === 'employer' ? 'For employers' : 'For candidates'}</Eyebrow>
          <h3 className="mt-1 text-[22px] leading-tight font-semibold tracking-[-0.02em] text-white">{title}</h3>
        </div>
      </div>
      <div className="mt-5 space-y-4">
        {points.map((point, index) => (
          <div
            key={point.t}
            className={`${index > 0 ? 'border-t border-white/6 pt-4' : ''} flex gap-3.5`}
          >
            <span className="font-dashboard-mono mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-white/12 bg-white/4 text-[10px] text-white/60">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div>
              <h4 className="mb-1 text-sm font-semibold tracking-[-0.005em] text-white">{point.t}</h4>
              <p className="text-[13px] leading-[1.55] text-white/65">{point.body}</p>
            </div>
          </div>
        ))}
      </div>
    </MarketingCard>
  );
}

export function ProductPage() {
  const accent = MARKETING_COLORS.blue;

  return (
    <MarketingShell active="Product" accent={accent}>
      <main className="px-6 pb-14 md:px-9">
        <section className="mx-auto max-w-[1160px] pt-10 pb-14 text-center">
          <Eyebrow color={accent}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
            Product
          </Eyebrow>
          <h1 className="mx-auto mt-4 max-w-[880px] text-[44px] leading-[1.06] font-bold tracking-[-0.035em] text-white md:text-[62px]">
            See the person
            <br />
            behind the{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #7dbbff 0%, #b8d8ff 60%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              resume.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-[580px] text-base leading-[1.6] text-white/70">
            CMe uses trait analysis and behavioural insight to match candidates to roles based on who they
            actually are - not just what is on paper.
          </p>
          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3">
            <PrimaryCta href="/onboarding/sign-in">Get started</PrimaryCta>
            <GhostCta href="/sample-profile">See a sample profile</GhostCta>
          </div>
          <div className="mx-auto mt-9 flex max-w-[860px] flex-wrap items-center justify-center gap-2.5">
            {SIX_TRAITS.map((trait) => (
              <Pill key={trait}>{trait}</Pill>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] pt-8 pb-6">
          <SectionHeader
            align="center"
            accent={accent}
            eyebrow="Two sides, one system"
            title="Built for the people on both ends of the hire."
            kicker="Employers configure what a great hire looks like. Candidates show who they are. CMe matches the two on substance."
          />
          <div className="mt-9 grid gap-5 lg:grid-cols-2">
            <AudienceCard side="employer" title="Hire on substance." accent={accent} points={EMPLOYER_POINTS} />
            <AudienceCard
              side="candidate"
              title="A profile that's yours."
              accent={MARKETING_COLORS.green}
              points={CANDIDATE_POINTS}
            />
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] py-6">
          <div className="rounded-[18px] border border-[#10B98133] bg-white/[0.025] px-6 py-7 md:px-8">
            <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <Eyebrow color={MARKETING_COLORS.green}>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
                  Your data, your profile
                </Eyebrow>
                <h3 className="mt-3 text-[26px] leading-[1.15] font-bold tracking-[-0.02em] text-white">
                  Candidates own what
                  <br />
                  CMe knows about them.
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {DATA_OWNERSHIP.map((item) => (
                  <div key={item.line} className="flex items-start gap-3">
                    <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] border border-[#10B98166] bg-[#10B9811a]">
                      <item.icon className="h-[15px] w-[15px] text-[#10B981]" strokeWidth={2} />
                    </div>
                    <p className="pt-0.5 text-[12.5px] leading-[1.5] text-white/72">{item.line}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] py-8">
          <div className="grid items-center gap-8 rounded-[20px] border border-[#7dbbff33] bg-[linear-gradient(135deg,rgba(125,187,255,0.10),rgba(139,92,246,0.06))] p-7 md:p-11 lg:grid-cols-[1fr_0.85fr]">
            <div>
              <Eyebrow color={accent}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
                The compounding advantage
              </Eyebrow>
              <h2 className="mt-3.5 mb-4 text-[34px] leading-[1.1] font-bold tracking-[-0.025em] text-white md:text-[38px]">
                CMe gets sharper
                <br />
                every time you hire.
              </h2>
              <p className="max-w-[520px] text-[15px] leading-[1.65] text-white/75">
                Every assessment, every hire, and every 30 and 90-day snapshot becomes data. Over time, CMe
                learns which trait profiles actually succeed in roles for your business specifically.
                <span className="text-white">
                  {' '}
                  Matching gets you a strong first hire. The insight layer makes every hire after it better.
                </span>
              </p>
            </div>
            <CompactFlywheel accent={accent} />
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] pt-8 pb-4">
          <SectionHeader
            align="center"
            accent={accent}
            eyebrow="What we actually measure"
            title="Six dimensions that predict who thrives."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SIX_DIMENSIONS.map((dimension, index) => (
              <MarketingCard key={dimension.name} className="p-5">
                <div className="mb-2 flex items-baseline gap-2.5">
                  <span className="font-dashboard-mono text-[11px] tracking-[0.08em]" style={{ color: accent }}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-[14.5px] leading-[1.2] font-semibold tracking-[-0.01em] text-white">
                    {dimension.name}
                  </h3>
                </div>
                <p className="text-[12.5px] leading-[1.55] text-white/60">{dimension.def}</p>
              </MarketingCard>
            ))}
          </div>
          <p className="font-dashboard-mono mt-4 text-center text-[11.5px] tracking-[0.05em] text-white/42">
            Six dimensions, drawn from the Big Five personality model and Self-Determination Theory.
          </p>
        </section>

        <section className="mx-auto max-w-[1100px] pt-10 pb-14">
          <SectionHeader
            align="center"
            accent={accent}
            eyebrow="What's in the box"
            title="Six things CMe does that no resume-shaped platform can."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PRODUCT_FEATURES.map((feature) => (
              <MarketingCard key={feature.title} className="p-5">
                <div className="mb-4 flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#7dbbff33] bg-[#7dbbff1a]">
                  <feature.icon className="h-[17px] w-[17px] text-[#7dbbff]" strokeWidth={2} />
                </div>
                <h3 className="mb-2 text-[15.5px] font-semibold tracking-[-0.01em] text-white">{feature.title}</h3>
                <p className="text-[12.5px] leading-[1.6] text-white/60">{feature.body}</p>
              </MarketingCard>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] pb-8">
          <div className="flex flex-col items-start justify-between gap-6 rounded-[18px] border border-[#7dbbff2e] bg-[linear-gradient(135deg,rgba(125,187,255,0.10),rgba(139,92,246,0.06))] px-8 py-7 md:flex-row md:items-center">
            <div>
              <h3 className="mb-1.5 text-[22px] leading-tight font-semibold tracking-[-0.015em] text-white">
                Ready to hire on substance?
              </h3>
              <p className="text-[13.5px] text-white/60">
                Free for candidates, always. Talk to us about your hiring stack.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <PrimaryCta href="/onboarding/sign-in">Get started</PrimaryCta>
              <GhostCta href="/talk-to-us">Talk to us</GhostCta>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
