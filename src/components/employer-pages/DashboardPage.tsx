import {
  Users,
  ChevronRight,
  Clock,
  ArrowUp,
  Send,
  CheckCircle2,
  Star,
  Briefcase,
  ArrowRight,
  Target,
} from 'lucide-react';
import type { Candidate } from '../types/employer';
import { SectionRule } from './insights/shared';

interface DashboardPageProps {
  hasActiveFilters: boolean;
  candidateCount: number;
  candidates: Candidate[];
  businessName?: string;
  onNavigateToSearch: () => void;
  onNavigateToCandidates: () => void;
  onNavigateToInsights: () => void;
  onCandidateClick: (candidate: Candidate) => void;
}

const stageConfig = {
  discovered: { label: 'New Signals', color: '#7DBBFF' },
  contacted: { label: 'Assessment Sent', color: '#F59E0B' },
  interviewing: { label: 'Interviewing', color: '#8B5CF6' },
  decision: { label: 'Final Round', color: '#8B5CF6' },
  hired: { label: 'Hired', color: '#10B981' },
  rejected: { label: 'Rejected', color: '#EF4444' },
};

export function DashboardPage({
  candidateCount: _candidateCount,
  candidates,
  businessName = 'TechCorp Inc.',
  onNavigateToSearch,
  onNavigateToCandidates,
  onNavigateToInsights,
  onCandidateClick,
}: DashboardPageProps) {

  const pipeline = {
    newSignals: candidates.filter(c => c.stage === 'discovered').length,
    assessmentSent: candidates.filter(c => c.stage === 'contacted').length,
    finalRound: candidates.filter(c => c.stage === 'interviewing' || c.stage === 'decision').length,
    hired: candidates.filter(c => c.stage === 'hired').length,
  };
  const pipelineTotal = pipeline.newSignals + pipeline.assessmentSent + pipeline.finalRound;

  const avgScore = candidates.length > 0
    ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)
    : 0;

  const needsAttention = [...candidates]
    .filter(c => c.stage !== 'rejected' && c.stage !== 'hired')
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  const recentItems = [
    { id: 1, initials: 'JC', name: 'Jordan Chen', text: 'completed assessment — 94% match', time: '2h ago', icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" strokeWidth={2} /> },
    { id: 2, initials: 'CW', name: 'Casey Wong', text: 'advanced to final round', time: '5h ago', icon: <ArrowUp className="w-3.5 h-3.5 text-[#8B5CF6]" strokeWidth={2} /> },
    { id: 3, initials: 'ML', name: 'Morgan Lee', text: 'assessment link sent', time: '1d ago', icon: <Send className="w-3.5 h-3.5 text-[#7DBBFF]" strokeWidth={2} /> },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="mb-1 text-xl font-semibold tracking-[-0.02em] text-[#111827]">Good morning</h1>
        <p className="text-[13px] text-[#9CA3AF]">Here&apos;s where things stand at {businessName}.</p>
      </div>

      <div className="mb-6 grid grid-cols-4 gap-4">
        {[
          {
            label: 'Active Pipeline',
            value: pipelineTotal,
            sub: '+3 this week',
            subColor: '#10B981',
            icon: <Users className="h-3.5 w-3.5 text-[#7DBBFF]" strokeWidth={1.75} />,
          },
          {
            label: 'Avg Match Score',
            value: `${avgScore}%`,
            sub: '+5 vs last month',
            subColor: '#10B981',
            icon: <Target className="h-3.5 w-3.5 text-[#7DBBFF]" strokeWidth={1.75} />,
          },
          {
            label: 'Final Round',
            value: pipeline.finalRound,
            sub: 'Decision pending',
            subColor: '#8B5CF6',
            icon: <Star className="h-3.5 w-3.5 text-[#8B5CF6]" strokeWidth={1.75} />,
          },
          {
            label: 'Time to Hire',
            value: '18d',
            sub: '-3d vs last month',
            subColor: '#10B981',
            icon: <Clock className="h-3.5 w-3.5 text-[#7DBBFF]" strokeWidth={1.75} />,
          },
        ].map((stat, i) => (
          <div key={i} className="rounded-md border border-black/[0.08] bg-white px-[18px] py-4">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[10px] font-normal uppercase tracking-[0.08em] text-[#9CA3AF]">
                {stat.label}
              </span>
              {stat.icon}
            </div>
            <p className="font-dashboard-mono text-[26px] font-semibold leading-none tracking-[-0.03em] text-[#111827]">
              {stat.value}
            </p>
            <p className="mt-1.5 text-[11px] font-medium" style={{ color: stat.subColor }}>
              {stat.sub}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-6 rounded-md border border-black/[0.08] bg-white px-5 py-4">
        <div className="mb-3.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-[#111827]">Pipeline</span>
          <button
            type="button"
            onClick={onNavigateToCandidates}
            className="flex items-center gap-1 text-[11.5px] font-medium text-[#7DBBFF] transition-colors hover:text-[#5BA3E8]"
          >
            View all <ChevronRight className="h-3 w-3" strokeWidth={2} />
          </button>
        </div>

        <div className="mb-3 flex h-1 overflow-hidden rounded-sm">
          {pipelineTotal > 0 && (
            <>
              <div style={{ width: `${(pipeline.newSignals / pipelineTotal) * 100}%`, backgroundColor: '#7DBBFF' }} />
              <div style={{ width: `${(pipeline.assessmentSent / pipelineTotal) * 100}%`, backgroundColor: '#F59E0B' }} />
              <div style={{ width: `${(pipeline.finalRound / pipelineTotal) * 100}%`, backgroundColor: '#8B5CF6' }} />
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-6">
          {(
            [
              { key: 'newSignals', label: 'New Signals', color: '#7DBBFF', count: pipeline.newSignals },
              { key: 'assessmentSent', label: 'Assessment Sent', color: '#F59E0B', count: pipeline.assessmentSent },
              { key: 'finalRound', label: 'Final Round', color: '#8B5CF6', count: pipeline.finalRound },
              { key: 'hired', label: 'Hired', color: '#10B981', count: pipeline.hired },
            ] as const
          ).map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-[11.5px] text-[#6B7280]">{s.label}</span>
              <span className="font-dashboard-mono text-[11.5px] font-semibold text-[#111827]">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-md border border-black/[0.08] bg-white px-5 py-4 lg:col-span-3">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111827]">Top Candidates</span>
            <button
              type="button"
              onClick={onNavigateToSearch}
              className="flex items-center gap-1 text-[11.5px] font-medium text-[#7DBBFF] transition-colors hover:text-[#5BA3E8]"
            >
              Search <ChevronRight className="h-3 w-3" strokeWidth={2} />
            </button>
          </div>

          <div className="flex flex-col gap-0.5">
            {needsAttention.map((c) => {
              const cfg = stageConfig[c.stage];
              const scoreColor = c.score >= 90 ? '#10B981' : c.score >= 85 ? '#7dbbff' : '#6B7280';
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onCandidateClick(c)}
                  className="flex w-full items-center gap-3 rounded-[5px] bg-[#fafafa] px-3 py-2.5 text-left transition-colors hover:bg-[#F3F4F6]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#DBEAFE] to-[#E0E7FF]">
                    <span className="text-[10.5px] font-semibold text-[#374151]">
                      {c.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-[#111827]">{c.name}</p>
                    <p className="truncate text-[11px] text-[#9CA3AF]">{c.role}</p>
                  </div>
                  <span
                    className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{ color: cfg.color, backgroundColor: `${cfg.color}14` }}
                  >
                    {cfg.label}
                  </span>
                  <span
                    className="shrink-0 font-dashboard-mono text-[13px] font-bold"
                    style={{ color: scoreColor }}
                  >
                    {c.score}
                  </span>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#D1D5DB]" strokeWidth={2} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-md border border-black/[0.08] bg-white px-5 py-4 lg:col-span-2">
          <div className="mb-3.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111827]">Key Insights</span>
            <button
              type="button"
              onClick={onNavigateToInsights}
              className="flex items-center gap-1 text-[11.5px] font-medium text-[#7DBBFF] transition-colors hover:text-[#5BA3E8]"
            >
              All insights <ChevronRight className="h-3 w-3" strokeWidth={2} />
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="rounded-[5px] border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-3">
              <p className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#166534]">
                Strongest Predictor
              </p>
              <p className="text-xs text-[#111827] leading-relaxed">
                Candidates with high <span className="font-semibold text-[#166534]">Ownership</span> scores progress to final round 2.3x faster.
              </p>
            </div>

            <div className="rounded-[5px] border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-3">
              <p className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#92400E]">Watch</p>
              <p className="text-xs leading-relaxed text-[#111827]">
                <span className="font-semibold text-[#92400E]">Recognition</span> gap trending at 26pts between intake and 90-day pulse for recent hires.
              </p>
            </div>

            <div className="rounded-[5px] border border-[#BFDBFE] bg-[#EFF6FF] px-3.5 py-3">
              <p className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-[#1E40AF]">Early Signal</p>
              <p className="text-xs text-[#111827] leading-relaxed">
                Remote candidates show <span className="font-semibold text-[#1E40AF]">89% retention</span> at 90 days — 12pts above on-site.
              </p>
            </div>
          </div>

          <p className="text-[10px] text-[#9CA3AF] mt-3">Based on 8 performance snapshots · State 2</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-md border border-black/[0.08] bg-white px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111827]">Hiring Funnel</span>
            <span className="text-[10px] text-[#9CA3AF]">Last 30 days</span>
          </div>

          <div className="space-y-3.5">
            {(
              [
                { from: 'New Signals', to: 'Assessment Sent', rate: 67, color: '#7DBBFF' },
                { from: 'Assessment Sent', to: 'Final Round', rate: 38, color: '#F59E0B' },
                { from: 'Final Round', to: 'Hired', rate: 50, color: '#8B5CF6' },
              ] as const
            ).map((step, idx) => (
              <div key={idx}>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11.5px] text-[#6B7280]">
                    <span>{step.from}</span>
                    <ArrowRight className="h-3 w-3 text-[#D1D5DB]" strokeWidth={2} />
                    <span>{step.to}</span>
                  </div>
                  <span className="font-dashboard-mono text-[11.5px] font-semibold text-[#111827]">{step.rate}%</span>
                </div>
                <div className="h-[3px] overflow-hidden rounded-sm bg-[#EBEBEB]">
                  <div
                    className="h-full transition-all duration-700"
                    style={{ width: `${step.rate}%`, backgroundColor: step.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-black/[0.06] pt-3">
            <span className="text-[11.5px] text-[#9CA3AF]">Overall conversion</span>
            <span className="font-dashboard-mono text-xs font-semibold text-[#111827]">12.7%</span>
          </div>
        </div>

        <div className="rounded-md border border-black/[0.08] bg-white px-5 py-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#111827]">Open Roles</span>
            <span className="text-[10px] text-[#9CA3AF]">4 active</span>
          </div>

          <div className="flex flex-col gap-1.5">
            {[
              { title: 'Senior Product Designer', candidates: 4, avgMatch: 91, days: 14, priority: 'high' as const },
              { title: 'Lead UX Designer', candidates: 2, avgMatch: 89, days: 21, priority: 'high' as const },
              { title: 'Product Designer', candidates: 3, avgMatch: 84, days: 8, priority: 'medium' as const },
              { title: 'Design Engineer', candidates: 0, avgMatch: 0, days: 3, priority: 'low' as const },
            ].map((role, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 rounded-[5px] bg-[#fafafa] px-3 py-2.5"
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{
                    backgroundColor:
                      role.priority === 'high'
                        ? 'rgba(239,68,68,0.08)'
                        : role.priority === 'medium'
                          ? 'rgba(245,158,11,0.08)'
                          : 'rgba(156,163,175,0.08)',
                  }}
                >
                  <Briefcase
                    className="h-3.5 w-3.5"
                    style={{
                      color: role.priority === 'high' ? '#EF4444' : role.priority === 'medium' ? '#F59E0B' : '#9CA3AF',
                    }}
                    strokeWidth={2}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12.5px] font-medium text-[#111827]">{role.title}</p>
                  <p className="text-[10.5px] text-[#9CA3AF]">
                    {role.days}d open · {role.candidates} candidates
                  </p>
                </div>
                {role.avgMatch > 0 && (
                  <span className="font-dashboard-mono text-[11.5px] font-semibold text-[#10B981]">{role.avgMatch}%</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionRule mt={0} mb={16}>
        Recent Activity
      </SectionRule>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-3">
        {recentItems.map((item) => (
          <div
            key={item.id}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-md border border-black/[0.08] bg-white px-3.5 py-3"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#7DBBFF] text-[10px] font-semibold text-white">
              {item.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12.5px] text-[#111827]">
                <span className="font-medium">{item.name}</span>{' '}
                <span className="text-[#6B7280]">{item.text}</span>
              </p>
              <p className="font-dashboard-mono mt-0.5 text-[10px] text-[#9CA3AF]">{item.time}</p>
            </div>
            <div className="shrink-0">{item.icon}</div>
          </div>
        ))}
      </div>
    </div>
  );
}