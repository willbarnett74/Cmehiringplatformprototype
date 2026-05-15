import { Check, Clock, X } from 'lucide-react';

export function TraitLockGate2Interstitial(props: {
  onContinue: () => void;
  onComeBackLater: () => void;
}) {
  const { onContinue, onComeBackLater } = props;
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-2 py-8">
      <Clock className="mb-4 h-10 w-10 shrink-0 text-[#7DBBFF]" strokeWidth={1.75} aria-hidden />
      <h2 className="mb-3 text-center text-xl font-semibold tracking-[-0.02em] text-[#111827]">
        Before you continue
      </h2>
      <div className="w-full rounded-xl border border-black/[0.08] bg-[#FAFAFA] px-5 py-5 text-[13.5px] leading-[1.65] text-[#374151]">
        <p className="mb-3">
          The next five sections will shape your trait profile — the core of how employers understand your working
          style.
        </p>
        <p className="mb-3">
          Your answers are saved as you go, so you can close and come back anytime. But once all sections are
          submitted, your trait profile is locked in.
        </p>
        <p className="mb-0">
          Make sure you&apos;re in a good headspace and have about 30 minutes. There&apos;s no timer — go at your own
          pace.
        </p>
      </div>
      <div className="mt-8 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onContinue}
          className="rounded-[5px] bg-[#7DBBFF] px-[18px] py-2.5 text-[12.5px] font-medium text-white transition-colors hover:bg-[#6aabef]"
        >
          I&apos;m ready — continue
        </button>
        <button
          type="button"
          onClick={onComeBackLater}
          className="rounded-[5px] border border-black/[0.11] bg-white px-[18px] py-2.5 text-[12.5px] font-medium text-[#374151] transition-colors hover:bg-[#FAFAFA]"
        >
          I&apos;ll come back later
        </button>
      </div>
    </div>
  );
}

export function ProfileSubmitGate3Confirmation(props: {
  onSubmit: () => void;
  onReviewAnswers: () => void;
}) {
  const { onSubmit, onReviewAnswers } = props;
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-2 py-8">
      <h2 className="mb-4 text-center text-xl font-semibold tracking-[-0.02em] text-[#111827]">
        Ready to submit your profile?
      </h2>
      <div className="w-full rounded-xl border border-black/[0.08] bg-[#FAFAFA] px-5 py-5">
        <p className="mb-3 text-[13.5px] font-medium text-[#374151]">Once you submit:</p>
        <ul className="space-y-2.5 text-[13px] leading-snug text-[#374151]">
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" strokeWidth={2.5} aria-hidden />
            <span>Your trait profile will be finalised and visible to employers</span>
          </li>
          <li className="flex gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#10B981]" strokeWidth={2.5} aria-hidden />
            <span>Your background story, career preferences, and contact details can always be updated</span>
          </li>
          <li className="flex gap-2">
            <X className="mt-0.5 h-4 w-4 shrink-0 text-[#EF4444]" strokeWidth={2.5} aria-hidden />
            <span>Your trait assessment answers (sections 2–6) will be locked</span>
          </li>
        </ul>
        <p className="mt-4 text-[12.5px] leading-relaxed text-[#6B7280]">
          This is by design — it ensures employers see an authentic picture of your working style, not a rehearsed one.
        </p>
      </div>
      <div className="mt-8 flex w-full flex-col gap-2.5 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-[5px] bg-[#7DBBFF] px-[18px] py-2.5 text-[12.5px] font-medium text-white transition-colors hover:bg-[#6aabef]"
        >
          Submit my profile
        </button>
        <button
          type="button"
          onClick={onReviewAnswers}
          className="rounded-[5px] border border-black/[0.11] bg-white px-[18px] py-2.5 text-[12.5px] font-medium text-[#374151] transition-colors hover:bg-[#FAFAFA]"
        >
          Review my answers
        </button>
      </div>
    </div>
  );
}
