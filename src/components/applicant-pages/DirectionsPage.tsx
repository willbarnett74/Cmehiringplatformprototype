import { useState } from 'react';
import { Zap, Users, BarChart, Layout, Lightbulb, Sparkles, X } from 'lucide-react';
import { DSSectionHeader, DSSurfaceCard, DSTagButton } from '../ds/DSComponents';

export function DirectionsPage() {
  // State for Problems I Enjoy Solving
  const [selectedProblems, setSelectedProblems] = useState<string[]>(['Creative', 'People-focused']);
  
  // State for Work Style Preferences
  const [selectedWorkStyles, setSelectedWorkStyles] = useState<string[]>(['Creative', 'Collaborative']);
  
  // State for Industries or Themes
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(['Tech', 'Design', 'Sustainability']);
  const [newIndustry, setNewIndustry] = useState<string>('');
  const [isAddingIndustry, setIsAddingIndustry] = useState<boolean>(false);
  
  // State for Growth Direction
  const [growthDirection, setGrowthDirection] = useState<string>("I'd like to move from individual contributor work into a role where I can lead projects and mentor others. I'm drawn to roles that combine creative problem-solving with strategic thinking.");
  
  // State for Where I Don't Thrive
  const [nonThrivingEnvironments, setNonThrivingEnvironments] = useState<string>('Highly rigid environments with little room for creative input or process improvement.');

  // State for What Success Looks Like to Me
  const [successDefinition, setSuccessDefinition] = useState<string>('');
  const [selectedSuccessChips, setSelectedSuccessChips] = useState<string[]>([]);

  // State for Roles or Environments I'm Curious About
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>(['Startups', 'Remote-first']);
  const [newEnvironment, setNewEnvironment] = useState<string>('');
  const [isAddingEnvironment, setIsAddingEnvironment] = useState<boolean>(false);

  const problemTypes = [
    'People-focused',
    'Creative',
    'Analytical',
    'Operational',
    'Technical',
    'Customer-facing',
  ];

  const workStyleOptions = [
    { id: 'fast-paced', label: 'Fast-paced', icon: Zap },
    { id: 'structured', label: 'Structured', icon: Layout },
    { id: 'creative', label: 'Creative', icon: Lightbulb },
    { id: 'analytical', label: 'Analytical', icon: BarChart },
    { id: 'collaborative', label: 'Collaborative', icon: Users },
  ];

  const industryOptions = [
    'Tech',
    'Sustainability',
    'Design',
    'Finance',
    'Sport',
    'Education',
    'Healthcare',
    'Media',
    'Non-profit',
  ];

  const successInspirationChips = [
    'Growth',
    'Impact',
    'Freedom',
    'Balance',
    'Mastery',
    'Stability',
  ];

  const environmentOptions = [
    'Startups',
    'Large Corporates',
    'Agencies',
    'Remote-first',
    'Hybrid Teams',
    'Social Enterprises',
    'NGOs',
  ];

  const toggleProblem = (problem: string) => {
    if (selectedProblems.includes(problem)) {
      setSelectedProblems(selectedProblems.filter(p => p !== problem));
    } else {
      if (selectedProblems.length < 3) {
        setSelectedProblems([...selectedProblems, problem]);
      }
    }
  };

  const toggleWorkStyle = (style: string) => {
    if (selectedWorkStyles.includes(style)) {
      setSelectedWorkStyles(selectedWorkStyles.filter(s => s !== style));
    } else {
      setSelectedWorkStyles([...selectedWorkStyles, style]);
    }
  };

  const toggleIndustry = (industry: string) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
    } else {
      if (selectedIndustries.length < 5) {
        setSelectedIndustries([...selectedIndustries, industry]);
      }
    }
  };

  const addCustomIndustry = () => {
    if (newIndustry.trim() && selectedIndustries.length < 5) {
      setSelectedIndustries([...selectedIndustries, newIndustry.trim()]);
      setNewIndustry('');
      setIsAddingIndustry(false);
    }
  };

  const removeIndustry = (industry: string) => {
    setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
  };

  const addCustomEnvironment = () => {
    if (newEnvironment.trim() && selectedEnvironments.length < 5) {
      setSelectedEnvironments([...selectedEnvironments, newEnvironment.trim()]);
      setNewEnvironment('');
      setIsAddingEnvironment(false);
    }
  };

  const removeEnvironment = (environment: string) => {
    setSelectedEnvironments(selectedEnvironments.filter(e => e !== environment));
  };

  const toggleSuccessChip = (chip: string) => {
    if (selectedSuccessChips.includes(chip)) {
      setSelectedSuccessChips(selectedSuccessChips.filter(c => c !== chip));
    } else {
      setSelectedSuccessChips([...selectedSuccessChips, chip]);
    }
  };

  const toggleEnvironment = (environment: string) => {
    if (selectedEnvironments.includes(environment)) {
      setSelectedEnvironments(selectedEnvironments.filter(e => e !== environment));
    } else {
      setSelectedEnvironments([...selectedEnvironments, environment]);
    }
  };

  return (
    <div>
      <DSSectionHeader
        title="Career Direction"
        description="Understanding your strengths and preferences"
      />
      
      <DSSurfaceCard className="p-8">
        <div className="space-y-8">
          {/* Problems I Enjoy Solving */}
          <div>
            <div className="mb-2">
              <div className="text-[#111827]">Problems I Enjoy Solving</div>
            </div>
            <div className="text-sm text-[#6B7280] mb-4">
              Select up to 3 problem types you most enjoy working on.
            </div>
            <div className="flex flex-wrap gap-2">
              {problemTypes.map((problem) => (
                <DSTagButton
                  key={problem}
                  selected={selectedProblems.includes(problem)}
                  color={selectedProblems.includes(problem) ? 'blue' : 'default'}
                  onClick={() => toggleProblem(problem)}
                >
                  {problem}
                </DSTagButton>
              ))}
            </div>
            <div className="text-sm text-[#9CA3AF] mt-2">
              {selectedProblems.length}/3 selected
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-black/[0.08]" />

          {/* Work Style Preferences */}
          <div>
            <div className="mb-2">
              <div className="text-[#111827]">Work Style Preferences</div>
            </div>
            <div className="text-sm text-[#6B7280] mb-4">
              Select all work styles that resonate with you.
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {workStyleOptions.map((style) => {
                const Icon = style.icon;
                const isSelected = selectedWorkStyles.includes(style.label);
                return (
                  <button
                    key={style.id}
                    onClick={() => toggleWorkStyle(style.label)}
                    className={`flex flex-col items-center justify-center p-4 border transition-all ${
                      isSelected
                        ? 'border-[#7DBBFF] bg-[#7DBBFF]/5 shadow-sm'
                        : 'border-black/[0.08] bg-white hover:border-[#7DBBFF]/30 hover:bg-[#7DBBFF]/5'
                    }`}
                    style={{ borderRadius: '12px' }}
                  >
                    <Icon
                      className={`w-6 h-6 mb-2 ${
                        isSelected ? 'text-[#7DBBFF]' : 'text-[#6B7280]'
                      }`}
                      strokeWidth={1.5}
                    />
                    <span
                      className={`text-sm ${
                        isSelected ? 'text-[#111827]' : 'text-[#6B7280]'
                      }`}
                    >
                      {style.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-black/[0.08]" />

          {/* Industries or Themes I'm Drawn To */}
          <div>
            <div className="mb-2">
              <div className="text-[#111827]">Industries or Themes I'm Drawn To</div>
            </div>
            <div className="text-sm text-[#6B7280] mb-4">
              Choose up to 5 industries or themes that interest you.
            </div>
            
            {/* Selected Industries */}
            {selectedIndustries.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedIndustries.map((industry) => (
                  <div
                    key={industry}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#7DBBFF]/10 border border-[#7DBBFF]/30 text-[#111827]"
                    style={{ borderRadius: '8px' }}
                  >
                    <span className="text-sm">{industry}</span>
                    <button
                      onClick={() => removeIndustry(industry)}
                      className="text-[#6B7280] hover:text-[#EF4444] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Industry Options */}
            <div className="flex flex-wrap gap-2 mb-3">
              {industryOptions
                .filter((ind) => !selectedIndustries.includes(ind))
                .map((industry) => (
                  <DSTagButton
                    key={industry}
                    selected={false}
                    color="default"
                    onClick={() => toggleIndustry(industry)}
                    disabled={selectedIndustries.length >= 5}
                  >
                    {industry}
                  </DSTagButton>
                ))}
            </div>

            {/* Add Custom Industry */}
            {isAddingIndustry ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addCustomIndustry();
                    } else if (e.key === 'Escape') {
                      setIsAddingIndustry(false);
                      setNewIndustry('');
                    }
                  }}
                  placeholder="Type a custom industry..."
                  className="flex-1 px-3 py-2 bg-white border border-[#7DBBFF] text-[#111827] placeholder-[#9CA3AF] transition-all focus:outline-none focus:border-[#7DBBFF] focus:shadow-[0_0_0_3px_rgba(125,187,255,0.12)]"
                  style={{ borderRadius: '8px' }}
                  autoFocus
                />
                <button
                  onClick={addCustomIndustry}
                  className="px-4 py-2 bg-[#7DBBFF] hover:bg-[#6aabef] text-white transition-colors"
                  style={{ borderRadius: '8px' }}
                  disabled={!newIndustry.trim() || selectedIndustries.length >= 5}
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingIndustry(false);
                    setNewIndustry('');
                  }}
                  className="px-4 py-2 bg-white border border-black/[0.08] text-[#6B7280] hover:bg-[#F9F9FA] transition-colors"
                  style={{ borderRadius: '8px' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingIndustry(true)}
                className="text-sm text-[#7DBBFF] hover:text-[#6aabef] transition-colors"
                disabled={selectedIndustries.length >= 5}
              >
                + Add custom industry
              </button>
            )}

            <div className="text-sm text-[#9CA3AF] mt-2">
              {selectedIndustries.length}/5 selected
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-black/[0.08]" />

          {/* Growth Direction */}
          <div>
            <div className="mb-2">
              <div className="text-[#111827]">Growth Direction</div>
            </div>
            <div className="text-sm text-[#6B7280] mb-4">
              Describe how you'd like your career to evolve over the next few years.
            </div>
            <textarea
              value={growthDirection}
              onChange={(e) => setGrowthDirection(e.target.value)}
              placeholder="Describe how you'd like your career to evolve over the next few years."
              className="w-full px-4 py-3 bg-white border border-black/[0.08] text-[#111827] placeholder-[#9CA3AF] transition-all focus:outline-none focus:border-[#7DBBFF] focus:shadow-[0_0_0_3px_rgba(125,187,255,0.12)] resize-none"
              style={{ borderRadius: '12px', minHeight: '120px' }}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-black/[0.08]" />

          {/* Where I Don't Thrive (Optional) */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[#111827]">Where I Don't Thrive</div>
              <span className="text-sm text-[#9CA3AF]">Optional</span>
            </div>
            <div className="text-sm text-[#6B7280] mb-4">
              Describe situations or environments that make it harder for you to do your best work.
            </div>
            <textarea
              value={nonThrivingEnvironments}
              onChange={(e) => setNonThrivingEnvironments(e.target.value)}
              placeholder="Describe situations or environments that make it harder for you to do your best work."
              className="w-full px-4 py-3 bg-white border border-black/[0.08] text-[#111827] placeholder-[#9CA3AF] transition-all focus:outline-none focus:border-[#7DBBFF] focus:shadow-[0_0_0_3px_rgba(125,187,255,0.12)] resize-none"
              style={{ borderRadius: '12px', minHeight: '100px' }}
            />
          </div>

          {/* Divider */}
          <div className="border-t border-black/[0.08]" />

          {/* What Success Looks Like to Me */}
          <div>
            <div className="mb-2">
              <div className="text-[#111827]">What Success Looks Like to Me</div>
            </div>
            <div className="text-sm text-[#6B7280] mb-1">
              Describe what success or fulfillment in your career looks like for you.
            </div>
            <div className="text-xs text-[#9CA3AF] mb-4 italic">
              Your answer helps us understand what matters most to you — there's no right or wrong.
            </div>
            <textarea
              value={successDefinition}
              onChange={(e) => setSuccessDefinition(e.target.value)}
              placeholder="Describe what success or fulfillment in your career looks like for you."
              className="w-full px-4 py-3 bg-white border border-black/[0.08] text-[#111827] placeholder-[#9CA3AF] transition-all focus:outline-none focus:border-[#7DBBFF] focus:shadow-[0_0_0_3px_rgba(125,187,255,0.12)] resize-none"
              style={{ borderRadius: '12px', minHeight: '100px' }}
            />
            <div className="mt-3">
              <div className="text-xs text-[#6B7280] mb-2">Optional inspiration:</div>
              <div className="flex flex-wrap gap-2">
                {successInspirationChips.map((chip) => (
                  <DSTagButton
                    key={chip}
                    selected={selectedSuccessChips.includes(chip)}
                    color={selectedSuccessChips.includes(chip) ? 'blue' : 'default'}
                    onClick={() => toggleSuccessChip(chip)}
                  >
                    {chip}
                  </DSTagButton>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-black/[0.08]" />

          {/* Roles or Environments I'm Curious About */}
          <div>
            <div className="mb-2">
              <div className="text-[#111827]">Roles or Environments I'm Curious About</div>
            </div>
            <div className="text-sm text-[#6B7280] mb-4">
              Choose or add environments that interest you, even if you haven't worked in them before.
            </div>
            
            {/* Selected Environments */}
            {selectedEnvironments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedEnvironments.map((environment) => (
                  <div
                    key={environment}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#7DBBFF]/10 border border-[#7DBBFF]/30 text-[#111827]"
                    style={{ borderRadius: '8px' }}
                  >
                    <span className="text-sm">{environment}</span>
                    <button
                      onClick={() => removeEnvironment(environment)}
                      className="text-[#6B7280] hover:text-[#EF4444] transition-colors"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Environment Options */}
            <div className="flex flex-wrap gap-2 mb-3">
              {environmentOptions
                .filter((env) => !selectedEnvironments.includes(env))
                .map((environment) => (
                  <DSTagButton
                    key={environment}
                    selected={false}
                    color="default"
                    onClick={() => toggleEnvironment(environment)}
                  >
                    {environment}
                  </DSTagButton>
                ))}
            </div>

            {/* Add Custom Environment */}
            {isAddingEnvironment ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEnvironment}
                  onChange={(e) => setNewEnvironment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addCustomEnvironment();
                    } else if (e.key === 'Escape') {
                      setIsAddingEnvironment(false);
                      setNewEnvironment('');
                    }
                  }}
                  placeholder="Type a custom environment..."
                  className="flex-1 px-3 py-2 bg-white border border-[#7DBBFF] text-[#111827] placeholder-[#9CA3AF] transition-all focus:outline-none focus:border-[#7DBBFF] focus:shadow-[0_0_0_3px_rgba(125,187,255,0.12)]"
                  style={{ borderRadius: '8px' }}
                  autoFocus
                />
                <button
                  onClick={addCustomEnvironment}
                  className="px-4 py-2 bg-[#7DBBFF] hover:bg-[#6aabef] text-white transition-colors"
                  style={{ borderRadius: '8px' }}
                  disabled={!newEnvironment.trim()}
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setIsAddingEnvironment(false);
                    setNewEnvironment('');
                  }}
                  className="px-4 py-2 bg-white border border-black/[0.08] text-[#6B7280] hover:bg-[#F9F9FA] transition-colors"
                  style={{ borderRadius: '8px' }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingEnvironment(true)}
                className="text-sm text-[#7DBBFF] hover:text-[#6aabef] transition-colors"
              >
                + Add custom environment
              </button>
            )}
          </div>
        </div>
      </DSSurfaceCard>
    </div>
  );
}