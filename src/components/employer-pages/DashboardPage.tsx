import { useState } from 'react';
import {
  TrendingUp, Award, Zap, Users, ChevronRight, Clock,
  ArrowUp, ArrowDown, Send, CheckCircle2,
  Sparkles, Star, Info, Eye, CalendarDays, Activity,
  Briefcase, ArrowRight
} from 'lucide-react';
import { Candidate } from '../types/employer';

interface DashboardPageProps {
  hasActiveFilters: boolean;
  candidateCount: number;
  candidates: Candidate[];
  onNavigateToSearch: () => void;
  onNavigateToCandidates: () => void;
  onNavigateToInsights: () => void;
  onCandidateClick: (candidate: Candidate) => void;
}

const stageConfig = {
  newSignals: { label: 'New Signals', color: '#7DBBFF' },
  assessmentSent: { label: 'In Review', color: '#F59E0B' },
  finalRound: { label: 'Final Round', color: '#8B5CF6' },
  hired: { label: 'Hired', color: '#10B981' },
  rejected: { label: 'Rejected', color: '#EF4444' },
};

export function DashboardPage({
  candidateCount,
  candidates,
  onNavigateToSearch,
  onNavigateToCandidates,
  onNavigateToInsights,
  onCandidateClick,
}: DashboardPageProps) {

  const pipeline = {
    newSignals: candidates.filter(c => c.stage === 'newSignals').length,
    assessmentSent: candidates.filter(c => c.stage === 'assessmentSent').length,
    finalRound: candidates.filter(c => c.stage === 'finalRound').length,
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
      {/* ─── Header ─── */}
      <div className="mb-8">
        <h1 className="text-2xl text-[#111827] font-semibold mb-1">Good morning</h1>
        <p className="text-sm text-[#6B7280]">Here's where things stand at TechCorp Inc.</p>
      </div>

      {/* ─── Stats Row ─── */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Active Pipeline', value: pipelineTotal, sub: '+3 this week', subColor: '#10B981', icon: <Users className="w-[18px] h-[18px] text-[#7DBBFF]" strokeWidth={1.5} /> },
          { label: 'Avg Match Score', value: `${avgScore}%`, sub: '+5 vs last month', subColor: '#10B981', icon: <Sparkles className="w-[18px] h-[18px] text-[#7DBBFF]" strokeWidth={1.5} /> },
          { label: 'Final Round', value: pipeline.finalRound, sub: 'Decision pending', subColor: '#8B5CF6', icon: <Star className="w-[18px] h-[18px] text-[#8B5CF6]" strokeWidth={1.5} /> },
          { label: 'Time to Hire', value: '18d', sub: '-3d vs last month', subColor: '#10B981', icon: <Clock className="w-[18px] h-[18px] text-[#7DBBFF]" strokeWidth={1.5} /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 border border-black/[0.06]" style={{ borderRadius: '16px' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-[#9CA3AF]">{stat.label}</span>
              {stat.icon}
            </div>
            <p className="text-[28px] text-[#111827] font-semibold tracking-tight leading-none mb-1">{stat.value}</p>
            <p className="text-xs mt-2" style={{ color: stat.subColor }}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ─── Pipeline Bar ─── */}
      <div className="bg-white p-5 border border-black/[0.06] mb-8" style={{ borderRadius: '16px' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-[#111827] font-semibold">Pipeline</span>
          <button onClick={onNavigateToCandidates} className="text-xs text-[#7DBBFF] hover:text-[#5BA3E8] font-medium flex items-center gap-1 transition-colors">
            View all <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>

        {/* Visual bar */}
        <div className="flex h-3 overflow-hidden mb-4" style={{ borderRadius: '6px' }}>
          {pipelineTotal > 0 && (
            <>
              <div style={{ width: `${(pipeline.newSignals / pipelineTotal) * 100}%`, backgroundColor: '#7DBBFF' }} />
              <div style={{ width: `${(pipeline.assessmentSent / pipelineTotal) * 100}%`, backgroundColor: '#F59E0B' }} />
              <div style={{ width: `${(pipeline.finalRound / pipelineTotal) * 100}%`, backgroundColor: '#8B5CF6' }} />
            </>
          )}
        </div>

        {/* Stage counts */}
        <div className="flex items-center gap-6">
          {([
            { key: 'newSignals', label: 'New Signals', color: '#7DBBFF', count: pipeline.newSignals },
            { key: 'assessmentSent', label: 'In Review', color: '#F59E0B', count: pipeline.assessmentSent },
            { key: 'finalRound', label: 'Final Round', color: '#8B5CF6', count: pipeline.finalRound },
            { key: 'hired', label: 'Hired', color: '#10B981', count: pipeline.hired },
          ]).map(s => (
            <div key={s.key} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-[#6B7280]">{s.label}</span>
              <span className="text-xs text-[#111827] font-semibold">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Two-Column: Candidates Needing Attention + Insights ─── */}
      <div className="grid grid-cols-5 gap-6 mb-8">

        {/* Candidates */}
        <div className="col-span-3 bg-white p-5 border border-black/[0.06]" style={{ borderRadius: '16px' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[#111827] font-semibold">Top Candidates</span>
            <button onClick={onNavigateToSearch} className="text-xs text-[#7DBBFF] hover:text-[#5BA3E8] font-medium flex items-center gap-1 transition-colors">
              Search <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>

          <div className="space-y-2">
            {needsAttention.map(c => {
              const cfg = stageConfig[c.stage];
              return (
                <button
                  key={c.id}
                  onClick={() => onCandidateClick(c)}
                  className="w-full flex items-center gap-4 px-4 py-3 bg-[#FAFAFA] hover:bg-[#F3F4F6] transition-colors text-left"
                  style={{ borderRadius: '12px' }}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#DBEAFE] to-[#E0E7FF] flex items-center justify-center shrink-0">
                    <span className="text-xs text-[#374151] font-semibold">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#111827] font-medium truncate">{c.name}</p>
                    <p className="text-xs text-[#9CA3AF] truncate">{c.role}</p>
                  </div>
                  <span className="text-xs font-medium px-2 py-0.5" style={{ color: cfg.color, backgroundColor: cfg.color + '12', borderRadius: '6px' }}>
                    {cfg.label}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-sm text-[#111827] font-semibold">{c.score}%</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#D1D5DB] shrink-0" strokeWidth={2} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Key Insights */}
        <div className="col-span-2 bg-white p-5 border border-black/[0.06]" style={{ borderRadius: '16px' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-[#111827] font-semibold">Key Insights</span>
            <button onClick={onNavigateToInsights} className="text-xs text-[#7DBBFF] hover:text-[#5BA3E8] font-medium flex items-center gap-1 transition-colors">
              All insights <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>

          <div className="space-y-3">
            {/* Good insight */}
            <div className="p-3.5 border border-[#BBF7D0] bg-[#F0FDF4]" style={{ borderRadius: '10px' }}>
              <p className="text-[10px] text-[#166534] font-semibold uppercase tracking-wider mb-1.5">Strongest Predictor</p>
              <p className="text-xs text-[#111827] leading-relaxed">
                Candidates with high <span className="font-semibold text-[#166534]">Ownership</span> scores progress to final round 2.3x faster.
              </p>
            </div>

            {/* Watch insight */}
            <div className="p-3.5 border border-[#FDE68A] bg-[#FFFBEB]" style={{ borderRadius: '10px' }}>
              <p className="text-[10px] text-[#92400E] font-semibold uppercase tracking-wider mb-1.5">Watch</p>
              <p className="text-xs text-[#111827] leading-relaxed">
                <span className="font-semibold text-[#92400E]">Recognition</span> gap trending at 26pts between intake and 90-day pulse for recent hires.
              </p>
            </div>

            {/* Info insight */}
            <div className="p-3.5 border border-[#BFDBFE] bg-[#EFF6FF]" style={{ borderRadius: '10px' }}>
              <p className="text-[10px] text-[#1E40AF] font-semibold uppercase tracking-wider mb-1.5">Early Signal</p>
              <p className="text-xs text-[#111827] leading-relaxed">
                Remote candidates show <span className="font-semibold text-[#1E40AF]">89% retention</span> at 90 days — 12pts above on-site.
              </p>
            </div>
          </div>

          <p className="text-[10px] text-[#9CA3AF] mt-3">Based on 8 performance snapshots · State 2</p>
        </div>
      </div>

      {/* ─── Two-Column: Hiring Funnel + Open Roles ─── */}
      <div className="grid grid-cols-2 gap-6 mb-8">

        {/* Hiring Funnel */}
        <div className="bg-white p-5 border border-black/[0.06]" style={{ borderRadius: '16px' }}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm text-[#111827] font-semibold">Hiring Funnel</span>
            <span className="text-[10px] text-[#9CA3AF]">Last 30 days</span>
          </div>

          <div className="space-y-4">
            {[
              { from: 'New Signals', to: 'In Review', rate: 67, color: '#7DBBFF' },
              { from: 'In Review', to: 'Final Round', rate: 38, color: '#F59E0B' },
              { from: 'Final Round', to: 'Hired', rate: 50, color: '#8B5CF6' },
            ].map((step, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                    <span>{step.from}</span>
                    <ArrowRight className="w-3 h-3 text-[#D1D5DB]" strokeWidth={2} />
                    <span>{step.to}</span>
                  </div>
                  <span className="text-xs text-[#111827] font-semibold">{step.rate}%</span>
                </div>
                <div className="h-2 bg-[#F3F4F6] overflow-hidden" style={{ borderRadius: '4px' }}>
                  <div className="h-full transition-all duration-700" style={{ width: `${step.rate}%`, backgroundColor: step.color, borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-black/[0.05] flex items-center justify-between">
            <span className="text-xs text-[#6B7280]">Overall conversion</span>
            <span className="text-sm text-[#111827] font-semibold">12.7%</span>
          </div>
        </div>

        {/* Open Roles */}
        <div className="bg-white p-5 border border-black/[0.06]" style={{ borderRadius: '16px' }}>
          <div className="flex items-center justify-between mb-5">
            <span className="text-sm text-[#111827] font-semibold">Open Roles</span>
            <span className="text-[10px] text-[#9CA3AF]">{4} active</span>
          </div>

          <div className="space-y-2">
            {[
              { title: 'Senior Product Designer', candidates: 4, avgMatch: 91, days: 14, priority: 'high' as const },
              { title: 'Lead UX Designer', candidates: 2, avgMatch: 89, days: 21, priority: 'high' as const },
              { title: 'Product Designer', candidates: 3, avgMatch: 84, days: 8, priority: 'medium' as const },
              { title: 'Design Engineer', candidates: 0, avgMatch: 0, days: 3, priority: 'low' as const },
            ].map((role, idx) => (
              <div key={idx} className="flex items-center gap-3 px-4 py-3 bg-[#FAFAFA]" style={{ borderRadius: '10px' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{
                  backgroundColor: role.priority === 'high' ? 'rgba(239,68,68,0.08)' : role.priority === 'medium' ? 'rgba(245,158,11,0.08)' : 'rgba(156,163,175,0.08)',
                }}>
                  <Briefcase className="w-3.5 h-3.5" style={{
                    color: role.priority === 'high' ? '#EF4444' : role.priority === 'medium' ? '#F59E0B' : '#9CA3AF',
                  }} strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#111827] font-medium truncate">{role.title}</p>
                  <p className="text-[10px] text-[#9CA3AF]">{role.days}d open · {role.candidates} candidates</p>
                </div>
                {role.avgMatch > 0 && (
                  <span className="text-xs text-[#10B981] font-medium">{role.avgMatch}%</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Recent Activity ─── */}
      <div className="bg-white p-5 border border-black/[0.06]" style={{ borderRadius: '16px' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-[#111827] font-semibold">Recent Activity</span>
        </div>

        <div className="flex items-center gap-4">
          {recentItems.map((item, idx) => (
            <div key={item.id} className={`flex-1 flex items-center gap-3 px-4 py-3 bg-[#FAFAFA] ${idx < recentItems.length - 1 ? '' : ''}`} style={{ borderRadius: '10px' }}>
              <div className="w-8 h-8 rounded-full bg-[#7DBBFF] flex items-center justify-center shrink-0 text-white text-[10px] font-semibold">
                {item.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#111827] truncate">
                  <span className="font-medium">{item.name}</span>{' '}
                  <span className="text-[#6B7280]">{item.text}</span>
                </p>
                <p className="text-[10px] text-[#9CA3AF] mt-0.5">{item.time}</p>
              </div>
              {item.icon}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}