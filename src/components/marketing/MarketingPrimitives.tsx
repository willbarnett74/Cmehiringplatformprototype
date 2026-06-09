import type { ReactNode } from 'react';
import { ArrowRight, Compass } from 'lucide-react';

export const MARKETING_COLORS = {
  blue: '#7dbbff',
  blueHover: '#6aabef',
  navy: '#030213',
  dark: '#0a0a0f',
  green: '#10B981',
  violet: '#8B5CF6',
} as const;

export function Eyebrow({
  children,
  color = MARKETING_COLORS.blue,
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <span
      className="font-dashboard-mono inline-flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.18em]"
      style={{ color }}
    >
      {children}
    </span>
  );
}

export function Pill({ children, color = MARKETING_COLORS.blue }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="inline-flex items-center rounded-full border px-3 py-[5px] text-[11.5px] font-medium leading-none whitespace-nowrap"
      style={{
        color,
        backgroundColor: 'rgba(125,187,255,0.1)',
        borderColor: `${color}33`,
      }}
    >
      {children}
    </span>
  );
}

export function PrimaryCta({
  children,
  href,
  color = MARKETING_COLORS.blue,
}: {
  children: ReactNode;
  href?: string;
  color?: string;
}) {
  const body = (
    <>
      <span>{children}</span>
      <ArrowRight className="h-4 w-4" strokeWidth={2} />
    </>
  );
  const className =
    'inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5';
  const style = {
    backgroundColor: color,
    boxShadow: '0 8px 24px rgba(125,187,255,0.35)',
  };

  if (href) {
    return (
      <a href={href} className={className} style={style}>
        {body}
      </a>
    );
  }

  return (
    <button type="button" className={className} style={style}>
      {body}
    </button>
  );
}

export function GhostCta({ children, href }: { children: ReactNode; href?: string }) {
  const body = (
    <>
      <span>{children}</span>
      <ArrowRight className="h-4 w-4" strokeWidth={2} />
    </>
  );
  const className =
    'inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-[13.5px] font-medium text-white/85 transition-colors hover:border-white/30 hover:text-white';

  if (href) {
    return (
      <a href={href} className={className}>
        {body}
      </a>
    );
  }

  return (
    <button type="button" className={className}>
      {body}
    </button>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  kicker,
  align = 'left',
  accent = MARKETING_COLORS.blue,
}: {
  eyebrow?: string;
  title: string;
  kicker?: string;
  align?: 'left' | 'center';
  accent?: string;
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-[720px] text-center' : undefined}>
      {eyebrow ? (
        <Eyebrow color={accent}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />
          {eyebrow}
        </Eyebrow>
      ) : null}
      <h2 className="mt-3.5 text-[34px] leading-[1.08] font-bold tracking-[-0.03em] text-white md:text-[42px]">
        {title}
      </h2>
      {kicker ? <p className="mt-3 text-[15.5px] leading-7 text-white/65">{kicker}</p> : null}
    </div>
  );
}

export function MarketingCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[14px] border border-white/8 bg-white/[0.03] p-[22px] ${className ?? ''}`}
    >
      {children}
    </div>
  );
}

export function BrandMark() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[7px] bg-[#7dbbff]">
        <Compass className="h-[15px] w-[15px] text-white" strokeWidth={2} />
      </span>
      <span className="font-dashboard text-base font-semibold tracking-[-0.01em] text-white">CMe</span>
    </span>
  );
}
