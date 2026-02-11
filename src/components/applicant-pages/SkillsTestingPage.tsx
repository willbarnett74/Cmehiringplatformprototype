import { Target, Plus, TrendingUp, Award, Calendar, CheckCircle2 } from 'lucide-react';
import { DSSectionHeader, DSSurfaceCard } from '../ds/DSComponents';
import { CognitiveAgilityAssessment } from '../CognitiveAgilityAssessment';
import { useUserProfile } from '../../contexts/UserProfileContext';

interface SkillsTestingPageProps {
  cognitiveScore?: number | null;
  onCognitiveScoreChange?: (score: number) => void;
}

interface AssessmentHistoryItem {
  id: string;
  name: string;
  date: string;
  score: number;
  percentile: number;
  category: string;
}

const mockAssessmentHistory: AssessmentHistoryItem[] = [
  {
    id: '1',
    name: 'Cognitive Agility Assessment',
    date: 'Jan 24, 2026',
    score: 87,
    percentile: 92,
    category: 'Cognitive'
  },
  {
    id: '2',
    name: 'Problem Solving & Logic',
    date: 'Jan 18, 2026',
    score: 82,
    percentile: 85,
    category: 'Analytical'
  },
  {
    id: '3',
    name: 'Verbal Reasoning',
    date: 'Jan 15, 2026',
    score: 90,
    percentile: 94,
    category: 'Communication'
  },
  {
    id: '4',
    name: 'Cognitive Agility Assessment',
    date: 'Jan 10, 2026',
    score: 84,
    percentile: 88,
    category: 'Cognitive'
  }
];

function AssessmentHistoryCard({ assessment }: { assessment: AssessmentHistoryItem }) {
  return (
    <DSSurfaceCard hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-[#7DBBFF]" strokeWidth={1.5} />
            <h4 className="text-[#111827]">{assessment.name}</h4>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-3">
            <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>{assessment.date}</span>
            <span className="text-[#D1D5DB]">•</span>
            <span>{assessment.category}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="text-2xl font-medium text-[#111827]">{assessment.score}</div>
          <div className="text-xs text-[#6B7280]">Score</div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-black/[0.08] flex items-center justify-between">
        <div className="text-sm text-[#6B7280]">Percentile</div>
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#10B981]" strokeWidth={1.5} />
          <span className="text-sm font-medium text-[#111827]">{assessment.percentile}th</span>
        </div>
      </div>
    </DSSurfaceCard>
  );
}

export function SkillsTestingPage({ cognitiveScore, onCognitiveScoreChange }: SkillsTestingPageProps = {}) {
  const { profileData, updateProfileData } = useUserProfile();
  
  const handleCognitiveScoreUpdate = (score: number) => {
    // Update both local prop and global context
    updateProfileData({ cognitive_score: score });
    if (onCognitiveScoreChange) {
      onCognitiveScoreChange(score);
    }
  };
  
  const totalAssessments = mockAssessmentHistory.length;
  const averageScore = Math.round(mockAssessmentHistory.reduce((acc, item) => acc + item.score, 0) / totalAssessments);
  const averagePercentile = Math.round(mockAssessmentHistory.reduce((acc, item) => acc + item.percentile, 0) / totalAssessments);

  return (
    <div>
      <DSSectionHeader
        title="Skills & Testing"
        description="Validated skills and assessment results"
      />
      
      {/* Cognitive Agility Assessment Section */}
      <CognitiveAgilityAssessment onComplete={handleCognitiveScoreUpdate} />

      {/* Assessment History Section */}
      <div className="mt-12">
        <div className="mb-6">
          <h3 className="text-[#111827] mb-1">Assessment History</h3>
          <p className="text-[#6B7280]">Track your progress and view past assessment results</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <DSSurfaceCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#7DBBFF]/10 border border-[#7DBBFF]/20 flex items-center justify-center" style={{ borderRadius: '10px' }}>
                <Award className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-2xl font-medium text-[#111827]">{totalAssessments}</div>
                <div className="text-sm text-[#6B7280]">Total Assessments</div>
              </div>
            </div>
          </DSSurfaceCard>

          <DSSurfaceCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center" style={{ borderRadius: '10px' }}>
                <TrendingUp className="w-5 h-5 text-[#10B981]" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-2xl font-medium text-[#111827]">{averageScore}</div>
                <div className="text-sm text-[#6B7280]">Average Score</div>
              </div>
            </div>
          </DSSurfaceCard>

          <DSSurfaceCard>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center" style={{ borderRadius: '10px' }}>
                <Target className="w-5 h-5 text-[#8B5CF6]" strokeWidth={1.5} />
              </div>
              <div>
                <div className="text-2xl font-medium text-[#111827]">{averagePercentile}th</div>
                <div className="text-sm text-[#6B7280]">Avg Percentile</div>
              </div>
            </div>
          </DSSurfaceCard>
        </div>

        {/* Recent Assessments */}
        <div className="mb-4">
          <h4 className="text-[#111827] mb-4">Recent Assessments</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockAssessmentHistory.map((assessment) => (
            <AssessmentHistoryCard key={assessment.id} assessment={assessment} />
          ))}
        </div>
      </div>
    </div>
  );
}