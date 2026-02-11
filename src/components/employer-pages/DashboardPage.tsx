import { TrendingUp, Award, Target, Zap, Users, ChevronRight, Clock, MapPin, Briefcase, Info, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface DashboardPageProps {
  hasActiveFilters: boolean;
  candidateCount: number;
  onNavigateToSearch: () => void;
}

export function DashboardPage({ hasActiveFilters, candidateCount, onNavigateToSearch }: DashboardPageProps) {
  const insights = hasActiveFilters ? [
    'Filtered candidates show 15% higher collaboration scores',
    'Your current filters match 3 high-priority candidates',
    'Narrow your location filter to see more local talent',
  ] : [
    'Top performers score high on ownership and learning speed',
    'Collaborative candidates convert 2.3x better',
    'Remote preference correlates with autonomy trait',
  ];

  const stats = {
    newSignals: 12,
    inReview: 8,
    finalRound: 3,
    avgMatchScore: 87,
  };

  const topSignals = [
    { rank: 1, signal: 'Learning Speed', successRate: 92, change: 8, trend: 'up' },
    { rank: 2, signal: 'Ownership', successRate: 88, change: 5, trend: 'up' },
    { rank: 3, signal: 'Collaboration', successRate: 85, change: 0, trend: 'stable' },
    { rank: 4, signal: 'Adaptability', successRate: 82, change: 12, trend: 'up' },
    { rank: 5, signal: 'Communication', successRate: 78, change: -3, trend: 'down' },
    { rank: 6, signal: 'Problem Solving', successRate: 76, change: 4, trend: 'up' },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUp className="w-3 h-3 text-[#10B981]" strokeWidth={2} />;
    if (trend === 'down') return <ArrowDown className="w-3 h-3 text-[#EF4444]" strokeWidth={2} />;
    return <Minus className="w-3 h-3 text-[#9CA3AF]" strokeWidth={2} />;
  };

  const getTrendColor = (trend: string) => {
    if (trend === 'up') return 'text-[#10B981]';
    if (trend === 'down') return 'text-[#EF4444]';
    return 'text-[#9CA3AF]';
  };

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl text-[#111827] font-semibold mb-1">Dashboard</h1>
        <p className="text-sm text-[#6B7280]">Overview of your hiring pipeline</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            </div>
            <span className="text-xs text-[#6B7280]">New Signals</span>
          </div>
          <p className="text-2xl text-[#111827] font-semibold">{stats.newSignals}</p>
          <p className="text-xs text-[#10B981] mt-1">+3 this week</p>
        </div>

        <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            </div>
            <span className="text-xs text-[#6B7280]">In Review</span>
          </div>
          <p className="text-2xl text-[#111827] font-semibold">{stats.inReview}</p>
          <p className="text-xs text-[#6B7280] mt-1">Active assessments</p>
        </div>

        <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            </div>
            <span className="text-xs text-[#6B7280]">Final Round</span>
          </div>
          <p className="text-2xl text-[#111827] font-semibold">{stats.finalRound}</p>
          <p className="text-xs text-[#F59E0B] mt-1">Decision pending</p>
        </div>

        <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            </div>
            <span className="text-xs text-[#6B7280]">Avg Match Score</span>
          </div>
          <p className="text-2xl text-[#111827] font-semibold">{stats.avgMatchScore}</p>
          <p className="text-xs text-[#10B981] mt-1">+5 vs last month</p>
        </div>
      </div>

      {/* Top Signals by Success Rate */}
      <div className="bg-white p-6 border border-black/[0.08] shadow-sm mb-6" style={{ borderRadius: '20px' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8B5CF6]/10 to-[#14B8A6]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#8B5CF6]" strokeWidth={1.5} />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-base text-[#111827] font-semibold">Top Signals by Success Rate</h3>
              <div className="group relative">
                <Info className="w-4 h-4 text-[#9CA3AF] cursor-help" strokeWidth={1.5} />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#111827] text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-64" style={{ borderRadius: '8px' }}>
                  Shows which candidate traits have highest conversion rates from shortlist to hire over the past 30 days.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#111827] transform rotate-45" />
                </div>
              </div>
            </div>
          </div>
          <button className="text-xs text-[#7DBBFF] hover:text-[#6aabef] font-medium flex items-center gap-1">
            <span>View full signal insights</span>
            <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>

        {/* Data Grid */}
        <div className="space-y-3">
          {topSignals.map((signal, idx) => (
            <div key={signal.rank} className={`flex items-center gap-4 p-4 bg-[#F9F9FA] hover:bg-[#F3F3F5] transition-colors ${idx === 0 ? 'border-l-2 border-[#8B5CF6]' : ''}`} style={{ borderRadius: '12px' }}>
              {/* Rank */}
              <div className="flex items-center justify-center w-8 h-8 shrink-0">
                {idx === 0 ? (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{signal.rank}</span>
                  </div>
                ) : (
                  <span className="text-sm text-[#9CA3AF] font-semibold">{signal.rank}</span>
                )}
              </div>

              {/* Signal Name */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#111827] font-semibold">{signal.signal}</p>
              </div>

              {/* Success Rate with Progress Bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[#6B7280]">Success Rate</span>
                  <span className="text-sm text-[#111827] font-semibold">{signal.successRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/[0.06] overflow-hidden" style={{ borderRadius: '4px' }}>
                  <div
                    className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] transition-all duration-500"
                    style={{ width: `${signal.successRate}%`, borderRadius: '4px' }}
                  />
                </div>
              </div>

              {/* Change / Trend */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1">
                  {getTrendIcon(signal.trend)}
                  <span className={`text-xs font-semibold ${getTrendColor(signal.trend)}`}>
                    {signal.change > 0 ? '+' : ''}{signal.change}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Recent Activity */}
        <div className="col-span-2 bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base text-[#111827] font-semibold">Recent Activity</h3>
            <button
              onClick={onNavigateToSearch}
              className="text-sm text-[#7DBBFF] hover:text-[#6aabef] transition-colors"
            >
              View all
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-[#F9F9FA] hover:bg-[#F3F3F5] transition-colors cursor-pointer" style={{ borderRadius: '12px' }}>
              <div className="w-10 h-10 rounded-full bg-[#7DBBFF] flex items-center justify-center shrink-0 text-white text-sm font-semibold">
                JC
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#111827] font-medium mb-1">Jordan Chen completed assessment</p>
                <p className="text-xs text-[#6B7280]">Senior Product Designer • Score: 94/100</p>
                <p className="text-xs text-[#9CA3AF] mt-1">2 hours ago</p>
              </div>
              <div className="flex gap-1.5">
                <span className="px-2.5 py-1 bg-[#7DBBFF]/10 text-[#7DBBFF] text-xs font-medium" style={{ borderRadius: '6px' }}>
                  Ownership
                </span>
                <span className="px-2.5 py-1 bg-[#7DBBFF]/10 text-[#7DBBFF] text-xs font-medium" style={{ borderRadius: '6px' }}>
                  Learning
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-[#F9F9FA] hover:bg-[#F3F3F5] transition-colors cursor-pointer" style={{ borderRadius: '12px' }}>
              <div className="w-10 h-10 rounded-full bg-[#7DBBFF] flex items-center justify-center shrink-0 text-white text-sm font-semibold">
                RM
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#111827] font-medium mb-1">Riley Martinez moved to final round</p>
                <p className="text-xs text-[#6B7280]">Lead UX Designer • Score: 91/100</p>
                <p className="text-xs text-[#9CA3AF] mt-1">5 hours ago</p>
              </div>
              <div className="flex gap-1.5">
                <span className="px-2.5 py-1 bg-[#7DBBFF]/10 text-[#7DBBFF] text-xs font-medium" style={{ borderRadius: '6px' }}>
                  Communication
                </span>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-[#F9F9FA] hover:bg-[#F3F3F5] transition-colors cursor-pointer" style={{ borderRadius: '12px' }}>
              <div className="w-10 h-10 rounded-full bg-[#7DBBFF] flex items-center justify-center shrink-0 text-white text-sm font-semibold">
                TK
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#111827] font-medium mb-1">Taylor Kim added new signal</p>
                <p className="text-xs text-[#6B7280]">Product Designer • Score: 88/100</p>
                <p className="text-xs text-[#9CA3AF] mt-1">1 day ago</p>
              </div>
              <div className="flex gap-1.5">
                <span className="px-2.5 py-1 bg-[#7DBBFF]/10 text-[#7DBBFF] text-xs font-medium" style={{ borderRadius: '6px' }}>
                  Creativity
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Panel */}
        <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            <h3 className="text-base text-[#111827] font-semibold">Insights</h3>
          </div>
          <div className="space-y-3 mb-6">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="flex gap-3 p-3 bg-[#F9F9FA]"
                style={{ borderRadius: '12px' }}
              >
                <div className="w-1 h-1 rounded-full bg-[#7DBBFF] mt-2 shrink-0" />
                <p className="text-sm text-[#6B7280]">{insight}</p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-black/[0.08]">
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
              <span className="text-sm text-[#6B7280]">Top Traits</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 bg-[#7DBBFF]/10 text-[#7DBBFF] text-xs font-medium" style={{ borderRadius: '10px' }}>
                Ownership
              </span>
              <span className="px-3 py-1.5 bg-[#7DBBFF]/10 text-[#7DBBFF] text-xs font-medium" style={{ borderRadius: '10px' }}>
                Learning
              </span>
              <span className="px-3 py-1.5 bg-[#7DBBFF]/10 text-[#7DBBFF] text-xs font-medium" style={{ borderRadius: '10px' }}>
                Collaboration
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Snapshot Row */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            <span className="text-xs text-[#6B7280]">Avg. Time to Hire</span>
          </div>
          <p className="text-2xl text-[#111827] font-semibold">18 days</p>
          <p className="text-xs text-[#10B981] mt-1">-3 days vs last month</p>
        </div>

        <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            <span className="text-xs text-[#6B7280]">Top Converting Trait</span>
          </div>
          <p className="text-lg text-[#111827] font-semibold">Ownership</p>
          <p className="text-xs text-[#6B7280] mt-1">76% conversion rate</p>
        </div>

        <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            <span className="text-xs text-[#6B7280]">Remote Role Success</span>
          </div>
          <p className="text-2xl text-[#111827] font-semibold">89%</p>
          <p className="text-xs text-[#10B981] mt-1">+12% this quarter</p>
        </div>

        <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-3">
            <Briefcase className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            <span className="text-xs text-[#6B7280]">Current Openings</span>
          </div>
          <p className="text-2xl text-[#111827] font-semibold">7</p>
          <p className="text-xs text-[#6B7280] mt-1">3 high priority</p>
        </div>
      </div>
    </div>
  );
}