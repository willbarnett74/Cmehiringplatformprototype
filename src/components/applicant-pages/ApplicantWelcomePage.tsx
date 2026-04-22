import { useState, useEffect } from 'react';
import { Compass, ArrowRight, MapPin, Briefcase, User, Calendar, ChevronLeft, X } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { saveBaseDetails } from '../../lib/applicantPersistence';

interface ApplicantWelcomePageProps {
  userId: string;
  profileId: string;
  onComplete: () => void;
  /** When true, renders as a modal overlay and skips the welcome screen */
  editMode?: boolean;
}

const AVAILABILITY_OPTIONS = [
  { value: 'open', label: 'Open to roles' },
  { value: 'selective', label: 'Open but selective' },
  { value: 'contract', label: 'Open to contract / freelance' },
  { value: 'not_looking', label: 'Not looking right now' },
];

export function ApplicantWelcomePage({ userId, profileId, onComplete, editMode = false }: ApplicantWelcomePageProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [age, setAge] = useState('');
  const [availability, setAvailability] = useState('');
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<'welcome' | 'details'>(editMode ? 'details' : 'welcome');

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Always fetch name from profiles
    void supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.full_name) setName(data.full_name as string);
      });

    // In edit mode, pre-fill existing profile data
    if (editMode) {
      void supabase
        .from('candidate_profiles')
        .select('location, current_situation, age, availability')
        .eq('id', profileId)
        .maybeSingle()
        .then(({ data }) => {
          if (!data) return;
          if (data.location) setLocation(data.location as string);
          if (data.current_situation) setCurrentRole(data.current_situation as string);
          if (data.age != null) setAge(String(data.age));
          if (data.availability) setAvailability(data.availability as string);
        });
    }
  }, [userId, profileId, editMode]);

  const firstName = name.split(' ')[0] || '';

  const handleSubmit = async () => {
    setSaving(true);
    if (isSupabaseConfigured && supabase) {
      await saveBaseDetails(supabase, userId, profileId, {
        full_name: name.trim() || null,
        location: location.trim() || null,
        current_situation: currentRole.trim() || null,
        age: age ? parseInt(age, 10) : null,
        availability: availability || null,
      });
    }
    // Only mark welcomed on first-time flow, not edit mode
    if (!editMode) {
      localStorage.setItem(`cme_welcomed_${userId}`, '1');
    }
    setSaving(false);
    onComplete();
  };

  // ─── Details form (shared between welcome flow and edit modal) ────────────

  const detailsForm = (
    <>
      <h2 className="text-2xl text-[#111827] font-semibold mb-2 tracking-tight">
        {editMode ? 'Update your details' : 'A few basics'}
      </h2>
      <p className="text-sm text-[#6B7280] mb-8 leading-relaxed">
        {editMode
          ? 'Changes save immediately and update your profile across CMe.'
          : "This fills in your profile so it's not empty when you arrive. You can update any of this later in Settings."}
      </p>

      <div className="space-y-4 mb-8">
        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Full name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" strokeWidth={2} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full pl-10 pr-4 py-3 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7dbbff] transition-colors"
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" strokeWidth={2} />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Auckland, NZ"
              className="w-full pl-10 pr-4 py-3 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7dbbff] transition-colors"
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* Current role */}
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1.5">
            Current role{' '}
            <span className="text-[#9CA3AF] font-normal">(or what you're studying / looking for)</span>
          </label>
          <div className="relative">
            <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" strokeWidth={2} />
            <input
              type="text"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value)}
              placeholder="e.g. Junior Developer, Marketing Graduate"
              className="w-full pl-10 pr-4 py-3 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7dbbff] transition-colors"
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* Age */}
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Age</label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" strokeWidth={2} />
            <input
              type="number"
              min="16"
              max="100"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 24"
              className="w-full pl-10 pr-4 py-3 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7dbbff] transition-colors"
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Availability</label>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABILITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAvailability(opt.value)}
                className={`px-4 py-2.5 text-sm text-left border transition-all ${
                  availability === opt.value
                    ? 'bg-[#7dbbff]/10 border-[#7dbbff] text-[#7dbbff] font-medium'
                    : 'bg-white border-black/[0.08] text-[#6B7280] hover:border-[#7dbbff]/40'
                }`}
                style={{ borderRadius: '10px' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => void handleSubmit()}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#7dbbff] text-white hover:bg-[#6aabef] transition-colors font-medium text-sm disabled:opacity-60"
        style={{ borderRadius: '12px' }}
      >
        {saving ? (
          <span>Saving...</span>
        ) : editMode ? (
          <span>Save changes</span>
        ) : (
          <>
            <span>Take me to my dashboard</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </>
        )}
      </button>

      {!editMode && (
        <button
          onClick={() => setStep('welcome')}
          className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs text-[#9CA3AF] hover:text-[#6B7280] transition-colors py-2"
        >
          <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
          Back
        </button>
      )}
    </>
  );

  // ─── Edit mode: modal overlay ─────────────────────────────────────────────

  if (editMode) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-6">
        <div
          className="bg-white w-full max-w-[480px] max-h-[90vh] overflow-y-auto p-8 shadow-xl relative"
          style={{ borderRadius: '20px' }}
        >
          <button
            onClick={onComplete}
            className="absolute top-5 right-5 p-1.5 text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F9F9FA] transition-all"
            style={{ borderRadius: '8px' }}
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
          {detailsForm}
        </div>
      </div>
    );
  }

  // ─── First-login flow: full screen ────────────────────────────────────────

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
        <div className="w-full max-w-[480px]">
          <div className="flex items-center gap-3 mb-14">
            <div
              className="w-10 h-10 bg-[#7dbbff] flex items-center justify-center shrink-0"
              style={{ borderRadius: '12px' }}
            >
              <Compass className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <span className="text-lg text-[#111827] font-semibold">CMe</span>
          </div>

          <h1 className="text-[32px] text-[#111827] font-semibold mb-4 leading-tight tracking-tight">
            {firstName ? `Welcome, ${firstName}.` : 'Welcome.'}
          </h1>
          <p className="text-[15px] text-[#6B7280] mb-10 leading-relaxed">
            CMe matches you with roles based on{' '}
            <span className="text-[#111827] font-medium">who you are</span>, not just what's on
            your CV. You'll build a trait profile that helps employers understand how you work,
            think, and what drives you.
          </p>

          <div className="space-y-3 mb-10">
            {[
              {
                num: '01',
                title: 'Set up your basics',
                desc: "A few quick details so your profile isn't empty when you arrive.",
              },
              {
                num: '02',
                title: 'Build your trait profile',
                desc: '8 short sections covering how you work, think, and what motivates you.',
              },
              {
                num: '03',
                title: 'Get matched',
                desc: 'Employers find you based on trait fit — not keyword matching.',
              },
            ].map((item) => (
              <div
                key={item.num}
                className="flex items-start gap-4 p-4 bg-white border border-black/[0.06]"
                style={{ borderRadius: '14px' }}
              >
                <span className="text-xs font-semibold text-[#7dbbff] mt-0.5 w-6 shrink-0">
                  {item.num}
                </span>
                <div>
                  <p className="text-sm text-[#111827] font-medium">{item.title}</p>
                  <p className="text-xs text-[#6B7280] mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('details')}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#7dbbff] text-white hover:bg-[#6aabef] transition-colors font-medium text-sm"
            style={{ borderRadius: '12px' }}
          >
            <span>Get started</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="w-full max-w-[480px]">
        <div className="flex items-center gap-3 mb-14">
          <div
            className="w-10 h-10 bg-[#7dbbff] flex items-center justify-center shrink-0"
            style={{ borderRadius: '12px' }}
          >
            <Compass className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-lg text-[#111827] font-semibold">CMe</span>
        </div>
        {detailsForm}
      </div>
    </div>
  );
}
