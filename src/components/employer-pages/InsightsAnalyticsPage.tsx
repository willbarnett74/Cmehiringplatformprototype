import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Award, Clock, MapPin } from 'lucide-react';

export function InsightsAnalyticsPage() {
  // Hiring conversion rate data
  const conversionData = [
    { stage: 'Applied', count: 120, conversion: 100 },
    { stage: 'Screened', count: 85, conversion: 71 },
    { stage: 'Assessment', count: 42, conversion: 35 },
    { stage: 'Final', count: 18, conversion: 15 },
    { stage: 'Hired', count: 9, conversion: 8 },
  ];

  // Top success traits data
  const traitsData = [
    { trait: 'Ownership', successRate: 76 },
    { trait: 'Learning Speed', successRate: 72 },
    { trait: 'Collaboration', successRate: 68 },
    { trait: 'Adaptability', successRate: 65 },
    { trait: 'Communication', successRate: 62 },
    { trait: 'Innovation', successRate: 58 },
  ];

  // Time in stage data
  const timeInStageData = [
    { stage: 'New Signal', avgDays: 3 },
    { stage: 'Assessment', avgDays: 7 },
    { stage: 'Final Round', avgDays: 5 },
    { stage: 'Offer', avgDays: 3 },
  ];

  // Candidate distribution data
  const distributionData = [
    { name: 'Remote', value: 45, color: '#7DBBFF' },
    { name: 'Hybrid', value: 32, color: '#8B5CF6' },
    { name: 'On-site', value: 23, color: '#F59E0B' },
  ];

  // Hiring trends over time
  const hiringTrendsData = [
    { month: 'Jan', hires: 4, applications: 85 },
    { month: 'Feb', hires: 6, applications: 92 },
    { month: 'Mar', hires: 5, applications: 78 },
    { month: 'Apr', hires: 8, applications: 105 },
    { month: 'May', hires: 7, applications: 98 },
    { month: 'Jun', hires: 9, applications: 112 },
  ];

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl text-[#111827] font-semibold mb-1">Insights & Analytics</h1>
        <p className="text-sm text-[#6B7280]">Data-driven insights into your hiring process</p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            </div>
            <span className="text-xs text-[#6B7280]">Conversion Rate</span>
          </div>
          <p className="text-2xl text-[#111827] font-semibold">7.5%</p>
          <p className="text-xs text-[#10B981] mt-1">+1.2% vs last quarter</p>
        </div>

        <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            </div>
            <span className="text-xs text-[#6B7280]">Avg Time to Hire</span>
          </div>
          <p className="text-2xl text-[#111827] font-semibold">18 days</p>
          <p className="text-xs text-[#10B981] mt-1">-3 days improvement</p>
        </div>

        <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            </div>
            <span className="text-xs text-[#6B7280]">Quality of Hire</span>
          </div>
          <p className="text-2xl text-[#111827] font-semibold">4.6/5</p>
          <p className="text-xs text-[#6B7280] mt-1">Manager satisfaction</p>
        </div>

        <div className="bg-white p-5 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            </div>
            <span className="text-xs text-[#6B7280]">Remote Preference</span>
          </div>
          <p className="text-2xl text-[#111827] font-semibold">45%</p>
          <p className="text-xs text-[#6B7280] mt-1">Of all candidates</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Hiring Conversion Funnel */}
        <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <h3 className="text-base text-[#111827] font-semibold mb-6">Hiring Conversion Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="stage" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" fill="#7DBBFF" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-[#6B7280] mt-4 text-center">
            Overall conversion rate from application to hire: <span className="text-[#111827] font-semibold">7.5%</span>
          </p>
        </div>

        {/* Top Success Traits */}
        <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <h3 className="text-base text-[#111827] font-semibold mb-6">Top Success Traits</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={traitsData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis dataKey="trait" type="category" tick={{ fill: '#6B7280', fontSize: 12 }} width={120} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="successRate" fill="#10B981" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-[#6B7280] mt-4 text-center">
            Success rate measured by 90-day retention and performance reviews
          </p>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Average Time in Stage */}
        <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <h3 className="text-base text-[#111827] font-semibold mb-6">Average Time in Each Stage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeInStageData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="stage" tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="avgDays" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-[#6B7280] mt-4 text-center">
            Total average time to hire: <span className="text-[#111827] font-semibold">18 days</span>
          </p>
        </div>

        {/* Candidate Distribution */}
        <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <h3 className="text-base text-[#111827] font-semibold mb-6">Candidate Distribution (Remote vs On-site)</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-[#6B7280] mt-4 text-center">
            Remote roles show <span className="text-[#111827] font-semibold">12% higher</span> conversion rates
          </p>
        </div>
      </div>

      {/* Hiring Trends Over Time */}
      <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-semibold mb-6">Hiring Trends (Last 6 Months)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={hiringTrendsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
            <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="applications" stroke="#7DBBFF" strokeWidth={2} dot={{ r: 4 }} name="Applications" />
            <Line type="monotone" dataKey="hires" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} name="Hires" />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-[#6B7280] mt-4 text-center">
          Applications trending up <span className="text-[#111827] font-semibold">+32%</span> vs previous 6 months
        </p>
      </div>
    </div>
  );
}
