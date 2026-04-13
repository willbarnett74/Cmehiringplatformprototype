import { useState, useEffect, useRef } from 'react';
import { Check, Camera } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import { ensureApplicantProfile, updateApplicantBasicInfo } from '../../lib/applicantPersistence';

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

export function EditBasicInfoPage() {
  const [applicantProfileId, setApplicantProfileId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Photo
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }
      const uid = session.user.id;
      setUserId(uid);

      // Load from profiles table (name, email)
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('full_name,email')
        .eq('id', uid)
        .maybeSingle();

      if (profileRow) {
        setFullName(profileRow.full_name ?? '');
        setEmail(profileRow.email ?? '');
      }

      // Load from candidate_profiles
      const profileId = await ensureApplicantProfile(supabase, uid);
      setApplicantProfileId(profileId);

      if (profileId) {
        const { data } = await supabase
          .from('candidate_profiles')
          .select('location,experience_years,current_situation,education_summary,experience_narrative')
          .eq('id', profileId)
          .maybeSingle();

        if (data) {
          setLocation(data.location ?? '');
          setExperienceYears(data.experience_years != null ? String(data.experience_years) : '');
          setCurrentSituation(data.current_situation ?? '');
          setEducationSummary(data.education_summary ?? '');
          setBio(data.experience_narrative ?? '');
        }
      }

      setLoading(false);
    });
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);

    // Update profiles.full_name
    if (supabase && userId && fullName) {
      await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', userId);
    }

    // Update candidate_profiles fields
    if (supabase && applicantProfileId) {
      await updateApplicantBasicInfo(supabase, applicantProfileId, {
        location: location || null,
        experience_years: experienceYears !== '' ? Number(experienceYears) : null,
        current_situation: currentSituation || null,
        education_summary: educationSummary || null,
        experience_narrative: bio || null,
      });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#111827]">Basic Information</h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Keep your details up to date so employers see the right fit.
          </p>
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
            {photoPreview ? (
              <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
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

      {/* Bottom save */}
      <div className="flex justify-end pb-8">
        <SaveButton bottom />
      </div>
    </div>
  );
}
