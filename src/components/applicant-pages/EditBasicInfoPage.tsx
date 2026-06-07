import { useState, useEffect, useRef } from 'react';
import { Check, Camera } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import {
  ensureApplicantProfile,
  updateApplicantBasicInfo,
  insertCandidateActivityEvent,
  uploadApplicantAvatar,
} from '../../lib/applicantPersistence';

const GENDER_OPTIONS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];

const CURRENT_SITUATION_OPTIONS = [
  'Employed full-time',
  'Employed part-time',
  'Between roles',
  'Freelancing',
  'Studying',
  'Other',
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-[#6B7280] mb-1.5">{children}</p>;
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
  readOnly = false,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full px-3 py-2.5 border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7dbbff] ${
        readOnly ? 'bg-[#F9FAFB] text-[#6B7280] cursor-not-allowed' : 'bg-white'
      }`}
      style={{ borderRadius: '10px' }}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2.5 bg-white border border-black/[0.08] text-sm text-[#111827] focus:outline-none focus:border-[#7dbbff] appearance-none"
      style={{ borderRadius: '10px' }}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function parseOptionalInt(raw: string): { value: number | null; invalid: boolean } {
  const t = raw.trim();
  if (t === '') return { value: null, invalid: false };
  const n = Number(t);
  if (!Number.isFinite(n)) return { value: null, invalid: true };
  return { value: Math.round(n), invalid: false };
}

function PreferenceToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/[0.07] py-3 last:border-b-0">
      <span className="text-[13px] text-[#374151]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-[#7dbbff]' : 'bg-[#E5E7EB]'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'left-5' : 'left-0.5'}`}
        />
      </button>
    </div>
  );
}

export function EditBasicInfoPage({
  onSaved,
  showPreferencesSection = false,
  initialUserId = null,
  initialApplicantProfileId = null,
}: {
  onSaved?: () => void;
  /** When true (Settings page), show notification / visibility preferences and persist to Supabase. */
  showPreferencesSection?: boolean;
  /** Parent ApplicantScreen already knows these IDs; use them to avoid a fragile duplicate lookup. */
  initialUserId?: string | null;
  initialApplicantProfileId?: string | null;
} = {}) {
  const [applicantProfileId, setApplicantProfileId] = useState<string | null>(initialApplicantProfileId);
  const [userId, setUserId] = useState<string | null>(initialUserId);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Photo (stored URL on profiles.avatar_url; pending file uploaded on Save)
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  // Personal details
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');

  // Location
  const [location, setLocation] = useState('');

  // Professional
  const [jobTitle, setJobTitle] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentSituation, setCurrentSituation] = useState('');
  const [experienceYears, setExperienceYears] = useState('');

  // About
  const [bio, setBio] = useState('');

  // Education & certifications
  const [educationSummary, setEducationSummary] = useState('');
  const [certifications, setCertifications] = useState('');

  // Contact
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');

  const [notifyEmailMatches, setNotifyEmailMatches] = useState(true);
  const [notifyWeeklyDigest, setNotifyWeeklyDigest] = useState(false);
  const [profileVisibleEmployers, setProfileVisibleEmployers] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    const client = supabase;
    void client.auth.getSession().then(async ({ data: { session } }) => {
      const uid = initialUserId ?? session?.user?.id ?? null;
      if (!uid) {
        setLoading(false);
        return;
      }
      setUserId(uid);

      // Load from profiles table (name, email)
      const { data: profileRow } = await client
        .from('profiles')
        .select('full_name,email,avatar_url,notify_email_matches,notify_weekly_digest')
        .eq('id', uid)
        .maybeSingle();

      if (profileRow) {
        setFullName(profileRow.full_name ?? '');
        setEmail(profileRow.email ?? '');
        setAvatarUrl(typeof profileRow.avatar_url === 'string' ? profileRow.avatar_url : null);
        const row = profileRow as {
          notify_email_matches?: boolean | null;
          notify_weekly_digest?: boolean | null;
        };
        if (typeof row.notify_email_matches === 'boolean') {
          setNotifyEmailMatches(row.notify_email_matches);
        }
        if (typeof row.notify_weekly_digest === 'boolean') {
          setNotifyWeeklyDigest(row.notify_weekly_digest);
        }
      }

      // Load from candidate_profiles
      let profileId: string | null = null;
      try {
        profileId = initialApplicantProfileId ?? await ensureApplicantProfile(client, uid, { throwOnError: true });
      } catch (error) {
        setSaveError(`Could not load your profile: ${error instanceof Error ? error.message : String(error)}`);
        setLoading(false);
        return;
      }
      setApplicantProfileId(profileId);

      if (profileId) {
        const { data } = await client
          .from('candidate_profiles')
          .select(
            'location,experience_years,current_situation,education_summary,experience_narrative,age,job_title,current_company,phone,linkedin_url,gender,certifications,published,status',
          )
          .eq('id', profileId)
          .maybeSingle();

        if (data) {
          setLocation(data.location ?? '');
          setExperienceYears(data.experience_years != null ? String(data.experience_years) : '');
          setCurrentSituation(data.current_situation ?? '');
          setEducationSummary(data.education_summary ?? '');
          setBio(data.experience_narrative ?? '');
          setAge(data.age != null ? String(data.age) : '');
          setJobTitle(data.job_title ?? '');
          setCurrentCompany(data.current_company ?? '');
          setPhone(data.phone ?? '');
          setLinkedin(data.linkedin_url ?? '');
          setGender(data.gender ?? '');
          setCertifications(data.certifications ?? '');
          setProfileVisibleEmployers(data.status !== 'hidden');
        }
      }

      setLoading(false);
    });
  }, [initialUserId, initialApplicantProfileId]);

  useEffect(() => {
    if (!pendingPhotoFile) {
      setLocalPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingPhotoFile);
    setLocalPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingPhotoFile]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaveError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setSaveError('Please choose a JPG or PNG image.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Photo must be 5MB or smaller.');
      e.target.value = '';
      return;
    }
    setPendingPhotoFile(file);
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaving(true);
    try {
      if (!isSupabaseConfigured || !supabase || !userId) {
        setSaveError('Sign in to save changes.');
        return;
      }
      const client = supabase;

      let profileId = applicantProfileId;
      if (!profileId) {
        try {
          profileId = await ensureApplicantProfile(client, userId, { throwOnError: true });
        } catch (error) {
          setSaveError(`Could not load your profile: ${error instanceof Error ? error.message : String(error)}`);
          return;
        }
        setApplicantProfileId(profileId);
      }
      if (!profileId) {
        setSaveError('Could not load your profile. Try again in a moment.');
        return;
      }

      const ageParsed = parseOptionalInt(age);
      const expParsed = parseOptionalInt(experienceYears);
      if (ageParsed.invalid || expParsed.invalid) {
        setSaveError('Age and years of experience must be valid numbers (or left blank).');
        return;
      }

      let newAvatarUrl: string | null | undefined;
      if (pendingPhotoFile) {
        const { publicUrl, error: avErr } = await uploadApplicantAvatar(client, userId, pendingPhotoFile);
        if (avErr || !publicUrl) {
          setSaveError(
            avErr?.message?.includes('Bucket not found') || avErr?.message?.includes('not found')
              ? 'Photo storage is not set up yet. Ask your admin to run the avatars storage migration.'
              : avErr?.message ?? 'Could not upload photo.',
          );
          return;
        }
        newAvatarUrl = publicUrl;
      }

      const profilePayload: Record<string, unknown> = {
        full_name: fullName.trim() || null,
        ...(newAvatarUrl != null ? { avatar_url: newAvatarUrl } : {}),
      };
      if (showPreferencesSection) {
        profilePayload.notify_email_matches = notifyEmailMatches;
        profilePayload.notify_weekly_digest = notifyWeeklyDigest;
      }

      const { error: profileErr } = await client.from('profiles').update(profilePayload).eq('id', userId);

      if (profileErr) {
        setSaveError(profileErr.message);
        return;
      }

      if (newAvatarUrl != null) {
        setAvatarUrl(newAvatarUrl);
        setPendingPhotoFile(null);
        if (photoInputRef.current) photoInputRef.current.value = '';
      }

      const { error: candErr } = await updateApplicantBasicInfo(client, profileId, {
        age: ageParsed.value,
        job_title: jobTitle.trim() || null,
        current_company: currentCompany.trim() || null,
        phone: phone.trim() || null,
        linkedin_url: linkedin.trim() || null,
        gender: gender.trim() || null,
        certifications: certifications.trim() || null,
        location: location.trim() || null,
        experience_years: expParsed.value,
        current_situation: currentSituation.trim() || null,
        education_summary: educationSummary.trim() || null,
        experience_narrative: bio.trim() || null,
        ...(showPreferencesSection
          ? {
              published: profileVisibleEmployers,
              status: profileVisibleEmployers ? ('published' as const) : ('hidden' as const),
            }
          : {}),
      });

      if (candErr) {
        setSaveError(
          candErr.message.includes('column')
            ? 'Your database may need the latest migration (contact support).'
            : candErr.message,
        );
        return;
      }

      await insertCandidateActivityEvent(client, userId, 'profile', 'Profile details updated');
      onSaved?.();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-[#6B7280]">Loading...</p>
      </div>
    );
  }

  const SaveButton = ({ bottom = false }: { bottom?: boolean }) => (
    <button
      type="button"
      onClick={() => void handleSave()}
      disabled={saving}
      className={`flex items-center gap-2 text-sm font-medium text-white bg-[#7dbbff] hover:bg-[#5aaeff] disabled:opacity-60 transition-colors ${bottom ? 'px-5 py-2.5' : 'px-4 py-2'}`}
      style={{ borderRadius: '10px' }}
    >
      {saved ? (
        <>
          <Check className="w-4 h-4" />
          Saved
        </>
      ) : saving ? (
        'Saving...'
      ) : (
        'Save changes'
      )}
    </button>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6 font-dashboard text-[#111827] antialiased">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          {showPreferencesSection ? (
            <h2 className="text-xl font-semibold text-[#111827]">Basic Information</h2>
          ) : (
            <h1 className="text-2xl font-semibold text-[#111827]">Basic Information</h1>
          )}
          <p className="mt-1 text-sm text-[#6B7280]">
            Keep your details up to date so employers see the right fit.
          </p>
          {saveError ? (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {saveError}
            </p>
          ) : null}
        </div>
        <SaveButton />
      </div>

      {/* Section: Profile Photo */}
      <div className="bg-white border border-black/[0.08] p-6" style={{ borderRadius: '20px' }}>
        <h2 className="text-sm font-semibold text-[#111827] mb-4">Profile Photo</h2>
        <div className="flex items-center gap-5">
          <div
            className="w-20 h-20 rounded-full bg-[#7dbbff]/10 border-2 border-[#7dbbff]/20 flex items-center justify-center overflow-hidden shrink-0"
          >
            {localPreviewUrl || avatarUrl ? (
              <img
                src={localPreviewUrl ?? avatarUrl ?? ''}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="w-7 h-7 text-[#7dbbff]" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="px-4 py-2 text-sm font-medium text-[#111827] border border-black/[0.08] bg-white hover:bg-[#F9FAFB] transition-colors"
              style={{ borderRadius: '10px' }}
            >
              Upload photo
            </button>
            <p className="mt-1.5 text-xs text-[#9CA3AF]">JPG or PNG, max 5MB</p>
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      </div>

      {/* Section: Personal Details */}
      <div className="bg-white border border-black/[0.08] p-6 space-y-5" style={{ borderRadius: '20px' }}>
        <h2 className="text-sm font-semibold text-[#111827]">Personal Details</h2>

        <div>
          <FieldLabel>Full name</FieldLabel>
          <TextInput value={fullName} onChange={setFullName} placeholder="e.g. Alex Rivera" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Age</FieldLabel>
            <TextInput
              type="number"
              value={age}
              onChange={setAge}
              placeholder="e.g. 29"
            />
          </div>
          <div>
            <FieldLabel>Gender</FieldLabel>
            <SelectInput
              value={gender}
              onChange={setGender}
              options={GENDER_OPTIONS}
              placeholder="Select..."
            />
          </div>
        </div>
      </div>

      {/* Section: Location */}
      <div className="bg-white border border-black/[0.08] p-6 space-y-5" style={{ borderRadius: '20px' }}>
        <h2 className="text-sm font-semibold text-[#111827]">Location</h2>

        <div>
          <FieldLabel>City / Region</FieldLabel>
          <TextInput value={location} onChange={setLocation} placeholder="e.g. Sydney, NSW" />
        </div>
      </div>

      {/* Section: Professional Details */}
      <div className="bg-white border border-black/[0.08] p-6 space-y-5" style={{ borderRadius: '20px' }}>
        <h2 className="text-sm font-semibold text-[#111827]">Professional Details</h2>

        <div>
          <FieldLabel>Job title</FieldLabel>
          <TextInput value={jobTitle} onChange={setJobTitle} placeholder="e.g. Product Designer" />
        </div>

        <div>
          <FieldLabel>Current company</FieldLabel>
          <TextInput value={currentCompany} onChange={setCurrentCompany} placeholder="e.g. TechCorp Inc." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <FieldLabel>Current situation</FieldLabel>
            <SelectInput
              value={currentSituation}
              onChange={setCurrentSituation}
              options={CURRENT_SITUATION_OPTIONS}
              placeholder="Select..."
            />
          </div>
          <div>
            <FieldLabel>Years of experience</FieldLabel>
            <TextInput
              type="number"
              value={experienceYears}
              onChange={setExperienceYears}
              placeholder="e.g. 6"
            />
          </div>
        </div>
      </div>

      {/* Section: About */}
      <div className="bg-white border border-black/[0.08] p-6 space-y-5" style={{ borderRadius: '20px' }}>
        <h2 className="text-sm font-semibold text-[#111827]">About</h2>

        <div>
          <FieldLabel>Bio / Background summary</FieldLabel>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short summary of your background, strengths, and what you're looking for..."
            rows={4}
            className="w-full px-3 py-2.5 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7dbbff] resize-none"
            style={{ borderRadius: '10px' }}
          />
          <p className="mt-1 text-xs text-[#9CA3AF]">{bio.trim().split(/\s+/).filter(Boolean).length} words</p>
        </div>
      </div>

      {/* Section: Education & Certifications */}
      <div className="bg-white border border-black/[0.08] p-6 space-y-5" style={{ borderRadius: '20px' }}>
        <h2 className="text-sm font-semibold text-[#111827]">Education & Certifications</h2>

        <div>
          <FieldLabel>Education</FieldLabel>
          <TextInput
            value={educationSummary}
            onChange={setEducationSummary}
            placeholder="e.g. B.A. Interaction Design, UNSW"
          />
        </div>

        <div>
          <FieldLabel>Certifications</FieldLabel>
          <textarea
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
            placeholder="List any relevant certifications, e.g. AWS Certified, PMP, Google Analytics..."
            rows={3}
            className="w-full px-3 py-2.5 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7dbbff] resize-none"
            style={{ borderRadius: '10px' }}
          />
        </div>
      </div>

      {/* Section: Contact Details */}
      <div className="bg-white border border-black/[0.08] p-6 space-y-5" style={{ borderRadius: '20px' }}>
        <h2 className="text-sm font-semibold text-[#111827]">Contact Details</h2>

        <div>
          <FieldLabel>Email address</FieldLabel>
          <TextInput value={email} readOnly placeholder="your@email.com" />
          <p className="mt-1 text-xs text-[#9CA3AF]">Managed via your account settings</p>
        </div>

        <div>
          <FieldLabel>Phone number</FieldLabel>
          <TextInput value={phone} onChange={setPhone} placeholder="e.g. +61 400 000 000" type="tel" />
        </div>

        <div>
          <FieldLabel>LinkedIn</FieldLabel>
          <TextInput
            value={linkedin}
            onChange={setLinkedin}
            placeholder="linkedin.com/in/yourprofile"
          />
        </div>
      </div>

      {showPreferencesSection ? (
        <div>
          <div className="mb-5 flex items-center gap-3.5" style={{ marginTop: 8 }}>
            <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">
              Preferences
            </span>
            <div className="h-px flex-1 bg-black/[0.08]" />
          </div>
          <div className="max-w-xl rounded-[20px] border border-black/[0.08] bg-white px-5 py-1">
            <PreferenceToggle
              label="Email notifications for new matches"
              checked={notifyEmailMatches}
              onChange={setNotifyEmailMatches}
            />
            <PreferenceToggle
              label="Profile visible to employers"
              checked={profileVisibleEmployers}
              onChange={setProfileVisibleEmployers}
            />
            <PreferenceToggle
              label="Weekly digest summary"
              checked={notifyWeeklyDigest}
              onChange={setNotifyWeeklyDigest}
            />
          </div>
        </div>
      ) : null}

      {/* Bottom save */}
      <div className="flex justify-end pb-8">
        <SaveButton bottom />
      </div>
    </div>
  );
}
