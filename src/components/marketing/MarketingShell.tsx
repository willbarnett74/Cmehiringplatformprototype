import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BrandMark, MARKETING_COLORS } from './MarketingPrimitives';

const navItems = [
  { label: 'Product', to: '/product' },
  { label: 'The loop', to: '/loop' },
];

export function MarketingShell({
  active,
  children,
  accent = MARKETING_COLORS.blue,
}: {
  active?: 'Product' | 'The loop';
  children: ReactNode;
  accent?: string;
}) {
  return (
    <div className="relative overflow-hidden bg-[#0a0a0f] text-white font-dashboard">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-[120px] -left-20 h-[520px] w-[520px] bg-[radial-gradient(circle,rgba(125,187,255,0.18),rgba(125,187,255,0)_65%)] blur-[20px]" />
        <div className="absolute -right-[100px] -bottom-[200px] h-[600px] w-[600px] bg-[radial-gradient(circle,rgba(139,92,246,0.14),rgba(139,92,246,0)_65%)] blur-[20px]" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(125,187,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(125,187,255,0.12) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)',
        }}
      />
      <div className="relative z-10 min-h-screen">
        <header className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-6 py-5 md:px-9">
          <Link to="/" aria-label="Go to home">
            <BrandMark />
          </Link>
          <nav className="flex items-center gap-6 md:gap-7">
            {navItems.map((item) => {
              const isActive = item.label === active;
              const textClass = isActive ? 'text-white' : 'text-white/70 hover:text-white/90';
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`border-b-[1.5px] pb-1 text-[13px] ${textClass}`}
                  style={{ borderBottomColor: isActive ? accent : 'transparent' }}
                >
                  {item.label}
                </Link>
              );
            })}
            <span className="h-3.5 w-px bg-white/15" />
            <Link to="/onboarding/sign-in" className="text-[13px] text-white/70 hover:text-white/90">
              Sign in
            </Link>
            <Link
              to="/onboarding/sign-in"
              state={{ signupRole: 'employer', initialMode: 'signup' }}
              className="rounded-full bg-white px-3.5 py-1.5 text-[12.5px] font-medium text-[#030213]"
            >
              Get started
            </Link>
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}
