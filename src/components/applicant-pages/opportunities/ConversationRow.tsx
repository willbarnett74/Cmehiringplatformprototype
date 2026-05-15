import { Avatar } from './Avatar';
import { compactListTimestamp, isThreadUnread, threadPreviewLast, threadShowsOnlineIndicator } from './messengerUtils';
import { messengerStageUi } from './messengerLifecycle';
import type { ApplicantOpportunity } from '../../../lib/applicantOpportunitiesMock';

export function ConversationRow({
  opportunity,
  selected,
  onSelect,
}: {
  opportunity: ApplicantOpportunity;
  selected: boolean;
  onSelect: () => void;
}) {
  const unread = isThreadUnread(opportunity);
  const stageUi = messengerStageUi(opportunity.status);
  const preview = threadPreviewLast(opportunity);
  const online = threadShowsOnlineIndicator(opportunity);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex w-full gap-3 border-l-[3px] py-[13px] pl-[13px] pr-4 text-left transition-colors duration-[120ms] ${
        selected ? 'bg-[#eaf3ff]' : 'border-l-transparent hover:bg-[#fafafa]'
      }`}
      style={
        selected
          ? { borderLeftColor: stageUi.color }
          : { borderLeftColor: 'transparent' }
      }
    >
      <Avatar companyName={opportunity.business.name} size={42} online={online} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`min-w-0 truncate text-sm ${unread ? 'font-semibold text-[#111827]' : 'font-medium text-[#374151]'}`}
          >
            {opportunity.business.name}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-[10.5px] font-semibold" style={{ color: stageUi.color }}>
            <span className="h-[5px] w-[5px] rounded-full" style={{ background: stageUi.color }} />
            {stageUi.label}
          </span>
          <span className="min-w-0 flex-1" />
          <span
            className={`font-dashboard-mono shrink-0 text-[10.5px] ${unread ? 'font-semibold' : 'font-normal text-[#9CA3AF]'}`}
            style={unread ? { color: stageUi.color } : undefined}
          >
            {compactListTimestamp(opportunity.lastUpdate)}
          </span>
        </div>
        <p className="mt-px truncate text-[12.5px] text-[#6B7280]">{opportunity.role.title}</p>
        <div className="mt-[3px] flex justify-between gap-2">
          <p
            className={`min-w-0 truncate text-[12.5px] ${unread ? 'font-medium text-[#111827]' : 'font-normal text-[#9CA3AF]'}`}
          >
            {preview || '\u00a0'}
          </p>
          {unread ? (
            <span
              className="h-2 w-2 shrink-0 rounded-full animate-cme-pulse-dot"
              style={{ background: stageUi.color }}
              aria-hidden
            />
          ) : (
            <span className="font-dashboard-mono shrink-0 text-[10px] tabular-nums text-[#C4C4CC]">
              {opportunity.matchScore}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
