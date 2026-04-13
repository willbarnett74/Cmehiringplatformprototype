import { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { IntakeSection1 } from './intake/IntakeSection1';
import { IntakeSection2 } from './intake/IntakeSection2';
import { IntakeSection3 } from './intake/IntakeSection3';
import { IntakeSection4 } from './intake/IntakeSection4';
import { IntakeSection5 } from './intake/IntakeSection5';
import { IntakeSection6 } from './intake/IntakeSection6';
import { IntakeSection7 } from './intake/IntakeSection7';
import { IntakeSection8 } from './intake/IntakeSection8';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import {
  upsertIntakeSectionResponses,
  markApplicantIntakeComplete,
} from '../../lib/applicantPersistence';

const SECTION_LABELS = [
  { number: 1, title: 'Background' },
  { number: 2, title: 'How You Work' },
  { number: 3, title: 'How You Think' },
  { number: 4, title: 'Handling Difficulty' },
  { number: 5, title: 'Relating to Others' },
  { number: 6, title: 'What Drives You' },
  { number: 7, title: 'Career Direction' },
  { number: 8, title: 'References & Signoffs' },
];

interface IntakeFlowPageProps {
  /** candidate_profiles.id (UUID) */
  candidateId?: string;
  userId?: string;
  onComplete: () => void;
  onBack?: () => void;
}

export function IntakeFlowPage({ candidateId, userId: _userId, onComplete, onBack }: IntakeFlowPageProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [sectionData, setSectionData] = useState<Record<number, Record<string, unknown>>>({});

  const persistSectionResponses = async (sectionNumber: number, data: Record<string, unknown>) => {
    if (!candidateId || !isSupabaseConfigured || !supabase) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    await upsertIntakeSectionResponses(supabase, candidateId, sectionNumber, data);
  };

  const handleSectionComplete = async (data: Record<string, unknown>) => {
    const sectionNumber = data.section as number;

    setSectionData((prev) => ({ ...prev, [sectionNumber]: data }));
    if (!completedSections.includes(sectionNumber)) {
      setCompletedSections((prev) => [...prev, sectionNumber]);
    }

    await persistSectionResponses(sectionNumber, data);

    if (sectionNumber < SECTION_LABELS.length) {
      setCurrentSection(sectionNumber + 1);
    }
  };

  const handleSection8Complete = async (data: Record<string, unknown>) => {
    setSectionData((prev) => ({ ...prev, 8: data }));
    if (!completedSections.includes(8)) {
      setCompletedSections((prev) => [...prev, 8]);
    }
    await persistSectionResponses(8, data);
    if (candidateId && isSupabaseConfigured && supabase) {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        await markApplicantIntakeComplete(supabase, candidateId);
      }
    }
    onComplete();
  };

  const getSection8ProfileData = () => {
    const s1 = sectionData[1] as { narrative?: string } | undefined;
    const s2 = sectionData[2] as { responses?: { S2Q6?: { work_preferences?: string[] } } } | undefined;
    return {
      narrative: s1?.narrative ?? '',
      workStyle: s2?.responses?.S2Q6?.work_preferences?.join(', ') ?? '',
      thinkingStyle: 50,
      difficultyScore: 50,
      motivationFit: 50,
      careerAlignment: 50,
    };
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return <IntakeSection1 onComplete={handleSectionComplete} initialData={sectionData[1]} />;
      case 2:
        return <IntakeSection2 onComplete={handleSectionComplete} initialData={sectionData[2]} />;
      case 3:
        return <IntakeSection3 onComplete={handleSectionComplete} initialData={sectionData[3]} />;
      case 4:
        return <IntakeSection4 onComplete={handleSectionComplete} initialData={sectionData[4]} />;
      case 5:
        return <IntakeSection5 onComplete={handleSectionComplete} initialData={sectionData[5]} />;
      case 6:
        return <IntakeSection6 onComplete={handleSectionComplete} initialData={sectionData[6]} />;
      case 7:
        return <IntakeSection7 onComplete={handleSectionComplete} initialData={sectionData[7]} />;
      case 8:
        return <IntakeSection8 onComplete={handleSection8Complete} profileData={getSection8ProfileData()} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12">
      <div className="max-w-4xl mx-auto px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl text-[#111827] font-semibold mb-1">Complete Your Profile</h1>
              <p className="text-sm text-[#6B7280]">
                Section {currentSection} of {SECTION_LABELS.length}
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

          <div className="w-full h-2 bg-[#E5E7EB] overflow-hidden" style={{ borderRadius: '4px' }}>
            <div
              className="h-full bg-[#7DBBFF] transition-all duration-300"
              style={{ width: `${(currentSection / SECTION_LABELS.length) * 100}%` }}
            />
          </div>

          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2">
            {SECTION_LABELS.map((section) => {
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

        <div className="bg-[#FAFAFA]">{renderSection()}</div>

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
