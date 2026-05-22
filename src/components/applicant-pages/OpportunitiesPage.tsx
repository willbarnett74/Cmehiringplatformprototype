import { useState, useEffect, useCallback, useRef } from 'react';
import { Layers, CheckCircle2, Compass } from 'lucide-react';

import { applicantOpportunitiesMockData } from '../../lib/applicantOpportunitiesMock';
import type { ApplicantOpportunity, EmployerLikeStage } from '../../lib/applicantOpportunitiesMock';
import { OpportunitiesMessenger } from './opportunities/OpportunitiesMessenger';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import {
  fetchApplicantOpportunities,
  insertCandidateEngagementMessage,
  upsertEngagementReadState,
  updateEngagementStageFromApplicant,
} from '../../lib/applicantEngagements';
import type { DimensionScores } from '../../utils/intakeScoring';
import {
  fetchSavedExploreIndustryIds,
  loadExploreIndustriesForApplicant,
  saveExploreIndustry,
  unsaveExploreIndustry,
  type ExploreIndustry,
} from '../../lib/exploreIndustries';
import { ExploreIndustriesWorkspace } from './explore-industries/ExploreIndustriesWorkspace';

// ─── Types ─────────────────────────────────────────────────────────────

type SubTab = 'opportunities' | 'explore';

// ─── Data ──────────────────────────────────────────────────────────────

const initialOpportunitiesData = applicantOpportunitiesMockData;

function nowMessageLabel(): string {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export type OpportunitiesEmbeddedMode = 'opportunities' | 'explore';

export type OpportunitiesPageProps = {
  /** When set, show only this tab (no sub-tab strip or Opportunities header). Used by applicant shell nav. */
  mode?: OpportunitiesEmbeddedMode;
  /** Select a specific opportunity from dashboard/notification context. */
  selectedOpportunityId?: string | null;
  /** Select a specific engagement-backed opportunity from dashboard/notification context. */
  selectedOpportunityEngagementId?: string | null;
  /** `candidate_profiles.id` for the signed-in user — loads real engagements when Supabase is configured. */
  candidateProfileId?: string | null;
  /** Increment (e.g. when user opens the Opportunities nav tab) to retry loading from Supabase. */
  opportunitiesRefreshKey?: number;
  /** Report live engagement count to the shell (nav badge / header). */
  onEngagementsCountChange?: (count: number) => void;
  /** Trait scores for Explore Industries alignment bars. */
  traitScores?: DimensionScores | null;
  /** Auth user id — used for explore role interest + applicant activity timeline. */
  userId?: string | null;
  /** Catalog size for shell subtitle when Explore loads. */
  onExploreIndustriesCountChange?: (count: number) => void;
};

function subTabFromMode(mode: OpportunitiesEmbeddedMode | undefined): SubTab {
  if (mode === 'explore') return 'explore';
  return 'opportunities';
}

export function OpportunitiesPage({
  mode,
  selectedOpportunityId,
  selectedOpportunityEngagementId,
  candidateProfileId = null,
  onEngagementsCountChange,
  opportunitiesRefreshKey = 0,
  traitScores = null,
  userId = null,
  onExploreIndustriesCountChange,
}: OpportunitiesPageProps = {}) {
  const embedded = mode != null;
  const [activeTab, setActiveTab] = useState<SubTab>(() => subTabFromMode(mode));
  const [opportunities, setOpportunities] = useState<ApplicantOpportunity[]>(initialOpportunitiesData);
  const [opportunitiesSource, setOpportunitiesSource] = useState<'mock' | 'supabase'>('mock');
  const [opportunitiesLoadFailed, setOpportunitiesLoadFailed] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(() =>
    String(selectedOpportunityId ?? initialOpportunitiesData[0]?.id ?? ''),
  );
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const [exploreIndustries, setExploreIndustries] = useState<ExploreIndustry[]>([]);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [savedIndustryIds, setSavedIndustryIds] = useState<Set<string>>(() => new Set());

  const onEngagementsCountChangeRef = useRef(onEngagementsCountChange);
  onEngagementsCountChangeRef.current = onEngagementsCountChange;
  const onExploreIndustriesCountChangeRef = useRef(onExploreIndustriesCountChange);
  onExploreIndustriesCountChangeRef.current = onExploreIndustriesCountChange;

  const usingLive =
    opportunitiesSource === 'supabase' &&
    isSupabaseConfigured &&
    !!supabase &&
    !!candidateProfileId &&
    !opportunitiesLoadFailed;

  const reloadFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase || !candidateProfileId) return;
    setOpportunitiesLoadFailed(false);
    try {
      const rows = await fetchApplicantOpportunities(supabase, candidateProfileId);
      setOpportunities(rows);
      setOpportunitiesSource('supabase');
      setOpportunitiesLoadFailed(false);
      onEngagementsCountChangeRef.current?.(rows.length);
    } catch (e) {
      console.warn('[CMe] Opportunities: could not load engagements', e);
      setOpportunitiesLoadFailed(true);
      setOpportunities([]);
      setOpportunitiesSource('supabase');
      onEngagementsCountChangeRef.current?.(0);
    }
  }, [candidateProfileId]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !candidateProfileId) {
      setOpportunities(initialOpportunitiesData);
      setOpportunitiesSource('mock');
      setOpportunitiesLoadFailed(false);
      onEngagementsCountChangeRef.current?.(initialOpportunitiesData.length);
      return;
    }
    void reloadFromSupabase();
  }, [candidateProfileId, reloadFromSupabase, opportunitiesRefreshKey]);

  useEffect(() => {
    if (mode == null) return;
    setActiveTab(subTabFromMode(mode));
  }, [mode]);

  useEffect(() => {
    if (embedded && mode !== 'explore') return;
    let cancelled = false;
    setExploreLoading(true);
    void (async () => {
      try {
        const rows = await loadExploreIndustriesForApplicant(supabase);
        if (!cancelled) {
          setExploreIndustries(rows);
          onExploreIndustriesCountChangeRef.current?.(rows.length);
        }
      } finally {
        if (!cancelled) setExploreLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [embedded, mode, candidateProfileId, userId]);

  useEffect(() => {
    if (embedded && mode !== 'explore') return;
    if (!candidateProfileId || !supabase) {
      setSavedIndustryIds(new Set());
      return;
    }
    let cancelled = false;
    void fetchSavedExploreIndustryIds(supabase, candidateProfileId).then((ids) => {
      if (!cancelled) setSavedIndustryIds(ids);
    });
    return () => {
      cancelled = true;
    };
  }, [embedded, mode, candidateProfileId]);

  useEffect(() => {
    if (!selectedOpportunityEngagementId) return;
    const opportunity = opportunities.find((x) => x.engagementId === selectedOpportunityEngagementId);
    if (opportunity) setSelectedId(opportunity.id);
  }, [opportunities, selectedOpportunityEngagementId]);

  useEffect(() => {
    if (selectedOpportunityId == null || selectedOpportunityId === '') return;
    const opportunity = opportunities.find((x) => x.id === selectedOpportunityId);
    if (opportunity) setSelectedId(opportunity.id);
  }, [opportunities, selectedOpportunityId]);

  useEffect(() => {
    if (opportunities.length === 0) return;
    if (!opportunities.some((o) => o.id === selectedId)) {
      setSelectedId(opportunities[0].id);
    }
  }, [opportunities, selectedId]);

  const showToast = (message: string) => setToast({ message, visible: true });

  useEffect(() => {
    if (toast.visible) {
      const t = setTimeout(() => setToast({ message: '', visible: false }), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const updateOpportunity = (id: string, updater: (opportunity: ApplicantOpportunity) => ApplicantOpportunity) => {
    setOpportunities((prev) => prev.map((opportunity) => (opportunity.id === id ? updater(opportunity) : opportunity)));
  };

  const handleThreadOpened = useCallback(
    (opportunity: ApplicantOpportunity) => {
      if (!usingLive || !supabase || !candidateProfileId) return;
      void upsertEngagementReadState(supabase, opportunity.engagementId, candidateProfileId).catch((e) =>
        console.warn('[CMe] read state', e),
      );
    },
    [usingLive, candidateProfileId],
  );

  const handleStagePersist = useCallback(
    (opportunity: ApplicantOpportunity, stage: EmployerLikeStage) => {
      if (!usingLive || !supabase) return;
      void updateEngagementStageFromApplicant(supabase, opportunity.engagementId, stage).catch((e) =>
        console.warn('[CMe] stage update', e),
      );
    },
    [usingLive],
  );

  const handleExploreToggleSave = useCallback(
    async (industryId: string, nextSaved: boolean) => {
      if (!candidateProfileId || !supabase) {
        setSavedIndustryIds((prev) => {
          const next = new Set(prev);
          if (nextSaved) next.add(industryId);
          else next.delete(industryId);
          return next;
        });
        return;
      }
      try {
        if (nextSaved) await saveExploreIndustry(supabase, candidateProfileId, industryId);
        else await unsaveExploreIndustry(supabase, candidateProfileId, industryId);
        setSavedIndustryIds((prev) => {
          const next = new Set(prev);
          if (nextSaved) next.add(industryId);
          else next.delete(industryId);
          return next;
        });
      } catch (e) {
        console.warn('[CMe] explore save toggle', e);
      }
    },
    [candidateProfileId],
  );

  const markOpportunityResponded = (
    opportunity: ApplicantOpportunity,
    body: string,
    options?: { question?: boolean; nextActionLabel?: string; toast?: string },
  ) => {
    const messageId = `msg-${opportunity.engagementId}-${Date.now()}`;
    const eventId = `evt-${opportunity.engagementId}-response-${Date.now()}`;
    updateOpportunity(opportunity.id, (current) => ({
      ...current,
      status: current.status === 'contacted' || current.status === 'discovered' ? 'responded' : current.status,
      unread: false,
      unreadMessages: 0,
      lastUpdate: 'Just now',
      applicantResponseState: options?.question ? 'asked-question' : 'interested',
      messages: [
        ...current.messages.map((msg) => ({ ...msg, read: true })),
        {
          id: messageId,
          sender: 'applicant',
          body,
          sentAt: nowMessageLabel(),
          read: true,
        },
      ],
      timeline: [
        ...current.timeline,
        {
          id: eventId,
          label: options?.question ? 'Question sent' : 'Responded',
          description: options?.question
            ? `You asked ${current.contact.name} for more context.`
            : `You replied to ${current.business.name}.`,
          happenedAt: 'Just now',
          type: 'response',
        },
      ],
      nextAction: {
        label: options?.nextActionLabel ?? 'Waiting on business follow-up',
        description: `${current.business.name} has your response and can follow up in this thread.`,
        ctaLabel: 'Send follow-up',
        state: 'reply',
      },
    }));
    showToast(options?.toast ?? `Message sent to ${opportunity.business.name}`);
  };

  const submitApplicantMessage = (
    opportunity: ApplicantOpportunity,
    body: string,
    options?: { question?: boolean; nextActionLabel?: string; toast?: string },
  ) => {
    if (usingLive && supabase && candidateProfileId) {
      void (async () => {
        try {
          await insertCandidateEngagementMessage(supabase, opportunity.engagementId, body);
          await upsertEngagementReadState(supabase, opportunity.engagementId, candidateProfileId);
          await reloadFromSupabase();
          showToast(options?.toast ?? `Message sent to ${opportunity.business.name}`);
        } catch (e) {
          console.warn('[CMe] send message', e);
          showToast('Could not save your message. Please try again.');
        }
      })();
      return;
    }
    markOpportunityResponded(opportunity, body, options);
  };

  const handlePrimaryAction = (opportunity: ApplicantOpportunity) => {
    if (opportunity.nextAction.state === 'manual') {
      showToast('Continue the conversation using the message box below.');
      return;
    }

    if (opportunity.nextAction.state === 'view-summary') {
      updateOpportunity(opportunity.id, (current) => ({
        ...current,
        saved: true,
        lastUpdate: 'Just now',
        nextAction: {
          label: 'Saved to your opportunities',
          description: 'CMe will keep this strong match visible while monitoring for business activity.',
          ctaLabel: 'Saved',
          state: 'view-summary',
        },
      }));
      showToast(`${opportunity.business.name} saved to your opportunities`);
      return;
    }

    if (opportunity.nextAction.state === 'schedule') {
      submitApplicantMessage(opportunity, 'Thanks, I am interested. Tuesday or Thursday afternoon works for me.', {
        nextActionLabel: 'Availability sent',
        toast: `Availability sent to ${opportunity.business.name}`,
      });
      return;
    }

    if (opportunity.nextAction.state === 'review-decision') {
      updateOpportunity(opportunity.id, (current) => ({
        ...current,
        unread: false,
        unreadMessages: 0,
        lastUpdate: 'Just now',
        nextAction: {
          label: 'Decision update reviewed',
          description: `${current.business.name}'s latest update has been marked as reviewed.`,
          ctaLabel: 'Send follow-up',
          state: 'reply',
        },
      }));
      showToast(`Reviewed ${opportunity.business.name}'s update`);
      return;
    }

    submitApplicantMessage(
      opportunity,
      `Hi ${opportunity.contact.name}, thanks for reaching out. I am interested in learning more about the ${opportunity.role.title} role.`,
      {
        toast: `Interest sent to ${opportunity.business.name}`,
      },
    );
  };

  const embeddedFullBleedShell = embedded && (activeTab === 'opportunities' || activeTab === 'explore');

  const rootClass = embeddedFullBleedShell
    ? 'font-dashboard flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white text-[#111827] antialiased'
    : 'font-dashboard text-[#111827] antialiased';

  return (
    <div className={rootClass}>
      {!embedded ? (
      <div className="mb-6">
        <h1 className="text-2xl text-[#111827] font-semibold mb-2">Opportunities</h1>
        <p className="text-sm text-[#6B7280]">Explore industries, review opportunities, and connect with companies that match your profile</p>
      </div>
      ) : null}

      {!embedded ? (
        <div className="mb-6 inline-flex gap-1 border border-black/[0.08] bg-[#F9F9FA] p-1" style={{ borderRadius: '12px' }}>
          {([
            { key: 'opportunities' as SubTab, label: 'Opportunities', icon: Layers, count: opportunities.length },
            { key: 'explore' as SubTab, label: 'Explore Industries', icon: Compass, count: exploreIndustries.length },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
              style={{ borderRadius: '10px' }}
            >
              <tab.icon className="h-4 w-4" strokeWidth={2} />
              <span>{tab.label}</span>
              <span
                className={`px-2 py-0.5 text-xs font-semibold ${
                  activeTab === tab.key ? 'bg-[#7DBBFF] text-white' : 'bg-[#E5E7EB] text-[#6B7280]'
                }`}
                style={{ borderRadius: '6px' }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {activeTab === 'opportunities' ? (
        <div
          className={`flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${embedded ? '' : 'min-h-[560px]'}`}
        >
          <OpportunitiesMessenger
            opportunities={opportunities}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            updateOpportunity={updateOpportunity}
            onSendApplicantMessage={(opp, body) => submitApplicantMessage(opp, body)}
            onPrimaryAction={handlePrimaryAction}
            showToast={showToast}
            onThreadOpened={handleThreadOpened}
            onStagePersist={handleStagePersist}
            fullBleed={embedded && activeTab === 'opportunities'}
          />
        </div>
      ) : null}

      {/* ═══════════ EXPLORE INDUSTRIES TAB ═══════════ */}
      {activeTab === 'explore' ? (
        <div
          className={`flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white ${
            embedded ? '' : 'min-h-[560px]'
          }`}
        >
          {!embedded ? (
            <div className="shrink-0 border-b border-[#EDEDED] px-9 pb-4 pt-7">
              <p className="text-sm font-medium text-[#111827]">Explore industries</p>
              <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">
                Industries matched to your trait profile — filters on the left, details on the right.
              </p>
            </div>
          ) : null}
          <ExploreIndustriesWorkspace
            industries={exploreIndustries}
            traitScores={traitScores}
            savedIndustryIds={savedIndustryIds}
            onToggleSave={handleExploreToggleSave}
            loading={exploreLoading}
            candidateProfileId={candidateProfileId}
            userId={userId}
            onInterestToast={showToast}
          />
        </div>
      ) : null}

      {/* Toast */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-50 animate-[slideUp_0.3s_ease-out]">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#111827] text-white shadow-xl" style={{ borderRadius: '12px' }}>
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" strokeWidth={2} />
            <span className="text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ApplicantOpportunitiesPanel(
  props: Pick<
    OpportunitiesPageProps,
    | 'selectedOpportunityId'
    | 'selectedOpportunityEngagementId'
    | 'candidateProfileId'
    | 'onEngagementsCountChange'
    | 'opportunitiesRefreshKey'
  >,
) {
  return <OpportunitiesPage mode="opportunities" {...props} />;
}

export function ApplicantExploreIndustriesPanel(
  props: Pick<
    OpportunitiesPageProps,
    'candidateProfileId' | 'traitScores' | 'onExploreIndustriesCountChange' | 'userId'
  >,
) {
  return <OpportunitiesPage mode="explore" {...props} />;
}
