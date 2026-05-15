import { Edit3, Search } from 'lucide-react';
import type { ApplicantOpportunity } from '../../../lib/applicantOpportunitiesMock';
import { ConversationRow } from './ConversationRow';
import { MESSENGER_FILTER_ALL_DOT, MESSENGER_FILTER_ORDER, messengerStageUi, type MessengerFilterStage } from './messengerLifecycle';
import { partitionUnreadEarlier } from './messengerUtils';

export function ConversationsPane({
  threads,
  stageCounts,
  selectedId,
  onSelectId,
  search,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  totalUnreadCount,
  onComposeClick,
}: {
  threads: ApplicantOpportunity[];
  stageCounts: Record<MessengerFilterStage, number>;
  selectedId: string;
  onSelectId: (id: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  stageFilter: MessengerFilterStage;
  onStageFilterChange: (v: MessengerFilterStage) => void;
  totalUnreadCount: number;
  onComposeClick: () => void;
}) {
  const { unread, read } = partitionUnreadEarlier(threads);
  const showBucketLabels = unread.length > 0 && read.length > 0;

  return (
    <div className="flex h-full min-h-0 w-[340px] shrink-0 flex-col border-r border-black/[0.07] bg-white">
      <div className="shrink-0 px-4 pb-3 pt-5">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#111827]">Opportunities</h2>
          {totalUnreadCount > 0 ? (
            <span className="rounded-full bg-[#7dbbff] px-[7px] py-0.5 text-[11px] font-semibold text-white">
              {totalUnreadCount} new
            </span>
          ) : null}
          <span className="flex-1" />
          <button
            type="button"
            onClick={onComposeClick}
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#f3f4f6] text-[#374151] transition-colors hover:bg-[#e5e7eb]"
            aria-label="New message (coming soon)"
          >
            <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#f3f4f6] px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" strokeWidth={2} />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search companies, roles…"
            className="min-w-0 flex-1 border-0 bg-transparent text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-0"
            aria-label="Search conversations"
          />
        </div>
      </div>

      <div className="shrink-0 overflow-x-auto px-4 pb-3">
        <div className="flex gap-1.5">
          {MESSENGER_FILTER_ORDER.filter((stage) => stage === 'all' || stageCounts[stage] > 0).map((stage) => {
            const active = stageFilter === stage;
            const count = stageCounts[stage];
            const dotColor = stage === 'all' ? MESSENGER_FILTER_ALL_DOT : messengerStageUi(stage).color;
            const label = stage === 'all' ? 'All' : messengerStageUi(stage).label;
            return (
              <button
                key={stage}
                type="button"
                onClick={() => onStageFilterChange(stage)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-[11px] py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'border-[#111827] bg-[#111827] text-white'
                    : 'border-black/10 bg-white text-[#374151]'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: dotColor }} />
                {label}
                <span className="font-dashboard-mono tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="cme-messenger-scroll min-h-0 flex-1 overflow-y-auto">
        {showBucketLabels ? (
          <p className="px-4 pb-1.5 pt-3.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Unread
            <span className="ml-1.5 font-dashboard-mono font-normal">{unread.length}</span>
          </p>
        ) : null}
        {unread.map((o) => (
          <ConversationRow key={o.id} opportunity={o} selected={o.id === selectedId} onSelect={() => onSelectId(o.id)} />
        ))}
        {showBucketLabels ? (
          <p className="px-4 pb-1.5 pt-3.5 text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#9CA3AF]">
            Earlier
            <span className="ml-1.5 font-dashboard-mono font-normal">{read.length}</span>
          </p>
        ) : null}
        {read.map((o) => (
          <ConversationRow key={o.id} opportunity={o} selected={o.id === selectedId} onSelect={() => onSelectId(o.id)} />
        ))}
        {threads.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[#9CA3AF]">No conversations match.</p>
        ) : null}
      </div>
    </div>
  );
}
