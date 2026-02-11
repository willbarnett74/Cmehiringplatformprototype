import { GripVertical, X } from 'lucide-react';
import { Candidate } from '../types/employer';
import { useState } from 'react';

interface CandidatesPageProps {
  candidates: Candidate[];
  onCandidateClick: (candidate: Candidate) => void;
  onMoveToNextStage: (candidateId: number) => void;
  onMoveToStage?: (candidateId: number, newStage: string) => void;
}

function CandidateCard({ 
  candidate, 
  onCandidateClick, 
  stage,
  onDragStart
}: { 
  candidate: Candidate; 
  onCandidateClick: (candidate: Candidate) => void;
  stage: any;
  onDragStart: (candidateId: number) => void;
}) {
  const [isDragging, setIsDragging] = useState(false);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-[#10B981]';
    if (score >= 85) return 'text-[#7DBBFF]';
    return 'text-[#6B7280]';
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        setIsDragging(true);
        onDragStart(candidate.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={() => setIsDragging(false)}
      className={`bg-white p-4 border border-black/[0.08] shadow-sm hover:shadow-md transition-all cursor-move ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
      style={{ borderRadius: '14px' }}
    >
      {/* Drag Handle */}
      <div className="flex items-center justify-between mb-3">
        <GripVertical className="w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
        <span className={`text-base font-semibold ${getScoreColor(candidate.score)}`}>
          {candidate.score}
        </span>
      </div>

      {/* Card Header */}
      <button
        onClick={() => onCandidateClick(candidate)}
        className="w-full text-left mb-3 group"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm text-[#111827] font-semibold mb-1 group-hover:text-[#7DBBFF] transition-colors truncate">
              {candidate.name}
            </h4>
            <p className="text-xs text-[#6B7280] truncate">{candidate.role}</p>
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mb-2">{candidate.location}</p>
      </button>

      {/* Traits */}
      <div className="flex flex-wrap gap-1.5">
        {candidate.traits.slice(0, 2).map((trait) => (
          <span
            key={trait}
            className="px-2 py-1 bg-[#F9F9FA] text-[#6B7280] text-xs"
            style={{ borderRadius: '6px' }}
          >
            {trait}
          </span>
        ))}
      </div>

      {/* Status Badge */}
      {stage.id === 'hired' && (
        <div className="w-full flex items-center justify-center px-3 py-2 bg-[#10B981]/10 text-[#10B981] text-xs font-medium mt-3" style={{ borderRadius: '8px' }}>
          ✓ Hired
        </div>
      )}
      {stage.id === 'declined' && (
        <div className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-[#EF4444]/10 text-[#EF4444] text-xs font-medium mt-3" style={{ borderRadius: '8px' }}>
          <X className="w-3 h-3" strokeWidth={2} />
          Declined
        </div>
      )}
    </div>
  );
}

function DropZone({ 
  stage, 
  candidates, 
  onCandidateClick,
  onDragStart,
  onDragOver,
  onDrop,
  isOver
}: { 
  stage: any; 
  candidates: Candidate[]; 
  onCandidateClick: (candidate: Candidate) => void;
  onDragStart: (candidateId: number) => void;
  onDragOver: (e: React.DragEvent, stageId: string) => void;
  onDrop: (e: React.DragEvent, stageId: string) => void;
  isOver: boolean;
}) {
  return (
    <div 
      onDragOver={(e) => onDragOver(e, stage.id)}
      onDrop={(e) => onDrop(e, stage.id)}
      className={`space-y-3 flex-1 min-h-[200px] p-3 transition-all ${
        isOver ? 'bg-[#7DBBFF]/5 border-2 border-dashed border-[#7DBBFF]' : ''
      }`}
      style={{ borderRadius: '14px' }}
    >
      {candidates.map((candidate) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          onCandidateClick={onCandidateClick}
          stage={stage}
          onDragStart={onDragStart}
        />
      ))}

      {candidates.length === 0 && (
        <div className="bg-[#F9F9FA] p-6 border border-dashed border-black/[0.08] text-center" style={{ borderRadius: '14px' }}>
          <p className="text-xs text-[#9CA3AF]">
            {isOver ? 'Drop here' : 'No candidates'}
          </p>
        </div>
      )}
    </div>
  );
}

export function CandidatesPage({ candidates, onCandidateClick, onMoveToNextStage, onMoveToStage }: CandidatesPageProps) {
  const [draggedCandidateId, setDraggedCandidateId] = useState<number | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const stages = [
    { id: 'newSignals', title: 'New Signals', color: 'bg-[#7DBBFF]/10' },
    { id: 'assessmentSent', title: 'Assessment Sent', color: 'bg-[#F59E0B]/10' },
    { id: 'finalRound', title: 'Final Round', color: 'bg-[#8B5CF6]/10' },
    { id: 'hired', title: 'Hired', color: 'bg-[#10B981]/10' },
    { id: 'declined', title: 'Not Hired / Declined', color: 'bg-[#EF4444]/10' },
  ];

  const getCandidatesByStage = (stageId: string) => {
    return candidates.filter((c) => c.stage === stageId);
  };

  const handleDragStart = (candidateId: number) => {
    setDraggedCandidateId(candidateId);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    
    if (draggedCandidateId && onMoveToStage) {
      const candidate = candidates.find((c) => c.id === draggedCandidateId);
      if (candidate && candidate.stage !== targetStage) {
        onMoveToStage(draggedCandidateId, targetStage);
      }
    }
    setDraggedCandidateId(null);
  };

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl text-[#111827] font-semibold mb-1">Candidate Pipeline</h1>
        <p className="text-sm text-[#6B7280]">Drag and drop candidates to move them through stages</p>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-5 gap-5">
        {stages.map((stage) => {
          const stageCandidates = getCandidatesByStage(stage.id);
          return (
            <div key={stage.id} className="flex flex-col">
              {/* Column Header */}
              <div className="bg-white p-4 border border-black/[0.08] shadow-sm mb-4" style={{ borderRadius: '16px' }}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-[#111827] font-semibold">{stage.title}</h3>
                  <span
                    className={`${stage.color} text-[#111827] px-2.5 py-1 text-xs font-medium`}
                    style={{ borderRadius: '6px' }}
                  >
                    {stageCandidates.length}
                  </span>
                </div>
              </div>

              {/* Candidate Cards */}
              <DropZone
                stage={stage}
                candidates={stageCandidates}
                onCandidateClick={onCandidateClick}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                isOver={dragOverStage === stage.id}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
