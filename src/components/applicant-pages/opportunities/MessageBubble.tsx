import type { ApplicantOpportunityMessage } from '../../../lib/applicantOpportunitiesMock';

export function MessageBubble({
  msg,
  meta,
  contactName,
}: {
  msg: ApplicantOpportunityMessage;
  meta: string | null;
  contactName: string;
}) {
  const outgoing = msg.sender === 'applicant';
  return (
    <div className={`flex max-w-[70%] flex-col ${outgoing ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
      <div
        className={`animate-cme-msg-in px-[14px] py-2.5 text-sm leading-[1.5] ${
          outgoing
            ? 'rounded-[18px] rounded-br-[6px] bg-[#7dbbff] text-white shadow-[0_2px_8px_rgba(125,187,255,0.25)]'
            : 'rounded-[18px] rounded-bl-[6px] border border-black/[0.07] bg-white text-[#111827] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
        }`}
      >
        {msg.body}
      </div>
      {meta ? (
        <p className="mt-1 font-dashboard-mono text-[10px] text-[#9CA3AF]">
          {outgoing ? 'You' : contactName} · {meta}
        </p>
      ) : null}
    </div>
  );
}

export function TypingIndicatorBubble() {
  return (
    <div className="mr-auto flex max-w-[70%] flex-col">
      <div className="rounded-[18px] rounded-bl-[6px] border border-black/[0.07] bg-white px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <span className="inline-flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block h-[5px] w-[5px] rounded-full bg-[#9CA3AF]"
              style={{
                animation: 'cme-typing-bob 1.2s infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
