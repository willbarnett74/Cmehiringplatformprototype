import { MapPin, Briefcase, Zap, ChevronDown, X, UserPlus, FileText, Star, Sparkles } from 'lucide-react';
import type { Candidate } from '../types/employer';
import { useState } from 'react';

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

const allTraits = [
  'Ownership',
  'Learning Speed',
  'Adaptability',
  'Communication',
  'Collaboration',
  'Innovation',
  'Problem Solving',
  'Creativity',
  'Detail-oriented',
  'Leadership',
  'Strategic Thinking',
];

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
}: SearchPageProps) {
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
    
    // Behavioral Traits filter
    if (selectedTraits.length > 0) {
      const hasMatchingTrait = selectedTraits.some((trait) => candidate.traits.includes(trait));
      if (!hasMatchingTrait) return false;
    }
    
    return true;
  });

  // Sort by score (highest first)
  const sortedCandidates = [...filteredCandidates].sort((a, b) => b.score - a.score);

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
    if (selectedTraits.length === 1) parts.push(`with ${selectedTraits[0]} trait`);
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
    selectedTraits.forEach((trait) => chips.push({ label: trait, type: 'trait', value: trait }));
    selectedReadinessTags.forEach((tag) => chips.push({ label: tag, type: 'readiness', value: tag }));
    return chips;
  };

  const activeChips = getActiveFilterChips();

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl text-[#111827] font-semibold mb-2">Search Candidates</h1>
        <p className="text-sm text-[#6B7280]">
          Use filters and behavioral signals to find candidates who best match your role requirements.
        </p>
      </div>

      {/* Filter Bar - Sticky */}
      <div className="sticky top-[73px] z-20 bg-[#fafafa] pb-4">
        <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          {/* Role Filters Section */}
          <div className="mb-5 p-5 bg-[#F9FBFF]" style={{ borderRadius: '8px' }}>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#E8EDF2]">
              <Briefcase className="w-4 h-4 text-[#7DBBFF]" strokeWidth={1.5} />
              <span className="text-xs text-[#111827] font-semibold uppercase tracking-wider">Role Filters</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Hiring For Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm border transition-all ${
                    selectedRole
                      ? 'bg-white border-[#7DBBFF] text-[#111827]'
                      : 'bg-white border-[#D1D9E6] text-[#6B7280] hover:border-[#7DBBFF]/50 hover:bg-[#7DBBFF]/5'
                  }`}
                  style={{ borderRadius: '10px' }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Briefcase className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                    <span className={`truncate ${selectedRole ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>
                      {selectedRole || 'Select role…'}
                    </span>
                    {selectedRole && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7DBBFF] shrink-0" />
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                </button>
                {showRoleDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-[#D1D9E6] shadow-lg z-30" style={{ borderRadius: '12px' }}>
                    <div className="p-2 space-y-1">
                      {roles.map((role) => (
                        <button
                          key={role}
                          onClick={() => {
                            setSelectedRole(role === 'All Roles' ? null : role);
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            selectedRole === role
                              ? 'bg-[#7DBBFF]/10 text-[#111827]'
                              : 'text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827]'
                          }`}
                          style={{ borderRadius: '8px' }}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    onLocationDropdownToggle();
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm border transition-all ${
                    selectedLocation
                      ? 'bg-white border-[#7DBBFF] text-[#111827]'
                      : 'bg-white border-[#D1D9E6] text-[#6B7280] hover:border-[#7DBBFF]/50 hover:bg-[#7DBBFF]/5'
                  }`}
                  style={{ borderRadius: '10px' }}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MapPin className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                    <span className={`truncate ${selectedLocation ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>
                      {selectedLocation || 'Choose location…'}
                    </span>
                    {selectedLocation && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#7DBBFF] shrink-0" />
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                </button>
                {showLocationDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-[#D1D9E6] shadow-lg z-30" style={{ borderRadius: '12px' }}>
                    <div className="p-2 space-y-1">
                      {locations.map((location) => (
                        <button
                          key={location}
                          onClick={() => {
                            onLocationChange(location === selectedLocation ? null : location);
                            onLocationDropdownToggle();
                          }}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            selectedLocation === location
                              ? 'bg-[#7DBBFF]/10 text-[#111827]'
                              : 'text-[#6B7280] hover:bg-[#F9F9FA] hover:text-[#111827]'
                          }`}
                          style={{ borderRadius: '8px' }}
                        >
                          {location}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Career Stage & Growth Section */}
          <div className="mb-5 p-5 bg-[#F9FBFF]" style={{ borderRadius: '8px' }}>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E8EDF2]">
              <Sparkles className="w-4 h-4 text-[#7DBBFF]" strokeWidth={1.5} />
              <span className="text-xs text-[#111827] font-semibold uppercase tracking-wider">Career Stage & Growth</span>
            </div>

            {/* Career Stage Chips */}
            <div className="mb-5">
              <label className="text-xs text-[#6B7280] font-medium mb-3 block">Career Stage</label>
              <div className="flex flex-wrap gap-2">
                {careerStages.map((stage) => {
                  const isSelected = selectedCareerStage === stage.label;
                  return (
                    <button
                      key={stage.label}
                      onClick={() => setSelectedCareerStage(isSelected ? null : stage.label)}
                      className={`px-3 py-2.5 text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#7DBBFF] text-white border-[#7DBBFF] shadow-sm'
                          : 'bg-white text-[#7C8CA5] border-[#D1D9E6] hover:border-[#7DBBFF]/50 hover:text-[#111827]'
                      }`}
                      style={{ borderRadius: '8px' }}
                    >
                      <div className="flex flex-col items-start">
                        <span>{stage.label}</span>
                        {stage.subtitle && (
                          <span className={`text-xs mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#9CA3AF]'}`}>
                            {stage.subtitle}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Readiness Tags */}
            <div>
              <label className="text-xs text-[#6B7280] font-medium mb-3 block">Optional Readiness Tags</label>
              <div className="flex flex-wrap gap-2">
                {readinessTags.map((tag) => {
                  const isSelected = selectedReadinessTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleReadinessTag(tag)}
                      className={`px-3 py-2 text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/30'
                          : 'bg-white text-[#7C8CA5] border-[#D1D9E6] hover:border-[#8B5CF6]/30 hover:text-[#111827]'
                      }`}
                      style={{ borderRadius: '8px' }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
              {selectedReadinessTags.length > 0 && (
                <p className="text-xs text-[#6B7280] mt-3">
                  <span className="font-semibold text-[#8B5CF6]">{selectedReadinessTags.length}</span> readiness tag{selectedReadinessTags.length !== 1 ? 's' : ''} selected
                </p>
              )}
            </div>
          </div>

          {/* Behavioral Signals Section */}
          <div className="mb-4 p-5 bg-[#F9FBFF]" style={{ borderRadius: '8px' }}>
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#E8EDF2]">
              <Zap className="w-4 h-4 text-[#7DBBFF]" strokeWidth={1.5} />
              <span className="text-xs text-[#111827] font-semibold uppercase tracking-wider">Behavioral Signals</span>
              {selectedTraits.length > 0 && (
                <div className="w-2 h-2 rounded-full bg-[#7DBBFF] animate-pulse ml-1" />
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Trait Chips */}
              {allTraits.map((trait) => {
                const isSelected = selectedTraits.includes(trait);
                return (
                  <button
                    key={trait}
                    onClick={() => onTraitToggle(trait)}
                    className={`px-3 py-2 text-xs font-medium border transition-all transform hover:scale-105 active:scale-95 ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#14B8A6] text-white border-transparent shadow-sm'
                        : 'bg-white text-[#7C8CA5] border-[#D1D9E6] hover:border-[#7DBBFF]/50 hover:text-[#111827]'
                    }`}
                    style={{ borderRadius: '8px' }}
                  >
                    {trait}
                  </button>
                );
              })}
            </div>
            {selectedTraits.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#E8EDF2]">
                <p className="text-xs text-[#6B7280]">
                  <span className="font-semibold text-[#7DBBFF]">{selectedTraits.length}</span> behavioral signal
                  {selectedTraits.length !== 1 ? 's' : ''} active
                </p>
              </div>
            )}
          </div>

          {/* Active Filter Chips */}
          {activeChips.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-black/[0.08]">
              <span className="text-xs text-[#6B7280]">Active:</span>
              {activeChips.map((chip, index) => (
                <button
                  key={`${chip.type}-${index}`}
                  onClick={() => removeFilter(chip.type, chip.value)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#7DBBFF]/10 text-[#7DBBFF] hover:bg-[#7DBBFF]/20 transition-colors text-xs font-medium"
                  style={{ borderRadius: '8px' }}
                >
                  <span>{chip.label}</span>
                  <X className="w-3 h-3" strokeWidth={2} />
                </button>
              ))}
              <button
                onClick={handleResetFilters}
                className="ml-auto text-sm text-[#6B7280] hover:text-[#111827] transition-colors font-medium"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#F9F9FA] px-5 py-3 border border-black/[0.08] mb-6 mt-6" style={{ borderRadius: '12px' }}>
        <p className="text-sm text-[#111827]">
          <span className="font-semibold">Results:</span> {getSummary()}
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
                <p className="text-xs text-[#6B7280] truncate">{candidate.role}</p>
                <p className="text-xs text-[#9CA3AF] mt-1">{candidate.location}</p>
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