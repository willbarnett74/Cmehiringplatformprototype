import { 
  Sparkles, Target, Zap, Brain, Users, MessageSquare, Lightbulb, 
  TrendingUp, Award, Compass, Lock, Upload, Settings, Edit3, 
  ExternalLink, Plus, ChevronRight, CheckCircle2, User, Briefcase,
  MapPin, GraduationCap, FileText, Video, Link as LinkIcon
} from 'lucide-react';
import { useState } from 'react';

export function DesignSystem() {
  const [toggleState, setToggleState] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400">Version 1.0</span>
          </div>
          <h1 className="mb-4">CMe Design System</h1>
          <p className="text-gray-400 max-w-2xl">
            A cohesive, modern design foundation for building trait-driven hiring experiences.
          </p>
        </div>

        {/* 1. Color Tokens */}
        <SystemSection
          title="Color Tokens"
          description="Semantic color palette organized by usage context"
        >
          <div className="space-y-8">
            {/* Primary Colors */}
            <ColorGroup
              title="Primary"
              description="Purple to teal gradient variants for brand identity"
              colors={[
                { name: 'purple-500', value: '#a855f7', class: 'bg-purple-500' },
                { name: 'purple-400', value: '#c084fc', class: 'bg-purple-400' },
                { name: 'purple-500/20', value: 'rgba(168, 85, 247, 0.2)', class: 'bg-purple-500/20' },
                { name: 'purple-500/10', value: 'rgba(168, 85, 247, 0.1)', class: 'bg-purple-500/10' },
                { name: 'purple-500/5', value: 'rgba(168, 85, 247, 0.05)', class: 'bg-purple-500/5' },
              ]}
            />

            <ColorGroup
              title="Secondary"
              description="Blue and teal accents for interactive elements"
              colors={[
                { name: 'blue-500', value: '#3b82f6', class: 'bg-blue-500' },
                { name: 'blue-400', value: '#60a5fa', class: 'bg-blue-400' },
                { name: 'teal-500', value: '#14b8a6', class: 'bg-teal-500' },
                { name: 'teal-400', value: '#2dd4bf', class: 'bg-teal-400' },
                { name: 'blue-500/10', value: 'rgba(59, 130, 246, 0.1)', class: 'bg-blue-500/10' },
              ]}
            />

            <ColorGroup
              title="Surface"
              description="Dark backgrounds and layered surfaces"
              colors={[
                { name: 'surface-dark', value: '#0a0a0f', class: 'bg-[#0a0a0f]' },
                { name: 'surface-elevated', value: '#0f0f16', class: 'bg-[#0f0f16]' },
                { name: 'surface-elevated-2', value: '#0d0d13', class: 'bg-[#0d0d13]' },
                { name: 'white/[0.08]', value: 'rgba(255, 255, 255, 0.08)', class: 'bg-white/[0.08]' },
                { name: 'white/[0.03]', value: 'rgba(255, 255, 255, 0.03)', class: 'bg-white/[0.03]' },
              ]}
            />

            <ColorGroup
              title="Border"
              description="Low-contrast separators and strokes"
              colors={[
                { name: 'border-default', value: 'rgba(255, 255, 255, 0.08)', class: 'border-white/[0.08]' },
                { name: 'border-subtle', value: 'rgba(255, 255, 255, 0.05)', class: 'border-white/[0.05]' },
                { name: 'purple-border', value: 'rgba(168, 85, 247, 0.2)', class: 'border-purple-500/20' },
                { name: 'blue-border', value: 'rgba(59, 130, 246, 0.2)', class: 'border-blue-500/20' },
                { name: 'teal-border', value: 'rgba(20, 184, 166, 0.2)', class: 'border-teal-500/20' },
              ]}
            />

            <ColorGroup
              title="Text"
              description="Hierarchy from high to low emphasis"
              colors={[
                { name: 'text-high', value: '#ffffff', class: 'bg-white' },
                { name: 'text-medium', value: '#d1d5db', class: 'bg-gray-300' },
                { name: 'text-low', value: '#9ca3af', class: 'bg-gray-400' },
                { name: 'text-subtle', value: '#6b7280', class: 'bg-gray-500' },
                { name: 'text-disabled', value: '#4b5563', class: 'bg-gray-600' },
              ]}
            />

            <ColorGroup
              title="States"
              description="Feedback and validation colors"
              colors={[
                { name: 'success', value: '#10b981', class: 'bg-emerald-500' },
                { name: 'warning', value: '#f59e0b', class: 'bg-amber-500' },
                { name: 'error', value: '#ef4444', class: 'bg-red-500' },
                { name: 'info', value: '#3b82f6', class: 'bg-blue-500' },
              ]}
            />
          </div>
        </SystemSection>

        {/* 2. Typography Scale */}
        <SystemSection
          title="Typography Scale"
          description="Type ramp with consistent hierarchy"
        >
          <div className="space-y-6">
            <div className="space-y-1">
              <div className="text-sm text-gray-500 mb-2">Display</div>
              <div className="text-6xl leading-tight">The future of hiring</div>
              <code className="text-xs text-gray-600">text-6xl / leading-tight / font-normal</code>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-500 mb-2">H1</div>
              <h1 className="mb-0">Heading Level 1</h1>
              <code className="text-xs text-gray-600">text-4xl / leading-tight / font-normal</code>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-500 mb-2">H2</div>
              <h2 className="mb-0">Heading Level 2</h2>
              <code className="text-xs text-gray-600">text-3xl / leading-snug / font-normal</code>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-500 mb-2">H3</div>
              <h3 className="mb-0">Heading Level 3</h3>
              <code className="text-xs text-gray-600">text-xl / leading-normal / font-normal</code>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-500 mb-2">Body Large</div>
              <div className="text-lg">Body text large for important content</div>
              <code className="text-xs text-gray-600">text-lg / leading-relaxed / font-normal</code>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-500 mb-2">Body</div>
              <div className="text-base">Standard body text for readable content</div>
              <code className="text-xs text-gray-600">text-base / leading-normal / font-normal</code>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-500 mb-2">Body Small</div>
              <div className="text-sm">Smaller body text for secondary information</div>
              <code className="text-xs text-gray-600">text-sm / leading-normal / font-normal</code>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-gray-500 mb-2">Caption</div>
              <div className="text-xs text-gray-500">Caption text for metadata and labels</div>
              <code className="text-xs text-gray-600">text-xs / leading-normal / font-normal / text-gray-500</code>
            </div>
          </div>
        </SystemSection>

        {/* 3. Spacing System */}
        <SystemSection
          title="Spacing & Layout"
          description="Consistent spacing scale and grid system"
        >
          <div className="space-y-8">
            <div>
              <div className="text-gray-400 mb-4">Spacing Scale</div>
              <div className="grid grid-cols-4 gap-4">
                <SpacingExample value="4px" scale="1" />
                <SpacingExample value="8px" scale="2" />
                <SpacingExample value="12px" scale="3" />
                <SpacingExample value="16px" scale="4" />
                <SpacingExample value="24px" scale="6" />
                <SpacingExample value="32px" scale="8" />
                <SpacingExample value="48px" scale="12" />
                <SpacingExample value="64px" scale="16" />
              </div>
            </div>

            <div>
              <div className="text-gray-400 mb-4">Grid System</div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-6">
                <div className="text-sm text-gray-400 mb-2">12-column grid · Max width 1440px · Gap 24px</div>
                <div className="grid grid-cols-12 gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-12 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center text-xs text-purple-400">
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SystemSection>

        {/* 4. Card Components */}
        <SystemSection
          title="Card Components"
          description="Reusable card variants for different contexts"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Default Card */}
            <div>
              <div className="text-sm text-gray-400 mb-3">Default Surface Card</div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                <h4 className="mb-2">Card Title</h4>
                <p className="text-gray-400">
                  Standard card with subtle background and border. Use for general content containers.
                </p>
              </div>
              <code className="text-xs text-gray-600 mt-2 block">
                bg-white/[0.03] border-white/[0.08] rounded-2xl p-6
              </code>
            </div>

            {/* Elevated Card */}
            <div>
              <div className="text-sm text-gray-400 mb-3">Elevated Card with Glow</div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/10 to-teal-500/10 rounded-[28px] blur-xl opacity-60" />
                <div className="relative bg-gradient-to-br from-[#0f0f16] via-[#0d0d13] to-[#0a0a0f] border border-white/[0.08] rounded-3xl p-6">
                  <h4 className="mb-2">Elevated Card</h4>
                  <p className="text-gray-400">
                    Premium card with gradient glow. Use for hero sections and important content.
                  </p>
                </div>
              </div>
              <code className="text-xs text-gray-600 mt-2 block">
                Outer glow + gradient background + rounded-3xl
              </code>
            </div>

            {/* Insight Card */}
            <div>
              <div className="text-sm text-gray-400 mb-3">Insight Card</div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl blur-md opacity-40" />
                <div className="relative bg-white/[0.03] border border-white/[0.08] rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-teal-400 mt-2 shrink-0" />
                    <div>
                      <p className="text-gray-300 mb-1">Insight or endorsement text</p>
                      <p className="text-gray-500 text-sm">Author or source</p>
                    </div>
                  </div>
                </div>
              </div>
              <code className="text-xs text-gray-600 mt-2 block">
                Soft glow + bullet point + hierarchical text
              </code>
            </div>

            {/* Metric Card */}
            <div>
              <div className="text-sm text-gray-400 mb-3">Metric Card</div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
                  </div>
                </div>
                <div className="mb-1">Metric Label</div>
                <div className="text-gray-400">Value or status</div>
                <p className="text-gray-500 mt-1 text-sm">Supporting text</p>
              </div>
              <code className="text-xs text-gray-600 mt-2 block">
                Icon + label + value + supporting text
              </code>
            </div>
          </div>
        </SystemSection>

        {/* 5. Buttons */}
        <SystemSection
          title="Button Variants"
          description="Primary, secondary, and tertiary button styles with states"
        >
          <div className="space-y-8">
            {/* Primary Button */}
            <div>
              <div className="text-sm text-gray-400 mb-3">Primary Button</div>
              <div className="flex gap-4 items-center flex-wrap">
                <button className="relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-teal-500 rounded-xl" />
                  <div className="relative px-6 py-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                    <span>Primary Action</span>
                  </div>
                </button>
                <button className="relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-teal-500 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-teal-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative px-6 py-3 flex items-center gap-2">
                    <span>Hover State</span>
                  </div>
                </button>
                <button className="relative overflow-hidden opacity-50 cursor-not-allowed">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-teal-500 rounded-xl" />
                  <div className="relative px-6 py-3 flex items-center gap-2">
                    <span>Disabled</span>
                  </div>
                </button>
              </div>
              <code className="text-xs text-gray-600 mt-2 block">
                bg-gradient-to-r from-purple-500 to-teal-500 rounded-xl px-6 py-3
              </code>
            </div>

            {/* Secondary Button */}
            <div>
              <div className="text-sm text-gray-400 mb-3">Secondary Button</div>
              <div className="flex gap-4 items-center flex-wrap">
                <button className="px-6 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl transition-all flex items-center gap-2">
                  <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                  <span>Secondary Action</span>
                </button>
                <button className="px-6 py-3 bg-white/[0.06] border border-white/[0.08] rounded-xl transition-all flex items-center gap-2">
                  <span>Hover State</span>
                </button>
                <button className="px-6 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl opacity-50 cursor-not-allowed flex items-center gap-2">
                  <span>Disabled</span>
                </button>
              </div>
              <code className="text-xs text-gray-600 mt-2 block">
                bg-white/[0.03] border-white/[0.08] rounded-xl px-6 py-3
              </code>
            </div>

            {/* Accent Button */}
            <div>
              <div className="text-sm text-gray-400 mb-3">Accent Button (Purple variant)</div>
              <div className="flex gap-4 items-center flex-wrap">
                <button className="px-6 py-3 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-xl transition-all flex items-center gap-2">
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  <span>Accent Action</span>
                </button>
                <button className="px-6 py-3 bg-purple-500/15 border border-purple-500/20 text-purple-300 rounded-xl transition-all flex items-center gap-2">
                  <span>Hover State</span>
                </button>
              </div>
              <code className="text-xs text-gray-600 mt-2 block">
                bg-purple-500/10 border-purple-500/20 text-purple-300 rounded-xl
              </code>
            </div>

            {/* Tertiary Button */}
            <div>
              <div className="text-sm text-gray-400 mb-3">Tertiary Button (Text only)</div>
              <div className="flex gap-4 items-center flex-wrap">
                <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                  <span>Tertiary Action</span>
                </button>
                <button className="px-4 py-2 text-white transition-colors flex items-center gap-2">
                  <span>Hover State</span>
                </button>
              </div>
              <code className="text-xs text-gray-600 mt-2 block">
                text-gray-400 hover:text-white transition-colors
              </code>
            </div>
          </div>
        </SystemSection>

        {/* 6. UI Elements */}
        <SystemSection
          title="UI Elements"
          description="Reusable interface components"
        >
          <div className="space-y-8">
            {/* Tags & Chips */}
            <div>
              <div className="text-sm text-gray-400 mb-3">Tags & Chips</div>
              <div className="flex gap-2 flex-wrap">
                <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-lg text-purple-300">
                  Selected Tag
                </span>
                <span className="px-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-lg text-gray-300">
                  Default Tag
                </span>
                <span className="px-4 py-2 bg-gradient-to-r from-purple-500/10 to-teal-500/10 border border-white/[0.10] rounded-full text-gray-300">
                  Chip Style
                </span>
              </div>
            </div>

            {/* Progress Circle */}
            <div>
              <div className="text-sm text-gray-400 mb-3">Progress Circle</div>
              <div className="flex gap-6">
                <ProgressCircle value={92} color="purple" />
                <ProgressCircle value={75} color="blue" />
                <ProgressCircle value={88} color="teal" />
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="text-sm text-gray-400 mb-3">Progress Bar</div>
              <div className="space-y-3 max-w-md">
                <div>
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-400">Profile Completion</span>
                    <span className="text-gray-400">89%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[89%] bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-gray-400">Skills Assessment</span>
                    <span className="text-gray-400">45%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <div>
              <div className="text-sm text-gray-400 mb-3">Toggle Switch</div>
              <button
                onClick={() => setToggleState(!toggleState)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  toggleState ? 'bg-purple-500' : 'bg-white/[0.08]'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    toggleState ? 'translate-x-6' : ''
                  }`}
                />
              </button>
            </div>

            {/* Input Field */}
            <div>
              <div className="text-sm text-gray-400 mb-3">Input Field</div>
              <div className="max-w-md space-y-3">
                <input
                  type="text"
                  placeholder="Enter text..."
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:border-purple-500/50 focus:outline-none transition-colors text-white placeholder:text-gray-500"
                />
                <textarea
                  placeholder="Enter longer text..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl focus:border-purple-500/50 focus:outline-none transition-colors text-white placeholder:text-gray-500 resize-none"
                />
              </div>
            </div>

            {/* Section Header with Actions */}
            <div>
              <div className="text-sm text-gray-400 mb-3">Section Header with Actions</div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="mb-2">Section Title</h3>
                  <p className="text-gray-400">Description of the section content</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-3 py-2 text-sm bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] rounded-lg transition-colors">
                    <Edit3 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>Edit</span>
                  </button>
                  <button className="flex items-center gap-2 px-3 py-2 text-sm bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] rounded-lg transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SystemSection>

        {/* 7. Navigation Elements */}
        <SystemSection
          title="Navigation Elements"
          description="Tab bars and navigation patterns"
        >
          <div className="space-y-8">
            {/* Top Tab Navigation */}
            <div>
              <div className="text-sm text-gray-400 mb-3">Top Tab Navigation</div>
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-2">
                <div className="flex gap-1">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.08] text-white border border-white/[0.08]">
                    <User className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm">Active Tab</span>
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]">
                    <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm">Inactive Tab</span>
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]">
                    <Compass className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm">Another Tab</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Simple Tab Navigation */}
            <div>
              <div className="text-sm text-gray-400 mb-3">Simple Tab Navigation (Alternative)</div>
              <div className="flex gap-1">
                <button className="relative px-5 py-2">
                  <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/10" />
                  <span className="relative text-white">Active</span>
                </button>
                <button className="px-5 py-2 text-gray-500 hover:text-gray-300">
                  Inactive
                </button>
                <button className="px-5 py-2 text-gray-500 hover:text-gray-300">
                  Another
                </button>
              </div>
            </div>
          </div>
        </SystemSection>

        {/* 8. Shadows & Glows */}
        <SystemSection
          title="Shadows & Glows"
          description="Elevation and depth tokens"
        >
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="text-sm text-gray-400">Soft Glow (Purple)</div>
              <div className="relative h-32">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-500/5 rounded-2xl blur-xl" />
                <div className="relative h-full bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center">
                  <span className="text-gray-400">Content</span>
                </div>
              </div>
              <code className="text-xs text-gray-600 block">from-purple-500/20 blur-xl</code>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-gray-400">Soft Glow (Teal)</div>
              <div className="relative h-32">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-teal-500/5 rounded-2xl blur-xl" />
                <div className="relative h-full bg-white/[0.03] border border-white/[0.08] rounded-xl flex items-center justify-center">
                  <span className="text-gray-400">Content</span>
                </div>
              </div>
              <code className="text-xs text-gray-600 block">from-teal-500/20 blur-xl</code>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-gray-400">Elevated Shadow</div>
              <div className="relative h-32">
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/10 to-teal-500/10 rounded-[28px] blur-xl opacity-60" />
                <div className="relative h-full bg-gradient-to-br from-[#0f0f16] to-[#0a0a0f] border border-white/[0.08] rounded-3xl shadow-2xl flex items-center justify-center">
                  <span className="text-gray-400">Content</span>
                </div>
              </div>
              <code className="text-xs text-gray-600 block">Multi-layer glow + shadow-2xl</code>
            </div>
          </div>
        </SystemSection>

        {/* 9. Iconography */}
        <SystemSection
          title="Iconography"
          description="Consistent icon library for the platform"
        >
          <div className="space-y-6">
            <div>
              <div className="text-sm text-gray-400 mb-3">Traits & Insights</div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                <IconExample icon={Target} label="Ownership" />
                <IconExample icon={Zap} label="Speed" />
                <IconExample icon={MessageSquare} label="Communication" />
                <IconExample icon={Lightbulb} label="Adaptability" />
                <IconExample icon={Brain} label="Problem-Solving" />
                <IconExample icon={Users} label="Collaboration" />
                <IconExample icon={TrendingUp} label="Growth" />
                <IconExample icon={Sparkles} label="AI Insights" />
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-3">Navigation & Actions</div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                <IconExample icon={User} label="Profile" />
                <IconExample icon={Compass} label="Explore" />
                <IconExample icon={Briefcase} label="Work" />
                <IconExample icon={Award} label="Skills" />
                <IconExample icon={Settings} label="Settings" />
                <IconExample icon={Edit3} label="Edit" />
                <IconExample icon={Plus} label="Add" />
                <IconExample icon={Upload} label="Upload" />
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-400 mb-3">Status & Feedback</div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                <IconExample icon={CheckCircle2} label="Success" />
                <IconExample icon={Lock} label="Locked" />
                <IconExample icon={ChevronRight} label="Next" />
                <IconExample icon={ExternalLink} label="External" />
                <IconExample icon={Video} label="Video" />
                <IconExample icon={LinkIcon} label="Link" />
                <IconExample icon={MapPin} label="Location" />
                <IconExample icon={GraduationCap} label="Education" />
              </div>
            </div>
          </div>
        </SystemSection>
      </div>
    </div>
  );
}

// Helper Components
interface SystemSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function SystemSection({ title, description, children }: SystemSectionProps) {
  return (
    <section className="mb-20">
      <div className="mb-8">
        <h2 className="mb-3">{title}</h2>
        <p className="text-gray-400">{description}</p>
      </div>
      {children}
    </section>
  );
}

interface ColorGroupProps {
  title: string;
  description: string;
  colors: Array<{ name: string; value: string; class: string }>;
}

function ColorGroup({ title, description, colors }: ColorGroupProps) {
  return (
    <div>
      <div className="mb-3">
        <h4 className="mb-1">{title}</h4>
        <p className="text-gray-500 text-sm">{description}</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {colors.map((color) => (
          <div key={color.name} className="space-y-2">
            <div className={`h-16 ${color.class} rounded-lg border border-white/[0.08]`} />
            <div>
              <div className="text-sm text-gray-300">{color.name}</div>
              <div className="text-xs text-gray-600">{color.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SpacingExampleProps {
  value: string;
  scale: string;
}

function SpacingExample({ value, scale }: SpacingExampleProps) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4">
      <div className={`bg-purple-500/20 border border-purple-500/30 rounded`} style={{ width: value, height: value }} />
      <div className="mt-2 text-sm text-gray-400">{value}</div>
      <div className="text-xs text-gray-600">scale-{scale}</div>
    </div>
  );
}

interface ProgressCircleProps {
  value: number;
  color: 'purple' | 'blue' | 'teal';
}

function ProgressCircle({ value, color }: ProgressCircleProps) {
  const colors = {
    purple: 'text-purple-400',
    blue: 'text-blue-400',
    teal: 'text-teal-400',
  };

  const circumference = 2 * Math.PI * 28;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-20 h-20">
      <svg className="transform -rotate-90 w-20 h-20">
        <circle
          cx="40"
          cy="40"
          r="28"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          className="text-white/5"
        />
        <circle
          cx="40"
          cy="40"
          r="28"
          stroke="currentColor"
          strokeWidth="3"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={colors[color]}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={colors[color]}>{value}</span>
      </div>
    </div>
  );
}

interface IconExampleProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
}

function IconExample({ icon: Icon, label }: IconExampleProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
      </div>
      <span className="text-xs text-gray-500 text-center">{label}</span>
    </div>
  );
}
