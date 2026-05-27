import { X, MapPin, Briefcase, Mail, Phone, Linkedin, ArrowRight, FileText, Copy, Building2, Star } from 'lucide-react';
import type { Candidate } from '../types/employer';
import { useState } from 'react';
import { candidateTagline, formatLinkedInHref } from '../../lib/candidateProfileDisplay';

interface CandidateModalProps {
  candidate: Candidate;
  onClose: () => void;
  onMoveToNextStage: (candidateId: number) => void;
  onAddNote: (candidateId: number) => void;
  onViewFullProfile: () => void;
  onContact?: () => void;
}

export function CandidateModal({ candidate, onClose, onMoveToNextStage, onAddNote: _onAddNote, onViewFullProfile, onContact: _onContact }: CandidateModalProps) {
  const [isShortlisted, setIsShortlisted] = useState(false);

  const getFitLevel = (score: number): { label: string; color: string } => {
    if (score >= 90) return { label: 'Strong Fit', color: 'text-[#34D399]' };
    if (score >= 85) return { label: 'Moderate Fit', color: 'text-[#3B82F6]' };
    return { label: 'Limited Fit', color: 'text-[#9CA3AF]' };
  };

  const getTraitIntensity = (trait: string): number => {
    // Simulate different intensity levels for visual variety
    const intensityMap: Record<string, number> = {
      'Ownership': 3,
      'Learning Speed': 3,
      'Adaptability': 2,
      'Communication': 3,
      'Collaboration': 2,
      'Innovation': 2,
      'Problem Solving': 3,
      'Creativity': 2,
      'Detail-oriented': 2,
      'Leadership': 3,
      'Strategic Thinking': 2,
    };
    return intensityMap[trait] || 2;
  };

  const fitLevel = getFitLevel(candidate.score);
  const tagline = candidateTagline(candidate);
  const linkedInHref = formatLinkedInHref(candidate.linkedinUrl);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8" onClick={onClose}>
      <div
        className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ borderRadius: '24px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-black/[0.08] p-6" style={{ borderRadius: '24px 24px 0 0' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-full bg-[#7DBBFF] flex items-center justify-center text-white text-lg font-semibold overflow-hidden">
                {candidate.avatarUrl ? (
                  <img src={candidate.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  candidate.name.split(' ').map((n) => n[0]).join('')
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl text-[#111827] font-semibold mb-1">{candidate.name}</h2>
                <p className="text-sm text-[#6B7280] mb-1">{candidate.role}</p>
                {candidate.currentCompany ? (
                  <p className="text-xs text-[#9CA3AF] mb-2">{candidate.currentCompany}</p>
                ) : null}
                {tagline ? (
                  <p className="text-xs text-[#7DBBFF] italic">{tagline}</p>
                ) : null}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center hover:bg-[#F9F9FA] transition-colors shrink-0"
              style={{ borderRadius: '10px' }}
            >
              <X className="w-5 h-5 text-[#6B7280]" strokeWidth={2} />
            </button>
          </div>

          {/* Fit Level and Info Tags */}
          <div className="flex items-center gap-3 flex-wrap mt-4">
            <span className={`${fitLevel.color} font-semibold text-sm`}>
              {fitLevel.label}
            </span>
            <div className="w-px h-4 bg-black/[0.12]" />
            <div className="flex items-center gap-2 text-[#6B7280] text-sm">
              <Briefcase className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{candidate.level}</span>
            </div>
            <div className="w-px h-4 bg-black/[0.12]" />
            <div className="flex items-center gap-2 text-[#6B7280] text-sm">
              <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{candidate.location}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Contact Info */}
          <div className="bg-[#F9F9FA] p-5 mb-6" style={{ borderRadius: '16px' }}>
            <h3 className="text-sm text-[#111827] font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3.5">
              {candidate.email ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
                    <span className="text-sm text-[#111827]">{candidate.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void navigator.clipboard.writeText(candidate.email ?? '')}
                    className="p-1.5 hover:bg-white transition-colors"
                    style={{ borderRadius: '6px' }}
                  >
                    <Copy className="w-3.5 h-3.5 text-[#9CA3AF]" strokeWidth={1.5} />
                  </button>
                </div>
              ) : null}
              {candidate.phone ? (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
                  <span className="text-sm text-[#111827]">{candidate.phone}</span>
                </div>
              ) : null}
              {linkedInHref ? (
                <div className="flex items-center gap-3">
                  <Linkedin className="w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
                  <a href={linkedInHref} target="_blank" rel="noopener noreferrer" className="text-sm text-[#7DBBFF] hover:text-[#6aabef]">
                    LinkedIn profile
                  </a>
                </div>
              ) : null}
              {!candidate.email && !candidate.phone && !linkedInHref ? (
                <p className="text-sm text-[#9CA3AF] italic">Contact details not shared yet.</p>
              ) : null}
            </div>
          </div>

          {/* Signature Traits */}
          <div className="mb-6">
            <h3 className="text-sm text-[#111827] font-semibold mb-3">Signature Traits</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.traits.map((trait) => {
                const intensity = getTraitIntensity(trait);
                return (
                  <div
                    key={trait}
                    className="group relative px-4 py-2.5 bg-[#7DBBFF]/10 text-[#7DBBFF] text-sm font-medium hover:bg-[#7DBBFF]/20 transition-all cursor-pointer"
                    style={{ borderRadius: '10px' }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{trait}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3].map((dot) => (
                          <div
                            key={dot}
                            className={`w-1 h-1 rounded-full ${
                              dot <= intensity ? 'bg-[#7DBBFF]' : 'bg-[#7DBBFF]/30'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[#111827] text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ borderRadius: '8px' }}>
                      {intensity === 3 ? 'High strength indicator' : 'Moderate strength indicator'}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-[#111827] transform rotate-45" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Experience Highlights */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm text-[#111827] font-semibold">Experience Highlights</h3>
            </div>
            <div className="space-y-3">
              <div className="p-4 border border-black/[0.08] hover:border-[#7DBBFF]/30 transition-colors" style={{ borderRadius: '12px' }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-[#7DBBFF]/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#111827] font-semibold mb-1">Senior Designer</p>
                      <p className="text-xs text-[#6B7280] mb-1">TechCorp</p>
                      <p className="text-xs text-[#9CA3AF]">2022 - Present</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#F9F9FA] text-[#6B7280] text-xs font-medium shrink-0" style={{ borderRadius: '6px' }}>
                    2 yrs
                  </span>
                </div>
                <p className="text-sm text-[#6B7280] pl-13">
                  Led design system overhaul for 50+ product teams. Increased design consistency by 85%.
                </p>
              </div>
              <div className="p-4 border border-black/[0.08] hover:border-[#7DBBFF]/30 transition-colors" style={{ borderRadius: '12px' }}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-[#8B5CF6]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#111827] font-semibold mb-1">Product Designer</p>
                      <p className="text-xs text-[#6B7280] mb-1">StartupXYZ</p>
                      <p className="text-xs text-[#9CA3AF]">2020 - 2022</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-[#F9F9FA] text-[#6B7280] text-xs font-medium shrink-0" style={{ borderRadius: '6px' }}>
                    2 yrs
                  </span>
                </div>
                <p className="text-sm text-[#6B7280] pl-13">
                  Designed user onboarding flow that increased activation rate by 40%.
                </p>
              </div>
            </div>
          </div>

          {/* Assessment Results (if applicable) */}
          {candidate.stage !== 'discovered' && (
            <div className="mb-6">
              <h3 className="text-sm text-[#111827] font-semibold mb-3">Assessment Results</h3>
              <div className="bg-[#F9F9FA] p-5" style={{ borderRadius: '16px' }}>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Cognitive Agility</p>
                    <p className="text-lg text-[#111827] font-semibold">92/100</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Design Challenge</p>
                    <p className="text-lg text-[#111827] font-semibold">88/100</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Culture Fit</p>
                    <p className="text-lg text-[#111827] font-semibold">95/100</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-black/[0.08] mt-6">
            <button
              onClick={onViewFullProfile}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#7DBBFF] text-white hover:bg-[#6aabef] hover:shadow-lg active:scale-[0.98] transition-all font-medium"
              style={{ borderRadius: '12px' }}
            >
              <FileText className="w-4 h-4" strokeWidth={2} />
              <span>View Profile</span>
            </button>
            <button
              onClick={() => setIsShortlisted(!isShortlisted)}
              className={`px-5 py-3 border text-[#111827] hover:bg-[#F9F9FA] active:scale-[0.98] transition-all font-medium flex items-center gap-2 ${
                isShortlisted 
                  ? 'border-[#7DBBFF] shadow-[0_0_0_3px_rgba(125,187,255,0.1)]' 
                  : 'border-black/[0.08] hover:border-[#7DBBFF]/30'
              }`}
              style={{ borderRadius: '12px' }}
            >
              <Star className="w-4 h-4" strokeWidth={2} fill={isShortlisted ? '#7DBBFF' : 'none'} />
              <span>Shortlist</span>
            </button>
            <button
              onClick={() => {
                onMoveToNextStage(candidate.id);
                onClose();
              }}
              className="px-5 py-3 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] hover:border-[#7DBBFF]/30 active:scale-[0.98] transition-all font-medium flex items-center gap-2"
              style={{ borderRadius: '12px' }}
            >
              <span>Invite to Assessment</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}