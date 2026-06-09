import { Link } from 'react-router-dom';
import { MarketingShell } from './MarketingShell';
import { Eyebrow, MARKETING_COLORS, PrimaryCta } from './MarketingPrimitives';

const pageConfig = {
  loop: {
    eyebrow: 'The loop',
    title: "The loop page is coming next.",
    description:
      'This will explain the full Discover -> Match -> Interview -> Hire -> Onboard -> Learn cycle and how each stage feeds the next.',
    active: 'The loop' as const,
  },
  sampleProfile: {
    eyebrow: 'Sample profile',
    title: 'Sample candidate profile preview.',
    description:
      'This placeholder represents the profile view people reach from "See a sample profile". It will become an interactive demo screen.',
    active: 'Product' as const,
  },
  talkToUs: {
    eyebrow: 'Talk to us',
    title: 'Contact and sales flow placeholder.',
    description:
      'This screen will become the inquiry/contact experience for hiring teams who want to discuss their stack and setup.',
    active: 'Product' as const,
  },
};

export function MarketingPlaceholderPage({ kind }: { kind: keyof typeof pageConfig }) {
  const config = pageConfig[kind];
  return (
    <MarketingShell active={config.active}>
      <main className="mx-auto flex min-h-[70vh] w-full max-w-[980px] items-center px-6 py-16 md:px-9">
        <section className="w-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-12">
          <Eyebrow color={MARKETING_COLORS.blue}>
            <span className="h-1.5 w-1.5 rounded-full bg-[#7dbbff]" />
            {config.eyebrow}
          </Eyebrow>
          <h1 className="mt-4 text-4xl leading-tight font-bold tracking-[-0.03em] text-white md:text-5xl">
            {config.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">{config.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PrimaryCta href="/product">Back to Product</PrimaryCta>
            <Link
              to="/onboarding/sign-in"
              className="inline-flex items-center rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white/85 hover:border-white/30 hover:text-white"
            >
              Go to Sign in
            </Link>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
