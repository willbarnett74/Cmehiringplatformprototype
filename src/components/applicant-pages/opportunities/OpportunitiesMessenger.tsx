import { useEffect, useMemo, useState } from 'react';
import type { ApplicantOpportunity, EmployerLikeStage } from '../../../lib/applicantOpportunitiesMock';
import { ConversationsPane } from './ConversationsPane';
import { MESSENGER_FILTER_ORDER, type MessengerFilterStage } from './messengerLifecycle';
import { filterThreads, isThreadUnread } from './messengerUtils';
import { Thread } from './Thread';

const shellClass = (fullBleed: boolean) =>
  fullBleed
    ? 'flex h-full min-h-0 min-w-0 w-full flex-1 overflow-hidden bg-white'
    : 'flex h-full min-h-0 min-w-0 w-full flex-1 overflow-hidden rounded-xl border border-black/[0.07] bg-white';

export function OpportunitiesMessenger({
  opportunities,
  selectedId,
  setSelectedId,
  updateOpportunity,
  onSendApplicantMessage,
  onPrimaryAction,
  showToast,
  onThreadOpened,
  onStagePersist,
  fullBleed = false,
}: {
  opportunities: ApplicantOpportunity[];
  selectedId: string;
  setSelectedId: (id: string) => void;
  updateOpportunity: (id: string, updater: (o: ApplicantOpportunity) => ApplicantOpportunity) => void;
  onSendApplicantMessage: (opportunity: ApplicantOpportunity, body: string) => void;
  onPrimaryAction: (opportunity: ApplicantOpportunity) => void;
  showToast: (msg: string) => void;
  /** Optional: persist read state (e.g. Supabase) when user opens a thread. */
  onThreadOpened?: (opportunity: ApplicantOpportunity) => void;
  /** Optional: persist stage when user changes the picker (e.g. Supabase). */
  onStagePersist?: (opportunity: ApplicantOpportunity, stage: EmployerLikeStage) => void;
  /** Edge-to-edge in applicant shell (no rounded card or outer gray margin). */
  fullBleed?: boolean;
}) {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<MessengerFilterStage>('all');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [composer, setComposer] = useState('');
  const [showTyping, setShowTyping] = useState(false);

  const stageCounts = useMemo(() => {
    return MESSENGER_FILTER_ORDER.reduce(
      (acc, stage) => {
        acc[stage] =
          stage === 'all' ? opportunities.length : opportunities.filter((p) => p.status === stage).length;
        return acc;
      },
      {} as Record<MessengerFilterStage, number>,
    );
  }, [opportunities]);

  const filteredThreads = useMemo(
    () => filterThreads(opportunities, { query: search, stage: stageFilter }),
    [opportunities, search, stageFilter],
  );

  const totalUnreadCount = useMemo(() => opportunities.filter(isThreadUnread).length, [opportunities]);

  const activeOpportunity =
    filteredThreads.find((o) => o.id === selectedId) ?? filteredThreads[0] ?? null;

  useEffect(() => {
    if (filteredThreads.length === 0) return;
    if (!filteredThreads.some((o) => o.id === selectedId)) {
      setSelectedId(filteredThreads[0].id);
    }
  }, [filteredThreads, selectedId, setSelectedId]);

  useEffect(() => {
    setComposer('');
  }, [activeOpportunity?.id]);

  const handleSelectId = (id: string) => {
    setSelectedId(id);
    const opp = opportunities.find((o) => o.id === id);
    updateOpportunity(id, (current) => ({
      ...current,
      unread: false,
      unreadMessages: 0,
      messages: current.messages.map((m) => ({ ...m, read: true })),
    }));
    if (opp) onThreadOpened?.(opp);
  };

  const handleStageChange = (stage: EmployerLikeStage) => {
    if (!activeOpportunity) return;
    onStagePersist?.(activeOpportunity, stage);
    updateOpportunity(activeOpportunity.id, (current) => ({
      ...current,
      status: stage,
      unread: false,
      unreadMessages: 0,
      messages: current.messages.map((m) => ({ ...m, read: true })),
      nextAction: {
        ...current.nextAction,
        state: 'manual',
      },
    }));
  };

  const handleSend = (body: string) => {
    if (!activeOpportunity) return;
    onSendApplicantMessage(activeOpportunity, body);
    setShowTyping(true);
    window.setTimeout(() => setShowTyping(false), 1400);
  };

  if (opportunities.length === 0) {
    return (
      <div
        className={`flex h-full min-h-0 min-w-0 flex-1 items-center justify-center text-sm text-[#9CA3AF] ${fullBleed ? 'bg-white' : 'bg-[#fafafa]'}`}
      >
        No opportunities yet.
      </div>
    );
  }

  if (filteredThreads.length === 0) {
    return (
      <div className={shellClass(fullBleed)}>
        <ConversationsPane
          threads={[]}
          stageCounts={stageCounts}
          selectedId={selectedId}
          onSelectId={handleSelectId}
          search={search}
          onSearchChange={setSearch}
          stageFilter={stageFilter}
          onStageFilterChange={setStageFilter}
          totalUnreadCount={totalUnreadCount}
          onComposeClick={() => showToast('Coming soon')}
        />
        <div
          className={`flex h-full min-h-0 min-w-0 flex-1 items-center justify-center px-6 text-center text-sm text-[#9CA3AF] ${fullBleed ? 'bg-white' : 'bg-[#fafafa]'}`}
        >
          No conversations match your search or filter.
        </div>
      </div>
    );
  }

  if (!activeOpportunity) {
    return null;
  }

  return (
    <div className={shellClass(fullBleed)}>
      <ConversationsPane
        threads={filteredThreads}
        stageCounts={stageCounts}
        selectedId={selectedId}
        onSelectId={handleSelectId}
        search={search}
        onSearchChange={setSearch}
        stageFilter={stageFilter}
        onStageFilterChange={setStageFilter}
        totalUnreadCount={totalUnreadCount}
        onComposeClick={() => showToast('Coming soon')}
      />
      <Thread
        key={activeOpportunity.id}
        opportunity={activeOpportunity}
        detailsOpen={detailsOpen}
        onToggleDetails={() => setDetailsOpen((v) => !v)}
        onStageChange={handleStageChange}
        onSendMessage={handleSend}
        onPrimaryAction={() => onPrimaryAction(activeOpportunity)}
        composerValue={composer}
        onComposerChange={setComposer}
        showTyping={showTyping}
      />
    </div>
  );
}
