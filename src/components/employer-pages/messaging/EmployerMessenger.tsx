import { useEffect, useMemo, useState } from 'react';
import { MessageSquare, Search } from 'lucide-react';
import type { EmployerEngagementThread } from '../../../lib/employerEngagements';
import type { EmployerLikeStage } from '../../../lib/applicantOpportunitiesMock';

const STAGE_OPTIONS: { value: EmployerLikeStage; label: string }[] = [
  { value: 'discovered', label: 'Discovered' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'responded', label: 'Responded' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'decision', label: 'Decision' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

function MessageBubble({
  body,
  outgoing,
  meta,
}: {
  body: string;
  outgoing: boolean;
  meta: string;
}) {
  return (
    <div className={`flex max-w-[70%] flex-col ${outgoing ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
      <div
        className={`px-[14px] py-2.5 text-sm leading-[1.5] ${
          outgoing
            ? 'rounded-[18px] rounded-br-[6px] bg-[#7dbbff] text-white shadow-[0_2px_8px_rgba(125,187,255,0.25)]'
            : 'rounded-[18px] rounded-bl-[6px] border border-black/[0.07] bg-white text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
        }`}
      >
        {body}
      </div>
      <p className="mt-1 font-dashboard-mono text-[10px] text-[#9CA3AF]">{meta}</p>
    </div>
  );
}

export function EmployerMessenger({
  threads,
  selectedEngagementId,
  onSelectEngagement,
  onSendMessage,
  onStageChange,
  onOpenProfile,
}: {
  threads: EmployerEngagementThread[];
  selectedEngagementId: string | null;
  onSelectEngagement: (id: string) => void;
  onSendMessage: (engagementId: string, body: string) => void;
  onStageChange: (engagementId: string, stage: EmployerLikeStage) => void;
  onOpenProfile: (thread: EmployerEngagementThread) => void;
}) {
  const [search, setSearch] = useState('');
  const [composer, setComposer] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (t) =>
        t.candidate.name.toLowerCase().includes(q) ||
        t.candidate.role.toLowerCase().includes(q),
    );
  }, [threads, search]);

  const active =
    filtered.find((t) => t.engagementId === selectedEngagementId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (active && active.engagementId !== selectedEngagementId) {
      onSelectEngagement(active.engagementId);
    }
  }, [active, selectedEngagementId, onSelectEngagement]);

  useEffect(() => {
    setComposer('');
  }, [active?.engagementId]);

  if (!threads.length) {
    return (
      <div className="flex h-[480px] items-center justify-center rounded-xl border border-black/[0.08] bg-white text-sm text-[#9CA3AF]">
        No conversations yet. Contact a candidate from Search or the pipeline.
      </div>
    );
  }

  const send = () => {
    const body = composer.trim();
    if (!body || !active) return;
    onSendMessage(active.engagementId, body);
    setComposer('');
  };

  return (
    <div className="flex h-[min(720px,calc(100vh-180px))] min-h-[480px] overflow-hidden rounded-xl border border-black/[0.08] bg-white">
      <div className="flex w-[280px] shrink-0 flex-col border-r border-black/[0.08]">
        <div className="border-b border-black/[0.08] p-3">
          <div className="flex items-center gap-2 rounded-lg border border-black/[0.08] bg-[#fafafa] px-3 py-2">
            <Search className="h-3.5 w-3.5 text-[#9CA3AF]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search threads"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.map((t) => {
            const selected = t.engagementId === active?.engagementId;
            return (
              <button
                key={t.engagementId}
                type="button"
                onClick={() => onSelectEngagement(t.engagementId)}
                className={`flex w-full flex-col gap-0.5 border-b border-black/[0.05] px-3 py-3 text-left transition-colors ${
                  selected ? 'bg-[#7dbbff]/10' : 'hover:bg-[#fafafa]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-[#111827]">{t.candidate.name}</span>
                  {t.unreadCount > 0 ? (
                    <span className="shrink-0 rounded-full bg-[#7dbbff] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                      {t.unreadCount}
                    </span>
                  ) : null}
                </div>
                <span className="truncate text-xs text-[#6B7280]">{t.candidate.role}</span>
                <span className="truncate text-[10px] text-[#9CA3AF]">{t.lastUpdate}</span>
              </button>
            );
          })}
        </div>
      </div>

      {active ? (
        <div className="flex min-w-0 flex-1 flex-col bg-[#fafafa]">
          <div className="flex items-center justify-between border-b border-black/[0.08] bg-white px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#111827]">{active.candidate.name}</p>
              <p className="truncate text-xs text-[#6B7280]">
                {active.candidate.role} · Match {active.matchScore}%
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={active.stage}
                onChange={(e) =>
                  onStageChange(active.engagementId, e.target.value as EmployerLikeStage)
                }
                className="rounded-md border border-black/[0.08] bg-white px-2 py-1 text-xs"
              >
                {STAGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onOpenProfile(active)}
                className="rounded-md border border-black/[0.08] px-2 py-1 text-xs text-[#111827] hover:bg-[#fafafa]"
              >
                Profile
              </button>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4">
            {active.messages.length === 0 ? (
              <p className="text-center text-xs text-[#9CA3AF]">No messages yet. Say hello to start the thread.</p>
            ) : (
              active.messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  body={m.body}
                  outgoing={m.sender === 'employer'}
                  meta={`${m.sender === 'employer' ? 'You' : active.candidate.name} · ${m.sentAt}`}
                />
              ))
            )}
          </div>

          <div className="border-t border-black/[0.08] bg-white p-3">
            <div className="flex gap-2">
              <textarea
                value={composer}
                onChange={(e) => setComposer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={2}
                placeholder="Write a message…"
                className="min-h-[44px] flex-1 resize-none rounded-lg border border-black/[0.08] px-3 py-2 text-sm outline-none focus:border-[#7dbbff]"
              />
              <button
                type="button"
                onClick={send}
                disabled={!composer.trim()}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-[#7dbbff] px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Send
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
