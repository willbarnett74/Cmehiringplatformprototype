import { useEffect, useRef } from 'react';
import { Info, Paperclip, Phone, Send, Smile, Sparkles, Video } from 'lucide-react';
import type { ApplicantOpportunity, EmployerLikeStage } from '../../../lib/applicantOpportunitiesMock';
import { Avatar } from './Avatar';
import { DetailsRail } from './DetailsRail';
import { MessageBubble, TypingIndicatorBubble } from './MessageBubble';
import { StagePicker } from './StagePicker';
import { matchScoreVisual, suggestedRepliesForOpportunity, threadShowsOnlineIndicator } from './messengerUtils';

function dayLabelFromSentAt(sentAt: string): string {
  const part = sentAt.split(',')[0]?.trim() ?? sentAt;
  return part || '—';
}

export function Thread({
  opportunity,
  detailsOpen,
  onToggleDetails,
  onStageChange,
  onSendMessage,
  onPrimaryAction,
  composerValue,
  onComposerChange,
  showTyping,
}: {
  opportunity: ApplicantOpportunity;
  detailsOpen: boolean;
  onToggleDetails: () => void;
  onStageChange: (stage: EmployerLikeStage) => void;
  onSendMessage: (body: string) => void;
  onPrimaryAction: () => void;
  composerValue: string;
  onComposerChange: (v: string) => void;
  showTyping: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { star } = matchScoreVisual(opportunity.matchScore);
  const online = threadShowsOnlineIndicator(opportunity);
  const chips = suggestedRepliesForOpportunity(opportunity);

  const subline = [opportunity.role.title, opportunity.role.location, opportunity.contact.name].filter(Boolean).join(' · ');

  const messagesWithMeta = opportunity.messages.map((msg, i) => {
    const next = opportunity.messages[i + 1];
    const showMeta = !next || next.sender !== msg.sender;
    return { msg, showMeta };
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [opportunity.id, opportunity.messages.length, showTyping]);

  const send = () => {
    const body = composerValue.trim();
    if (!body) return;
    onSendMessage(body);
    onComposerChange('');
  };

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 bg-[#fafafa]">
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
        <header className="shrink-0 border-b border-black/[0.07] bg-white px-[22px] py-3.5">
          <div className="flex items-start gap-3">
            <Avatar companyName={opportunity.business.name} online={online} size={42} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-[15px] font-semibold text-[#111827]">{opportunity.business.name}</h3>
                <StagePicker status={opportunity.status} onChange={onStageChange} />
              </div>
              <p className="mt-0.5 truncate text-[12.5px] text-[#6B7280]">{subline}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <div
                className="mr-1 flex items-center gap-1 rounded-full bg-black/[0.04] py-1 pl-1.5 pr-2.5"
                aria-label={`Match score ${opportunity.matchScore} out of 100`}
              >
                <span
                  className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[10px] text-white"
                  style={{ background: star }}
                >
                  ★
                </span>
                <span className="font-dashboard-mono text-xs font-semibold tabular-nums text-[#111827]">
                  {opportunity.matchScore}
                  <span className="text-[11px] font-normal text-[#9CA3AF]">/100</span>
                </span>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#374151] transition-colors hover:bg-[#f3f4f6]"
                aria-disabled
                aria-label="Call (coming soon)"
              >
                <Phone className="h-4 w-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#374151] transition-colors hover:bg-[#f3f4f6]"
                aria-disabled
                aria-label="Video (coming soon)"
              >
                <Video className="h-4 w-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                onClick={onToggleDetails}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  detailsOpen ? 'bg-[#eaf3ff] text-[#7dbbff]' : 'text-[#374151] hover:bg-[#f3f4f6]'
                }`}
                aria-label={detailsOpen ? 'Hide details and match context' : 'Show details and why you matched'}
                aria-pressed={detailsOpen}
              >
                <Info className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="cme-messenger-scroll min-h-0 flex-1 overflow-y-auto px-[22px] py-3">
          {opportunity.messages.length === 0 ? (
            <div className="mx-auto mt-8 max-w-md rounded-[14px] border border-dashed border-black/12 bg-white p-[18px] text-center text-sm text-[#6B7280]">
              <p className="font-medium text-[#111827]">No conversation yet</p>
              <p className="mt-2 text-xs leading-relaxed">CMe is monitoring this match for business activity. You can reply when you are ready.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {messagesWithMeta.map(({ msg, showMeta }, idx) => {
                const prev = opportunity.messages[idx - 1];
                const showDay =
                  idx === 0 || dayLabelFromSentAt(msg.sentAt) !== dayLabelFromSentAt(prev?.sentAt ?? '');
                return (
                  <div key={msg.id}>
                    {showDay ? (
                      <div className="flex items-center gap-3 py-2">
                        <span className="h-px flex-1 bg-black/[0.06]" />
                        <span className="font-dashboard-mono text-[10.5px] uppercase tracking-[0.06em] text-[#9CA3AF]">
                          {dayLabelFromSentAt(msg.sentAt)}
                        </span>
                        <span className="h-px flex-1 bg-black/[0.06]" />
                      </div>
                    ) : null}
                    <MessageBubble
                      msg={msg}
                      contactName={opportunity.contact.name}
                      meta={showMeta ? msg.sentAt : null}
                    />
                  </div>
                );
              })}
              {showTyping ? <TypingIndicatorBubble /> : null}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-black/[0.04] px-[22px] py-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <Sparkles className="h-3 w-3 shrink-0 text-[#9CA3AF]" strokeWidth={2} />
            <span className="shrink-0 text-[11px] text-[#9CA3AF]">Suggested</span>
            {chips.map((text) => (
              <button
                key={text}
                type="button"
                onClick={() => onSendMessage(text)}
                className="shrink-0 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[12.5px] text-[#374151] transition-colors hover:border-[#c7defc] hover:bg-[#eef5ff] hover:text-[#1f63b8]"
              >
                {text}
              </button>
            ))}
          </div>
        </div>

        <div className="shrink-0 bg-white px-[22px] pb-[18px] pt-3">
          <div className="composer flex items-end gap-2 rounded-[22px] border border-black/10 py-2 pl-3.5 pr-2 focus-within:border-[#7dbbff] focus-within:shadow-[0_0_0_4px_rgba(125,187,255,0.12)]">
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#f3f4f6]"
              aria-label="Attach file (coming soon)"
            >
              <Paperclip className="h-4 w-4" strokeWidth={2} />
            </button>
            <textarea
              rows={1}
              value={composerValue}
              onChange={(e) => onComposerChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={`Message ${opportunity.contact.name}…`}
              className="max-h-[120px] min-h-[24px] flex-1 resize-none border-0 bg-transparent py-1.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-0"
            />
            <button
              type="button"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#f3f4f6]"
              aria-label="Emoji (coming soon)"
            >
              <Smile className="h-4 w-4" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={send}
              disabled={!composerValue.trim()}
              className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-white shadow-[0_2px_8px_rgba(125,187,255,0.4)] transition-transform active:scale-[0.94] disabled:bg-[#e5e7eb] disabled:shadow-none"
              style={{ background: composerValue.trim() ? '#7dbbff' : undefined }}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {detailsOpen ? (
        <DetailsRail opportunity={opportunity} onClose={onToggleDetails} onPrimaryAction={onPrimaryAction} />
      ) : null}
    </div>
  );
}
