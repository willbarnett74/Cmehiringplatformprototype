// Design System Components - Reusable UI components (Light Theme)
import type { LucideIcon } from 'lucide-react';
import { Edit3, ExternalLink } from 'lucide-react';

// Badge/Pill component
interface DSBadgeProps {
  children: React.ReactNode;
  withPulse?: boolean;
}

export function DSBadge({ children, withPulse = false }: DSBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#F9F9FA] border border-black/[0.08] text-[#111827] text-sm" style={{ borderRadius: '10px' }}>
      {withPulse && <div className="w-1.5 h-1.5 rounded-full bg-[#7dbbff] animate-pulse" />}
      <span>{children}</span>
    </div>
  );
}

// Tab Navigation component
interface DSTabNavigationProps {
  tabs: Array<{
    id: string;
    label: string;
    icon: LucideIcon;
  }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function DSTabNavigation({ tabs, activeTab, onTabChange }: DSTabNavigationProps) {
  return (
    <div className="bg-white border border-black/[0.08] p-1.5 shadow-sm" style={{ borderRadius: '12px' }}>
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#7dbbff]/10 text-[#7dbbff] font-medium'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9F9FA]'
              }`}
              style={{ borderRadius: '10px' }}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              <span className="text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Section Header with action buttons
interface DSSectionHeaderProps {
  title: string;
  description: string;
  onEdit?: () => void;
  onViewDetails?: () => void;
  primaryAction?: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
  };
}

export function DSSectionHeader({ 
  title, 
  description, 
  onEdit, 
  onViewDetails, 
  primaryAction, 
  secondaryAction 
}: DSSectionHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex-1">
        <h3 className="text-2xl text-[#111827] font-semibold mb-2">{title}</h3>
        <p className="text-sm text-[#6B7280]">{description}</p>
      </div>
      <div className="flex items-center gap-2 ml-4">
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white hover:bg-[#F9F9FA] border border-black/[0.08] hover:border-black/[0.12] text-[#111827] font-medium transition-colors"
            style={{ borderRadius: '10px' }}
          >
            <Edit3 className="w-4 h-4" strokeWidth={2} />
            <span>Edit</span>
          </button>
        )}
        {onViewDetails && (
          <button
            onClick={onViewDetails}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white hover:bg-[#F9F9FA] border border-black/[0.08] hover:border-black/[0.12] text-[#111827] font-medium transition-colors"
            style={{ borderRadius: '10px' }}
          >
            <ExternalLink className="w-4 h-4" strokeWidth={2} />
            <span>View Details</span>
          </button>
        )}
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-white hover:bg-[#F9F9FA] border border-black/[0.08] hover:border-black/[0.12] text-[#111827] font-medium transition-colors"
            style={{ borderRadius: '10px' }}
          >
            <secondaryAction.icon className="w-4 h-4" strokeWidth={2} />
            <span>{secondaryAction.label}</span>
          </button>
        )}
        {primaryAction && (
          <button
            onClick={primaryAction.onClick}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#7dbbff] hover:bg-[#6aabef] text-white font-medium shadow-sm transition-colors"
            style={{ borderRadius: '10px' }}
          >
            <primaryAction.icon className="w-4 h-4" strokeWidth={2} />
            <span>{primaryAction.label}</span>
          </button>
        )}
      </div>
    </div>
  );
}

// Trait Card with progress bar
interface DSTraitCardProps {
  trait: {
    name: string;
    score: number;
    color: 'purple' | 'blue' | 'teal';
    icon: LucideIcon;
    context: string;
  };
}

export function DSTraitCard({ trait }: DSTraitCardProps) {
  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; progressBg: string }> = {
      purple: {
        bg: 'bg-[#E6F1FD]',
        text: 'text-[#7dbbff]',
        progressBg: 'bg-[#7dbbff]',
      },
      blue: {
        bg: 'bg-[#E6F1FD]',
        text: 'text-[#7dbbff]',
        progressBg: 'bg-[#7dbbff]',
      },
      teal: {
        bg: 'bg-[#E6F1FD]',
        text: 'text-[#50d5ff]',
        progressBg: 'bg-[#50d5ff]',
      },
    };
    return colors[color];
  };

  const colors = getColorClasses(trait.color);
  const Icon = trait.icon;

  // Convert score to signal level
  const getSignalLevel = (score: number): string => {
    if (score >= 90) return 'Very Strong';
    if (score >= 80) return 'Strong';
    if (score >= 70) return 'Moderate';
    return 'Emerging';
  };

  const signalLevel = getSignalLevel(trait.score);

  // Get visual width with larger gaps between levels
  const getVisualWidth = (score: number): number => {
    if (score >= 90) {
      const normalizedScore = (score - 90) / 10;
      return 85 + (normalizedScore * 15);
    } else if (score >= 80) {
      const normalizedScore = (score - 80) / 10;
      return 65 + (normalizedScore * 15);
    } else if (score >= 70) {
      const normalizedScore = (score - 70) / 10;
      return 45 + (normalizedScore * 15);
    } else {
      const normalizedScore = Math.max(0, (score - 50) / 20);
      return 25 + (normalizedScore * 15);
    }
  };

  const visualWidth = getVisualWidth(trait.score);

  return (
    <div className="bg-white border border-black/[0.08] shadow-sm hover:shadow-md transition-shadow p-6 h-full flex flex-col" style={{ borderRadius: '20px' }}>
      {/* Top row: Icon and Signal Level */}
      <div className="flex items-start justify-between mb-5">
        <div className={`w-10 h-10 flex items-center justify-center shrink-0 ${colors.bg}`} style={{ borderRadius: '10px' }}>
          <Icon className={`w-5 h-5 ${colors.text}`} strokeWidth={2} />
        </div>
        <span className={`${colors.text} text-sm font-semibold`}>{signalLevel}</span>
      </div>

      {/* Trait name and context */}
      <div className="mb-2 text-[#111827] font-semibold">{trait.name}</div>
      <div className="text-[#6B7280] text-sm mb-4">{trait.context}</div>

      {/* Progress bar at bottom */}
      <div className="mt-auto">
        <div className="w-full h-2 bg-[#f5f5f5] rounded-full overflow-hidden">
          <div
            className={`h-full ${colors.progressBg} rounded-full transition-all duration-300 ease-out`}
            style={{ width: `${visualWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Metric Card component
interface DSMetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  subtitle?: string;
  progress?: number;
  color?: 'purple' | 'blue' | 'teal';
}

export function DSMetricCard({ icon: Icon, title, value, subtitle, progress, color = 'purple' }: DSMetricCardProps) {
  const colors = {
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      progress: 'bg-purple-500',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      progress: 'bg-blue-500',
    },
    teal: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      icon: 'text-teal-600',
      progress: 'bg-teal-500',
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg ${colors[color].bg} border ${colors[color].border} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${colors[color].icon}`} strokeWidth={2} />
        </div>
      </div>
      <div className="mb-1 text-gray-900 font-medium">{title}</div>
      <div className="text-gray-600">{value}</div>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      {progress !== undefined && (
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-3">
          <div 
            className={`h-full ${colors[color].progress} rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Tag/Chip component for filters and labels
interface DSTagProps {
  children: React.ReactNode;
  color?: 'purple' | 'teal' | 'blue' | 'default';
  size?: 'sm' | 'md';
}

export function DSTag({ children, color = 'default', size = 'md' }: DSTagProps) {
  const colors = {
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    default: 'bg-gray-100 border-gray-200 text-gray-700',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span className={`${colors[color]} ${sizes[size]} border rounded-full font-medium`}>
      {children}
    </span>
  );
}

// Interactive Tag Button (for selectable tags)
interface DSTagButtonProps {
  children: React.ReactNode;
  selected?: boolean;
  color?: 'purple' | 'teal' | 'blue';
  onClick?: () => void;
  disabled?: boolean;
}

export function DSTagButton({ children, selected = false, color = 'purple', onClick, disabled }: DSTagButtonProps) {
  const colors = {
    purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
    teal: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100',
    blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
  };

  const defaultStyles = 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50';

  return (
    <button 
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 border rounded-lg transition-colors font-medium ${selected ? colors[color] : defaultStyles}`}
    >
      {children}
    </button>
  );
}

// Button component
interface DSButtonProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export function DSButton({ 
  children, 
  icon: Icon, 
  iconPosition = 'left',
  variant = 'secondary', 
  size = 'md',
  onClick 
}: DSButtonProps) {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    secondary: 'bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button 
      onClick={onClick} 
      className={`flex items-center gap-2 rounded-lg transition-all font-medium ${variants[variant]} ${sizes[size]}`}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" strokeWidth={2} />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" strokeWidth={2} />}
    </button>
  );
}

// Surface Card component
interface DSSurfaceCardProps {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}

export function DSSurfaceCard({ children, hover = false, className = '' }: DSSurfaceCardProps) {
  return (
    <div className={`bg-white border border-black/[0.08] shadow-sm p-6 ${hover ? 'hover:shadow-md transition-shadow cursor-pointer' : ''} ${className}`} style={{ borderRadius: '20px' }}>
      {children}
    </div>
  );
}

// Elevated Card (featured card)
interface DSElevatedCardProps {
  children: React.ReactNode;
  glowColor?: 'purple' | 'teal' | 'blue';
  className?: string;
}

export function DSElevatedCard({ children, glowColor: _glowColor = 'blue', className = '' }: DSElevatedCardProps) {
  return (
    <div className={`bg-white border border-black/[0.08] shadow-sm p-8 ${className}`} style={{ borderRadius: '20px' }}>
      {children}
    </div>
  );
}

// Insight Card component
interface DSInsightCardProps {
  children: React.ReactNode;
  dotColor?: 'purple' | 'teal' | 'blue';
}

export function DSInsightCard({ children, dotColor = 'blue' }: DSInsightCardProps) {
  const colors = {
    purple: 'bg-[#a78bfa]',
    teal: 'bg-[#50d5ff]',
    blue: 'bg-[#7dbbff]',
  };

  return (
    <div className="p-4 bg-[#F9F9FA] border border-black/[0.08]" style={{ borderRadius: '12px' }}>
      <div className="flex items-start gap-3">
        <div className={`w-1.5 h-1.5 rounded-full ${colors[dotColor]} mt-2 shrink-0`} />
        <div className="text-[#111827] text-sm leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

// Icon container
interface DSIconContainerProps {
  icon: LucideIcon;
  color?: 'purple' | 'teal' | 'blue';
  size?: 'sm' | 'md' | 'lg';
}

export function DSIconContainer({ icon: Icon, color = 'purple', size = 'lg' }: DSIconContainerProps) {
  const colors = {
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
    },
    teal: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      icon: 'text-teal-600',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
    },
  };

  const sizes = {
    sm: { container: 'w-10 h-10', icon: 'w-5 h-5' },
    md: { container: 'w-12 h-12', icon: 'w-6 h-6' },
    lg: { container: 'w-14 h-14', icon: 'w-7 h-7' },
  };

  return (
    <div className="mb-6">
      <div className={`${sizes[size].container} rounded-xl ${colors[color].bg} border ${colors[color].border} flex items-center justify-center`}>
        <Icon className={`${sizes[size].icon} ${colors[color].icon}`} strokeWidth={2} />
      </div>
    </div>
  );
}

// List item with bullet
interface DSListItemProps {
  children: React.ReactNode;
  color?: 'purple' | 'teal' | 'blue';
}

export function DSListItem({ children, color = 'purple' }: DSListItemProps) {
  const colors = {
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      dot: 'bg-purple-500',
    },
    teal: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      dot: 'bg-teal-500',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      dot: 'bg-blue-500',
    },
  };

  return (
    <li className="flex items-start gap-3 group/item">
      <div className={`w-5 h-5 rounded-lg ${colors[color].bg} border ${colors[color].border} flex items-center justify-center mt-0.5 shrink-0`}>
        <div className={`w-1.5 h-1.5 rounded-full ${colors[color].dot}`} />
      </div>
      <span className="text-gray-700">{children}</span>
    </li>
  );
}

// Feature chip/pill with icon
interface DSFeatureChipProps {
  icon: LucideIcon;
  label: string;
  color?: 'purple' | 'teal' | 'blue';
}

export function DSFeatureChip({ icon: Icon, label, color = 'purple' }: DSFeatureChipProps) {
  const colors = {
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      iconColor: 'text-purple-600',
    },
    teal: {
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      iconColor: 'text-teal-600',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      iconColor: 'text-blue-600',
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className={`w-10 h-10 rounded-lg ${colors[color].bg} border ${colors[color].border} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors[color].iconColor}`} strokeWidth={2} />
        </div>
        <div>
          <div className="text-sm text-gray-700 font-medium">{label}</div>
        </div>
      </div>
    </div>
  );
}