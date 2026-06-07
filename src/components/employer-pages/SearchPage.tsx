import { MapPin, Briefcase, Zap, ChevronDown, X, UserPlus, FileText, Star } from 'lucide-react';
import type { Candidate } from '../types/employer';
import { useState, useEffect, useMemo } from 'react';
import {
  MOTIVATIONAL_FIT_SUB_KEYS,
  MOTIVATIONAL_FIT_SUB_LABELS,
  TRAIT_DIMENSION_KEYS,
  TRAIT_LABELS,
} from '../../lib/traits';
import { toCandidateDimensionScores } from '../../utils/intakeScoreAggregate';

interface SearchPageProps {
  candidates: Candidate[];
  selectedLocation: string | null;
  selectedLevel: string | null;
  selectedTraits: string[];
  showLocationDropdown: boolean;
  showLevelDropdown: boolean;
  showTraitsDropdown: boolean;
  onLocationChange: (location: string | null) => void;
  onLevelChange: (level: string | null) => void;
  onTraitToggle: (trait: string) => void;
  onClearFilters: () => void;
  onLocationDropdownToggle: () => void;
  onLevelDropdownToggle: () => void;
  onTraitsDropdownToggle: () => void;
  onCandidateClick: (candidate: Candidate) => void;
  /** Reports filtered result count for the employer top bar (handoff: "N results"). */
  onFilteredCountChange?: (count: number) => void;
}

const locations = ['San Francisco, CA', 'New York, NY', 'Austin, TX', 'Remote'];
const roles = ['Product Designer', 'UX Designer', 'UI Designer', 'Design Lead', 'All Roles'];

const careerStages = [
  { label: 'Early Career', subtitle: '0–2 yrs' },
  { label: 'Developing', subtitle: '2–5 yrs' },
  { label: 'Established', subtitle: '5–10 yrs' },
  { label: 'Experienced', subtitle: '10+ yrs' },
  { label: 'Career Transition / Returner', subtitle: '' },
];

const readinessTags = [
  'Open to career change',
  'Ready to step up',
  'Recently retrained / reskilled',
];

/** Profile-builder dimensions (core + motivational subs) — keys match `Candidate.dimensionScores`. */
const PROFILE_TRAIT_FILTERS: { key: string; label: string }[] = [
  ...TRAIT_DIMENSION_KEYS.map((key) => ({ key, label: TRAIT_LABELS[key] })),
  ...MOTIVATIONAL_FIT_SUB_KEYS.map((key) => ({ key, label: MOTIVATIONAL_FIT_SUB_LABELS[key] })),
];

function candidateMatchesProfileTraitFilter(candidate: Candidate, traitKey: string): boolean {
  const ds =
    candidate.dimensionScores ??
    (candidate.trait_scores ? toCandidateDimensionScores(candidate.trait_scores) : undefined);
  if (ds) {
    const v = ds[traitKey as keyof typeof ds];
    if (typeof v === 'number' && !Number.isNaN(v)) return true;
  }
  const label =
    PROFILE_TRAIT_FILTERS.find((t) => t.key === traitKey)?.label;
  return !!(label && candidate.traits.includes(label));
}

export function SearchPage({
  candidates,
  selectedLocation,
  selectedLevel: _selectedLevel,
  selectedTraits,
  showLocationDropdown,
  showLevelDropdown: _showLevelDropdown,
  showTraitsDropdown: _showTraitsDropdown,
  onLocationChange,
  onLevelChange: _onLevelChange,
  onTraitToggle,
  onClearFilters,
  onLocationDropdownToggle,
  onLevelDropdownToggle: _onLevelDropdownToggle,
  onTraitsDropdownToggle: _onTraitsDropdownToggle,
  onCandidateClick,
  onFilteredCountChange,
}: SearchPageProps) {
  const profileTraitLabelByKey = useMemo(
    () => Object.fromEntries(PROFILE_TRAIT_FILTERS.map(({ key, label }) => [key, label])) as Record<
      string,
      string
    >,
    [],
  );

  // Filter states
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [selectedCareerStage, setSelectedCareerStage] = useState<string | null>(null);
  const [selectedReadinessTags, setSelectedReadinessTags] = useState<string[]>([]);

  // Filter candidates based on selections
  const filteredCandidates = candidates.filter((candidate) => {
    // Location filter
    if (selectedLocation && candidate.location !== selectedLocation) return false;
    
    // Role filter
    if (selectedRole && selectedRole !== 'All Roles' && !candidate.role.includes(selectedRole.replace(' Designer', ''))) return false;
    
    // Career Stage filter (single select with AND logic)
    if (selectedCareerStage) {
      const exp = candidate.totalExperience ?? 0;
      
      if (selectedCareerStage === 'Early Career' && exp > 2) return false;
      if (selectedCareerStage === 'Developing' && (exp <= 2 || exp > 5)) return false;
      if (selectedCareerStage === 'Established' && (exp <= 5 || exp > 10)) return false;
      if (selectedCareerStage === 'Experienced' && exp <= 10) return false;
      if (selectedCareerStage === 'Career Transition / Returner' && !candidate.transitioning) return false;
    }
    
    // Readiness Tags filter (multi-select with OR logic)
    if (selectedReadinessTags.length > 0) {
      const matchesReadiness = selectedReadinessTags.some((tag) => {
        if (tag === 'Open to career change' && candidate.openToChange) return true;
        if (tag === 'Ready to step up' && candidate.readyToStepUp) return true;
        if (tag === 'Recently retrained / reskilled' && candidate.retrained) return true;
        return false;
      });
      
      if (!matchesReadiness) return false;
    }
    
    // Profile-builder trait dimensions (scores on candidate or legacy label chips)
    if (selectedTraits.length > 0) {
      const hasMatchingTrait = selectedTraits.some((traitKey) =>
        candidateMatchesProfileTraitFilter(candidate, traitKey),
      );
      if (!hasMatchingTrait) return false;
    }
    
    return true;
  });

  // Sort by score (highest first)
  const sortedCandidates = [...filteredCandidates].sort((a, b) => b.score - a.score);

  useEffect(() => {
    onFilteredCountChange?.(sortedCandidates.length);
  }, [sortedCandidates.length, onFilteredCountChange]);

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'bg-[#10B981]/10 text-[#10B981]';
    if (score >= 85) return 'bg-[#7DBBFF]/10 text-[#7DBBFF]';
    return 'bg-[#6B7280]/10 text-[#6B7280]';
  };

  // Get summary text
  const getSummary = (): string => {
    const parts: string[] = [];
    
    if (sortedCandidates.length === 0) {
      return 'No candidates match your current criteria';
    }

    parts.push(`${sortedCandidates.length} candidate${sortedCandidates.length !== 1 ? 's' : ''}`);
    
    if (selectedRole) parts.push(`for ${selectedRole}`);
    if (selectedLocation) parts.push(`in ${selectedLocation}`);
    if (selectedCareerStage) parts.push(`at ${selectedCareerStage} stage`);
    if (selectedTraits.length === 1) {
      const one = profileTraitLabelByKey[selectedTraits[0]] ?? selectedTraits[0];
      parts.push(`with ${one} trait`);
    }
    if (selectedTraits.length > 1) parts.push(`with ${selectedTraits.length} selected traits`);
    if (selectedReadinessTags.length > 0) parts.push(`${selectedReadinessTags.length} readiness tag${selectedReadinessTags.length !== 1 ? 's' : ''}`);
    
    return parts.join(' • ');
  };

  const handleResetFilters = () => {
    onClearFilters();
    setSelectedRole(null);
    setSelectedCareerStage(null);
    setSelectedReadinessTags([]);
  };

  const toggleReadinessTag = (tag: string) => {
    setSelectedReadinessTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const removeFilter = (filterType: string, value?: string) => {
    if (filterType === 'location') onLocationChange(null);
    if (filterType === 'careerStage') setSelectedCareerStage(null);
    if (filterType === 'role') setSelectedRole(null);
    if (filterType === 'trait' && value) onTraitToggle(value);
    if (filterType === 'readiness' && value) {
      setSelectedReadinessTags(prev => prev.filter(t => t !== value));
    }
  };

  // Get active filter chips
  const getActiveFilterChips = () => {
    const chips: { label: string; type: string; value?: string }[] = [];
    if (selectedLocation) chips.push({ label: selectedLocation, type: 'location' });
    if (selectedCareerStage) chips.push({ label: selectedCareerStage, type: 'careerStage' });
    if (selectedRole && selectedRole !== 'All Roles') chips.push({ label: selectedRole, type: 'role' });
    selectedTraits.forEach((traitKey) =>
      chips.push({
        label: profileTraitLabelByKey[traitKey] ?? traitKey,
        type: 'trait',
        value: traitKey,
      }),
    );
    selectedReadinessTags.forEach((tag) => chips.push({ label: tag, type: 'readiness', value: tag }));
    return chips;
  };

  const activeChips = getActiveFilterChips();

  const filterBtnBase =
    'flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-xs transition-colors';
  const filterBtnIdle = 'border-black/[0.11] bg-white text-[#6B7280] hover:border-[#7DBBFF]/50';
  const filterBtnActive = 'border-[#7DBBFF] bg-white text-[#111827]';

  return (
    <div>
      <p className="mb-3 text-[12.5px] leading-snug text-[#9CA3AF]">
        Refine by role, location, career stage, and behavioral signals.
      </p>

      <div className="sticky top-0 z-20 -mx-0 mb-4 border-b border-black/[0.06] bg-[#fafafa] pb-3 pt-0.5">
        <div className="rounded-md border border-black/[0.08] bg-white p-3 shadow-sm">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="relative">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">Role</p>
              <button
                type="button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className={`${filterBtnBase} ${selectedRole ? filterBtnActive : filterBtnIdle}`}
              >
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 shrink-0 text-[#7DBBFF]" strokeWidth={1.75} />
                  <span className={`truncate ${selectedRole ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>
                    {selectedRole || 'Any role'}
                  </span>
                </span>
                <ChevronDown className="h-3 w-3 shrink-0 opacity-60" strokeWidth={2} />
              </button>
              {showRoleDropdown && (
                <div
                  className="absolute left-0 right-0 top-full z-30 mt-1 max-h-52 overflow-y-auto rounded-md border border-black/[0.1] bg-white shadow-lg"
                >
                  <div className="p-1">
                    {roles.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          setSelectedRole(role === 'All Roles' ? null : role);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full rounded px-2.5 py-1.5 text-left text-xs transition-colors ${
                          selectedRole === role
                            ? 'bg-[#7DBBFF]/10 font-medium text-[#111827]'
                            : 'text-[#6B7280] hover:bg-[#F9F9FA]'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">Location</p>
              <button
                type="button"
                onClick={() => {
                  onLocationDropdownToggle();
                  setShowRoleDropdown(false);
                }}
                className={`${filterBtnBase} ${selectedLocation ? filterBtnActive : filterBtnIdle}`}
              >
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-[#7DBBFF]" strokeWidth={1.75} />
                  <span className={`truncate ${selectedLocation ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>
                    {selectedLocation || 'Any location'}
                  </span>
                </span>
                <ChevronDown className="h-3 w-3 shrink-0 opacity-60" strokeWidth={2} />
              </button>
              {showLocationDropdown && (
                <div
                  className="absolute left-0 right-0 top-full z-30 mt-1 max-h-52 overflow-y-auto rounded-md border border-black/[0.1] bg-white shadow-lg"
                >
                  <div className="p-1">
                    {locations.map((location) => (
                      <button
                        key={location}
                        type="button"
                        onClick={() => {
                          onLocationChange(location === selectedLocation ? null : location);
                          onLocationDropdownToggle();
                        }}
                        className={`w-full rounded px-2.5 py-1.5 text-left text-xs transition-colors ${
                          selectedLocation === location
                            ? 'bg-[#7DBBFF]/10 font-medium text-[#111827]'
                            : 'text-[#6B7280] hover:bg-[#F9F9FA]'
                        }`}
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 border-t border-black/[0.06] pt-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              Career stage
            </p>
            <div className="flex flex-wrap gap-1.5">
              {careerStages.map((stage) => {
                const isSelected = selectedCareerStage === stage.label;
                const hint = stage.subtitle ? `${stage.label} (${stage.subtitle})` : stage.label;
                return (
                  <button
                    key={stage.label}
                    type="button"
                    title={hint}
                    onClick={() => setSelectedCareerStage(isSelected ? null : stage.label)}
                    className={`rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                      isSelected
                        ? 'border-[#7DBBFF] bg-[#7DBBFF] text-white'
                        : 'border-black/[0.1] bg-[#fafafa] text-[#374151] hover:border-[#7DBBFF]/40'
                    }`}
                  >
                    {stage.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 border-t border-black/[0.06] pt-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              Readiness
            </p>
            <div className="flex flex-wrap gap-1.5">
              {readinessTags.map((tag) => {
                const isSelected = selectedReadinessTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleReadinessTag(tag)}
                    className={`rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                      isSelected
                        ? 'border-[#8B5CF6]/40 bg-[#8B5CF6]/10 text-[#7C3AED]'
                        : 'border-black/[0.1] bg-white text-[#6B7280] hover:border-[#8B5CF6]/25'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 border-t border-black/[0.06] pt-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
              <Zap className="h-3 w-3 text-[#7DBBFF]" strokeWidth={2} />
              Traits
            </p>
            <div className="flex max-h-[4.5rem] flex-wrap gap-1.5 overflow-y-auto pr-0.5">
              {PROFILE_TRAIT_FILTERS.map(({ key, label }) => {
                const isSelected = selectedTraits.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onTraitToggle(key)}
                    className={`rounded-md border px-2 py-1 text-[11px] font-medium transition-colors ${
                      isSelected
                        ? 'border-transparent bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white'
                        : 'border-black/[0.1] bg-white text-[#6B7280] hover:border-[#7DBBFF]/40'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-black/[0.08] pt-3">
              <span className="text-[10px] font-medium text-[#9CA3AF]">Active</span>
              {activeChips.map((chip, index) => (
                <button
                  key={`${chip.type}-${index}`}
                  type="button"
                  onClick={() => removeFilter(chip.type, chip.value)}
                  className="flex items-center gap-1 rounded-md bg-[#7DBBFF]/12 px-2 py-0.5 text-[11px] font-medium text-[#2563EB] hover:bg-[#7DBBFF]/20"
                >
                  <span className="max-w-[140px] truncate">{chip.label}</span>
                  <X className="h-3 w-3 shrink-0" strokeWidth={2} />
                </button>
              ))}
              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto text-[11px] font-medium text-[#6B7280] hover:text-[#111827]"
              >
                Reset all
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 rounded-md border border-black/[0.08] bg-[#fafafa] px-3 py-2">
        <p className="text-[12.5px] text-[#374151]">
          <span className="font-semibold text-[#111827]">Results:</span> {getSummary()}
        </p>
      </div>

      {/* Candidates Grid */}
      <div className="grid grid-cols-3 gap-5">
        {sortedCandidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white p-5 border border-black/[0.08] shadow-sm hover:shadow-md transition-all"
            style={{ borderRadius: '16px' }}
          >
            {/* Card Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm text-[#111827] font-semibold mb-1 truncate">{candidate.name}</h4>
                <p className="text-xs text-[#6B7280] truncate">
                  {candidate.role}
                  {candidate.currentCompany ? ` · ${candidate.currentCompany}` : ''}
                </p>
                <p className="text-xs text-[#9CA3AF] mt-1">{candidate.location}</p>
                {(candidate.availability || candidate.noticePeriod) && (
                  <p className="text-xs text-[#9CA3AF] mt-1">
                    {candidate.availability && `Available: ${candidate.availability}`}
                    {candidate.availability && candidate.noticePeriod && ' · '}
                    {candidate.noticePeriod && `Notice: ${candidate.noticePeriod}`}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0 ml-2">
                <span className={`px-2.5 py-1 text-xs font-medium ${getScoreColor(candidate.score)}`} style={{ borderRadius: '6px' }}>
                  {candidate.score}
                </span>
              </div>
            </div>

            {/* Traits */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {candidate.traits.slice(0, 3).map((trait) => (
                <span key={trait} className="px-2.5 py-1 bg-[#F9F9FA] text-[#6B7280] text-xs" style={{ borderRadius: '6px' }}>
                  {trait}
                </span>
              ))}
            </div>

            {/* Career Readiness Badges */}
            <div className="mb-4 pb-3 border-b border-black/[0.05]">
              <div className="flex flex-wrap gap-1.5 items-center">
                {/* Career Stage Badge */}
                {(() => {
                  const exp = candidate.totalExperience ?? 0;
                  let stageLabel = '';
                  
                  if (candidate.transitioning) {
                    stageLabel = 'Transitioner';
                  } else if (exp <= 2) {
                    stageLabel = 'Early Career';
                  } else if (exp <= 5) {
                    stageLabel = 'Developing';
                  } else if (exp <= 10) {
                    stageLabel = 'Established';
                  } else {
                    stageLabel = 'Experienced';
                  }
                  
                  const isStageFiltered = selectedCareerStage && (
                    (selectedCareerStage === 'Early Career' && exp <= 2) ||
                    (selectedCareerStage === 'Developing' && exp > 2 && exp <= 5) ||
                    (selectedCareerStage === 'Established' && exp > 5 && exp <= 10) ||
                    (selectedCareerStage === 'Experienced' && exp > 10) ||
                    (selectedCareerStage === 'Career Transition / Returner' && candidate.transitioning)
                  );
                  
                  return (
                    <span 
                      className={`px-2 py-1 text-xs font-medium transition-all ${
                        isStageFiltered 
                          ? 'bg-[#7DBBFF] text-white border border-[#6366F1] shadow-[0_0_0_2px_rgba(99,102,241,0.15)]' 
                          : 'bg-[#E8F2FF] text-[#7DBBFF] border border-[#7DBBFF]/20'
                      }`}
                      style={{ borderRadius: '6px' }}
                      title={`Career stage: ${stageLabel} (${exp} years)`}
                    >
                      {stageLabel}
                    </span>
                  );
                })()}

                {/* Readiness Tags */}
                {(() => {
                  const readinessBadges = [];
                  
                  if (candidate.openToChange) {
                    const isFiltered = selectedReadinessTags.includes('Open to career change');
                    readinessBadges.push(
                      <span 
                        key="change"
                        className={`px-2 py-1 text-xs font-medium transition-all ${
                          isFiltered 
                            ? 'bg-[#8B5CF6] text-white border border-[#6366F1] shadow-[0_0_0_2px_rgba(99,102,241,0.15)]' 
                            : 'bg-[#F3E8FF] text-[#8B5CF6] border border-[#8B5CF6]/20'
                        }`}
                        style={{ borderRadius: '6px' }}
                        title="Open to career change"
                      >
                        Open to Change
                      </span>
                    );
                  }
                  
                  if (candidate.readyToStepUp) {
                    const isFiltered = selectedReadinessTags.includes('Ready to step up');
                    readinessBadges.push(
                      <span 
                        key="stepup"
                        className={`px-2 py-1 text-xs font-medium transition-all ${
                          isFiltered 
                            ? 'bg-[#10B981] text-white border border-[#6366F1] shadow-[0_0_0_2px_rgba(99,102,241,0.15)]' 
                            : 'bg-[#D1FAE5] text-[#10B981] border border-[#10B981]/20'
                        }`}
                        style={{ borderRadius: '6px' }}
                        title="Ready to step up to next level"
                      >
                        Ready to Step Up
                      </span>
                    );
                  }
                  
                  if (candidate.retrained) {
                    const isFiltered = selectedReadinessTags.includes('Recently retrained / reskilled');
                    readinessBadges.push(
                      <span 
                        key="retrained"
                        className={`px-2 py-1 text-xs font-medium transition-all ${
                          isFiltered 
                            ? 'bg-[#F59E0B] text-white border border-[#6366F1] shadow-[0_0_0_2px_rgba(99,102,241,0.15)]' 
                            : 'bg-[#FEF3C7] text-[#F59E0B] border border-[#F59E0B]/20'
                        }`}
                        style={{ borderRadius: '6px' }}
                        title="Recently retrained or reskilled"
                      >
                        Retrained
                      </span>
                    );
                  }
                  
                  // Limit to 3 badges total (already have 1 career stage, so max 2 more)
                  const visibleBadges = readinessBadges.slice(0, 2);
                  const extraCount = readinessBadges.length - 2;
                  
                  return (
                    <>
                      {visibleBadges}
                      {extraCount > 0 && (
                        <span 
                          className="px-2 py-1 bg-[#F3F4F6] text-[#6B7280] text-xs font-medium"
                          style={{ borderRadius: '6px' }}
                          title={`${extraCount} more readiness tag${extraCount > 1 ? 's' : ''}`}
                        >
                          +{extraCount}
                        </span>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => onCandidateClick(candidate)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#7DBBFF] text-white hover:bg-[#6aabef] transition-colors text-xs font-medium"
                style={{ borderRadius: '10px' }}
              >
                <FileText className="w-3.5 h-3.5" strokeWidth={2} />
                View Profile
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="flex items-center justify-center gap-1.5 px-3 py-2 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] transition-colors text-xs font-medium"
                  style={{ borderRadius: '8px' }}
                >
                  <Star className="w-3.5 h-3.5" strokeWidth={2} />
                  Shortlist
                </button>
                <button
                  className="flex items-center justify-center gap-1.5 px-3 py-2 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] transition-colors text-xs font-medium"
                  style={{ borderRadius: '8px' }}
                >
                  <UserPlus className="w-3.5 h-3.5" strokeWidth={2} />
                  Invite
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedCandidates.length === 0 && (
        <div className="bg-white p-12 border border-black/[0.08] shadow-sm text-center" style={{ borderRadius: '20px' }}>
          <p className="text-base text-[#6B7280] mb-2">No candidates match your filters</p>
          <p className="text-sm text-[#9CA3AF] mb-4">Try adjusting your search criteria</p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-[#7DBBFF] text-white hover:bg-[#6aabef] transition-colors text-sm font-medium"
            style={{ borderRadius: '10px' }}
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}