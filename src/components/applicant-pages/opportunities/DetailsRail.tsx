import { Sparkles, X } from 'lucide-react';
import type { ApplicantOpportunity } from '../../../lib/applicantOpportunitiesMock';
import { matchScoreVisual } from './messengerUtils';
import { messengerStageUi } from './messengerLifecycle';

function MatchDial({ score, stroke }: { score: number; stroke: string }) {
  const size = 64;
  const strokeWidth = 6;
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score)) / 100;
  const dash = c * pct;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c}`}
      />
    </svg>
  );
}

export function DetailsRail({
  opportunity,
  onClose,
  onPrimaryAction,
}: {
  opportunity: ApplicantOpportunity;
  onClose: () => void;
  onPrimaryAction: () => void;
}) {
  const stage = messengerStageUi(opportunity.status);
  const { star, fitLabel } = matchScoreVisual(opportunity.matchScore);
  const ctaDisabled = opportunity.nextAction.state === 'manual';

  return (
    <aside className="animate-cme-rail-in flex min-h-0 w-[320px] shrink-0 flex-col self-stretch border-l border-black/[0.07] bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-black/[0.06] px-[18px] py-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Opportunity details</p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#374151] transition-colors hover:bg-[#f3f4f6]"
          aria-label="Close details"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
      <div className="cme-messenger-scroll min-h-0 flex-1 overflow-y-auto px-[18px] pb-6 pt-[18px]">
        <div className="flex gap-3">
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
            <MatchDial score={opportunity.matchScore} stroke={star} />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="font-dashboard-mono text-base font-semibold tabular-nums text-[#111827]">
                {opportunity.matchScore}
              </span>
            </div>
          </div>
          <div className="min-w-0 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Match score</p>
            <p className="mt-0.5 text-sm font-semibold" style={{ color: star }}>
              {fitLabel}
            </p>
            <p className="mt-1 text-xs text-[#9CA3AF]">Based on your trait profile</p>
          </div>
        </div>

        <div className="mt-6 rounded-[14px] border border-[rgba(125,187,255,0.35)] bg-gradient-to-b from-[rgba(125,187,255,0.07)] to-[rgba(125,187,255,0.02)] px-3 py-3">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#1f63b8]" strokeWidth={2} />
            <p className="text-xs font-semibold text-[#1f63b8]">Why CMe matched you here</p>
          </div>
          <div className="space-y-2 border-t border-[rgba(125,187,255,0.2)] pt-2.5">
            {opportunity.whyMatches.map((reason, index) => (
              <div key={`${index}-${reason.slice(0, 24)}`} className="flex gap-2">
                <span className="font-dashboard-mono text-xs font-medium text-[#7dbbff]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="text-[13px] leading-[1.5] text-[#374151]">{reason}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Quick facts</p>
        <div className="mt-2.5 grid grid-cols-2 gap-2.5">
          {[
            { k: 'Role', v: opportunity.role.title },
            { k: 'Location', v: opportunity.role.location },
            { k: 'Type', v: opportunity.role.employmentType },
            { k: 'Industry', v: opportunity.business.industry },
          ].map((cell) => (
            <div key={cell.k} className="rounded-[10px] bg-[#fafafa] px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">{cell.k}</p>
              <p className="mt-1 text-[12.5px] font-medium text-[#111827]">{cell.v}</p>
            </div>
          ))}
        </div>

        <div
          className="mt-5 rounded-xl border p-3.5"
          style={{
            borderColor: `${stage.color}33`,
            background: stage.bg,
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: stage.color }}>
            Next action
          </p>
          <p className="mt-1 text-sm font-semibold text-[#111827]">{opportunity.nextAction.label}</p>
          <p className="mt-2 text-xs leading-relaxed text-[#6B7280]">{opportunity.nextAction.description}</p>
          <button
            type="button"
            disabled={ctaDisabled}
            onClick={onPrimaryAction}
            className="mt-3 w-full rounded-[9px] bg-[#111827] px-3.5 py-2.5 text-[13px] font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
          >
            {opportunity.nextAction.ctaLabel}
          </button>
        </div>

        <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">Timeline</p>
        <div className="relative mt-3 pl-4">
          <div className="pointer-events-none absolute bottom-2 left-[4px] top-2 w-px bg-[#e5e7eb]" aria-hidden />
          {opportunity.timeline.map((event, idx) => (
            <div key={event.id} className="relative flex gap-3 pb-4 last:pb-0">
              <span
                className="absolute -left-0 top-1.5 h-[9px] w-[9px] shrink-0 rounded-full border-2 border-white"
                style={{
                  background: idx === opportunity.timeline.length - 1 ? stage.color : '#d1d5db',
                }}
              />
              <div className="pl-3">
                <p className="text-[12.5px] font-semibold text-[#111827]">{event.label}</p>
                <p className="mt-1 text-xs leading-normal text-[#6B7280]">{event.description}</p>
                <p className="mt-1 font-dashboard-mono text-[10px] text-[#9CA3AF]">{event.happenedAt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
