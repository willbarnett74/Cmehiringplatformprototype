import { useState, useEffect } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { IntakeSection1 } from './intake/IntakeSection1';
import { IntakeSection2 } from './intake/IntakeSection2';
import { IntakeSection3 } from './intake/IntakeSection3';
import { IntakeSection4 } from './intake/IntakeSection4';
import { IntakeSection5 } from './intake/IntakeSection5';
import { IntakeSection6 } from './intake/IntakeSection6';
import { IntakeSection7 } from './intake/IntakeSection7';
import { IntakeSection8 } from './intake/IntakeSection8';

interface IntakeData {
  section1?: { narrative: string };
  section2?: { workStyle: string };
  section3?: { scores: Record<string, number> };
  section4?: { choices: Record<string, 'A' | 'B'> };
  section5?: { rankings: string[] };
  section6?: { motivation: string };
  section7?: { careerDirection: string };
}

interface IntakeFlowPageProps {
  onComplete: () => void;
  onBack?: () => void;
}

export function IntakeFlowPage({ onComplete, onBack }: IntakeFlowPageProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [intakeData, setIntakeData] = useState<IntakeData>({});
  const [completedSections, setCompletedSections] = useState<number[]>([]);

  const sections = [
    { number: 1, title: 'Background', component: 'section1' },
    { number: 2, title: 'Work Style', component: 'section2' },
    { number: 3, title: 'Thinking', component: 'section3' },
    { number: 4, title: 'Trade-offs', component: 'section4' },
    { number: 5, title: 'Motivations', component: 'section5' },
    { number: 6, title: 'Values', component: 'section6' },
    { number: 7, title: 'Career Goals', component: 'section7' },
    { number: 8, title: 'Review', component: 'section8' }
  ];

  const handleSectionComplete = (sectionNumber: number, data: any) => {
    const sectionKey = `section${sectionNumber}` as keyof IntakeData;
    setIntakeData(prev => ({ ...prev, [sectionKey]: data }));
    
    if (!completedSections.includes(sectionNumber)) {
      setCompletedSections(prev => [...prev, sectionNumber]);
    }

    // Move to next section
    if (sectionNumber < sections.length) {
      setCurrentSection(sectionNumber + 1);
    }
  };

  const handleFinalSubmit = () => {
    // Mock: Calculate scores based on responses
    const mockScores = {
      thinkingStyle: calculateThinkingScore(),
      difficultyScore: calculateDifficultyScore(),
      motivationFit: calculateMotivationScore(),
      careerAlignment: calculateCareerScore()
    };

    console.log('Intake Complete:', { ...intakeData, scores: mockScores });
    onComplete();
  };

  // Mock scoring functions (would be Edge Functions in real implementation)
  const calculateThinkingScore = (): number => {
    if (!intakeData.section3?.scores) return 50;
    const scores = Object.values(intakeData.section3.scores);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return Math.round((avg / 5) * 100);
  };

  const calculateDifficultyScore = (): number => {
    if (!intakeData.section4?.choices) return 50;
    const choices = Object.values(intakeData.section4.choices);
    // Mock: Count A choices vs B choices
    const aCount = choices.filter(c => c === 'A').length;
    return Math.round((aCount / choices.length) * 100);
  };

  const calculateMotivationScore = (): number => {
    if (!intakeData.section5?.rankings) return 50;
    // Mock: Use ranking positions
    const rankings = intakeData.section5.rankings;
    return Math.round((rankings.length / 5) * 100);
  };

  const calculateCareerScore = (): number => {
    // Mock: Based on text length and keywords
    const text = intakeData.section7?.careerDirection || '';
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
    return Math.min(Math.round((wordCount / 150) * 100), 100);
  };

  const getProfileSummary = () => {
    return {
      narrative: intakeData.section1?.narrative || '',
      workStyle: intakeData.section2?.workStyle || '',
      thinkingStyle: calculateThinkingScore(),
      difficultyScore: calculateDifficultyScore(),
      motivationFit: calculateMotivationScore(),
      careerAlignment: calculateCareerScore()
    };
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return (
          <IntakeSection1
            onComplete={(data) => handleSectionComplete(1, data)}
            initialData={intakeData.section1}
          />
        );
      case 2:
        return (
          <IntakeSection2
            onComplete={(data) => handleSectionComplete(2, data)}
            initialData={intakeData.section2}
          />
        );
      case 3:
        return (
          <IntakeSection3
            onComplete={(data) => handleSectionComplete(3, data)}
            initialData={intakeData.section3}
          />
        );
      case 4:
        return (
          <IntakeSection4
            onComplete={(data) => handleSectionComplete(4, data)}
            initialData={intakeData.section4}
          />
        );
      case 5:
        return (
          <IntakeSection5
            onComplete={(data) => handleSectionComplete(5, data)}
            initialData={intakeData.section5}
          />
        );
      case 6:
        return (
          <IntakeSection6
            onComplete={(data) => handleSectionComplete(6, data)}
            initialData={intakeData.section6}
          />
        );
      case 7:
        return (
          <IntakeSection7
            onComplete={(data) => handleSectionComplete(7, data)}
            initialData={intakeData.section7}
          />
        );
      case 8:
        return (
          <IntakeSection8
            onComplete={handleFinalSubmit}
            profileData={getProfileSummary()}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="max-w-4xl mx-auto px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl text-[#111827] font-semibold mb-1">Complete Your Profile</h1>
              <p className="text-sm text-[#6B7280]">
                Section {currentSection} of {sections.length}
              </p>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                Exit
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-[#E5E7EB] overflow-hidden" style={{ borderRadius: '4px' }}>
            <div
              className="h-full bg-[#7DBBFF] transition-all duration-300"
              style={{ width: `${(currentSection / sections.length) * 100}%` }}
            />
          </div>

          {/* Section Navigation */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
            {sections.map((section) => {
              const isCompleted = completedSections.includes(section.number);
              const isCurrent = currentSection === section.number;
              const isAccessible = section.number <= currentSection;

              return (
                <button
                  key={section.number}
                  onClick={() => isAccessible && setCurrentSection(section.number)}
                  disabled={!isAccessible}
                  className={`flex items-center gap-2 px-3 py-2 text-xs whitespace-nowrap border transition-all ${
                    isCurrent
                      ? 'bg-[#7DBBFF] border-[#7DBBFF] text-white'
                      : isCompleted
                      ? 'bg-white border-[#10B981] text-[#10B981]'
                      : isAccessible
                      ? 'bg-white border-black/[0.08] text-[#6B7280] hover:border-[#7DBBFF]'
                      : 'bg-[#F3F4F6] border-black/[0.05] text-[#9CA3AF] cursor-not-allowed'
                  }`}
                  style={{ borderRadius: '8px' }}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" strokeWidth={2} />
                  ) : (
                    <Circle className="w-4 h-4" strokeWidth={2} />
                  )}
                  <span>{section.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Content */}
        <div className="bg-[#FAFAFA]">
          {renderSection()}
        </div>

        {/* Back Navigation */}
        {currentSection > 1 && currentSection < 8 && (
          <div className="mt-6 flex justify-start">
            <button
              onClick={() => setCurrentSection(currentSection - 1)}
              className="px-4 py-2 text-sm text-[#6B7280] hover:text-[#111827] transition-colors"
            >
              ← Back to Previous Section
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
