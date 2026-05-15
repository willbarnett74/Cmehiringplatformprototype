import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import type { EmployerLikeStage } from '../../../lib/applicantOpportunitiesMock';
import { STAGE_PICKER_ORDER, messengerStageUi } from './messengerLifecycle';

export function StagePicker({
  status,
  onChange,
}: {
  status: EmployerLikeStage;
  onChange: (next: EmployerLikeStage) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const ui = messengerStageUi(status);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold transition-colors"
        style={{
          borderColor: `${ui.color}33`,
          background: ui.bg,
          color: ui.color,
        }}
      >
        <span className="inline-block h-[5px] w-[5px] shrink-0 rounded-full" style={{ background: ui.color }} />
        {ui.label}
        <ChevronDown className="h-3 w-3 opacity-70" strokeWidth={2} />
      </button>
      {open ? (
        <div
          className="absolute left-0 top-full z-20 mt-1 w-[240px] rounded-xl border border-black/[0.08] bg-white p-1.5 shadow-[0_12px_32px_rgba(15,23,42,0.14),0_2px_6px_rgba(15,23,42,0.06)]"
          role="listbox"
        >
          <p className="px-2 pb-1 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
            Move to stage
          </p>
          {STAGE_PICKER_ORDER.map((stage) => {
            const row = messengerStageUi(stage);
            const active = stage === status;
            return (
              <button
                key={stage}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(stage);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[13px] font-medium transition-colors hover:bg-[#f5f6f8]"
                style={active ? { background: row.bg } : undefined}
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: row.color }} />
                <span className="flex-1" style={{ color: active ? row.color : '#374151' }}>
                  {row.label}
                </span>
                {active ? <Check className="h-4 w-4 shrink-0" style={{ color: row.color }} strokeWidth={2} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
