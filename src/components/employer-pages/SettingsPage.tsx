import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, Lock, CreditCard, Building2, Users, Upload, Sliders } from 'lucide-react';
import type { EmployerBusiness } from '../../lib/employerPersistence';
import { updateEmployerBusiness } from '../../lib/employerPersistence';
import { supabase } from '../../lib/supabaseClient';
import { pathForEmployerOnboardingDbStep } from '../../lib/employerOnboardingRouting';
import { createEmployerRole, assessmentLinkUrl, fetchOpenRoles } from '../../lib/employerRoles';

export function SettingsPage({
  business,
  userId,
  onSaved,
}: {
  business: EmployerBusiness | null;
  userId: string | null;
  onSaved?: () => void;
  onEditWeightings?: () => void;
}) {
  const navigate = useNavigate();
  const [name, setName] = useState(business?.name ?? '');
  const [industry, setIndustry] = useState(business?.industry ?? '');
  const [size, setSize] = useState(business?.size ?? '51-200');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [roleTitle, setRoleTitle] = useState('');
  const [openRoles, setOpenRoles] = useState<Array<{ id: string; title: string; assessment_link_token: string | null }>>([]);
  const [newRoleLink, setNewRoleLink] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !business?.id) return;
    void fetchOpenRoles(supabase, business.id).then(setOpenRoles);
  }, [business?.id]);

  const handleSave = async () => {
    if (!supabase || !business?.id) return;
    setSaving(true);
    try {
      await updateEmployerBusiness(supabase, business.id, {
        name: name.trim(),
        industry: industry.trim(),
        size: size as EmployerBusiness['size'],
      });
      setSaved(true);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  const handleCreateRole = async () => {
    if (!supabase || !business?.id || !roleTitle.trim()) return;
    const role = await createEmployerRole(supabase, business.id, { title: roleTitle.trim() });
    setNewRoleLink(assessmentLinkUrl(role.assessment_link_token));
    setRoleTitle('');
    const roles = await fetchOpenRoles(supabase, business.id);
    setOpenRoles(roles);
  };

  const handleResetOnboarding = async () => {
    if (supabase && userId) {
      const { setEmployerOnboardingStep } = await import('../../lib/employerOnboardingPersistence');
      await setEmployerOnboardingStep(supabase, userId, 'employer_company');
    }
    try {
      localStorage.removeItem('cme_employer_onboarding_complete');
    } catch {
      /* ignore */
    }
    navigate(pathForEmployerOnboardingDbStep('employer_company'));
  };

  const teamMembers = [
    { id: 1, name: 'Sarah Johnson', email: 'sarah@techcorp.com', role: 'Admin', avatar: 'SJ' },
    { id: 2, name: 'Michael Chen', email: 'michael@techcorp.com', role: 'Recruiter', avatar: 'MC' },
    { id: 3, name: 'Emily Davis', email: 'emily@techcorp.com', role: 'Hiring Manager', avatar: 'ED' },
    { id: 4, name: 'James Wilson', email: 'james@techcorp.com', role: 'Recruiter', avatar: 'JW' },
  ];

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl text-[#111827] font-semibold mb-1">Settings</h1>
        <p className="text-sm text-[#6B7280]">Manage your account and preferences</p>
      </div>

      {/* Company Information Section */}
      <div className="bg-white p-6 border border-black/[0.08] shadow-sm mb-6" style={{ borderRadius: '20px' }}>
        <div className="flex items-center gap-3 mb-6">
          <Building2 className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
          <h3 className="text-base text-[#111827] font-semibold">Company Information</h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Company Logo */}
          <div>
            <label className="block text-sm text-[#6B7280] mb-3">Company Logo</label>
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 bg-[#7DBBFF] flex items-center justify-center shrink-0"
                style={{ borderRadius: '16px' }}
              >
                <Building2 className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] transition-colors text-sm font-medium" style={{ borderRadius: '10px' }}>
                <Upload className="w-4 h-4" strokeWidth={2} />
                Upload Logo
              </button>
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm text-[#6B7280] mb-3">Company Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-[#F9F9FA] border border-black/[0.08] text-sm text-[#111827] focus:outline-none focus:border-[#7DBBFF]"
              style={{ borderRadius: '10px' }}
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm text-[#6B7280] mb-3">Industry</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full px-4 py-2 bg-[#F9F9FA] border border-black/[0.08] text-sm text-[#111827] focus:outline-none focus:border-[#7DBBFF]"
              style={{ borderRadius: '10px' }}
            />
          </div>

          {/* Company Size */}
          <div>
            <label className="block text-sm text-[#6B7280] mb-3">Company Size</label>
            <select
              value={size ?? '51-200'}
              onChange={(e) => setSize(e.target.value)}
              className="w-full px-4 py-2 bg-[#F9F9FA] border border-black/[0.08] text-sm text-[#111827] focus:outline-none focus:border-[#7DBBFF]"
              style={{ borderRadius: '10px' }}
            >
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm text-[#6B7280] mb-3">Website</label>
            <input
              type="url"
              defaultValue="https://techcorp.com"
              className="w-full px-4 py-2 bg-[#F9F9FA] border border-black/[0.08] text-sm text-[#111827] focus:outline-none focus:border-[#7DBBFF]"
              style={{ borderRadius: '10px' }}
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm text-[#6B7280] mb-3">Headquarters Location</label>
            <input
              type="text"
              defaultValue="San Francisco, CA"
              className="w-full px-4 py-2 bg-[#F9F9FA] border border-black/[0.08] text-sm text-[#111827] focus:outline-none focus:border-[#7DBBFF]"
              style={{ borderRadius: '10px' }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-black/[0.08]">
          <button className="px-4 py-2 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] transition-colors text-sm font-medium" style={{ borderRadius: '10px' }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-4 py-2 bg-[#7DBBFF] text-white hover:bg-[#6aabef] transition-colors text-sm font-medium disabled:opacity-60"
            style={{ borderRadius: '10px' }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved ? <span className="self-center text-xs text-[#10B981]">Saved</span> : null}
        </div>
      </div>

      {/* Open roles & assessment links */}
      <div className="bg-white p-6 border border-black/[0.08] shadow-sm mb-6" style={{ borderRadius: '20px' }}>
        <h3 className="text-base text-[#111827] font-semibold mb-4">Open roles & assessment links</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="Role title (e.g. Product Designer)"
            className="flex-1 rounded-lg border border-black/[0.08] px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => void handleCreateRole()}
            className="rounded-lg bg-[#7DBBFF] px-4 py-2 text-sm font-medium text-white"
          >
            Create role
          </button>
        </div>
        {newRoleLink ? (
          <p className="mb-3 text-xs text-[#6B7280]">
            Assessment link:{' '}
            <a href={newRoleLink} className="text-[#7DBBFF] underline">
              {newRoleLink}
            </a>
          </p>
        ) : null}
        <ul className="space-y-2">
          {openRoles.map((r) => (
            <li key={r.id} className="flex items-center justify-between text-sm">
              <span>{r.title}</span>
              {r.assessment_link_token ? (
                <a
                  href={assessmentLinkUrl(r.assessment_link_token)}
                  className="text-xs text-[#7DBBFF]"
                >
                  Copy link
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      {/* Team & Permissions Section */}
      <div className="bg-white p-6 border border-black/[0.08] shadow-sm mb-6" style={{ borderRadius: '20px' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            <h3 className="text-base text-[#111827] font-semibold">Team Members & Permissions</h3>
          </div>
          <button className="px-4 py-2 bg-[#7DBBFF] text-white hover:bg-[#6aabef] transition-colors text-sm font-medium" style={{ borderRadius: '10px' }}>
            + Invite Member
          </button>
        </div>

        <div className="space-y-3">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-[#F9F9FA] hover:bg-[#F3F3F5] transition-colors"
              style={{ borderRadius: '12px' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#7DBBFF] flex items-center justify-center text-white text-sm font-semibold">
                  {member.avatar}
                </div>
                <div>
                  <p className="text-sm text-[#111827] font-medium">{member.name}</p>
                  <p className="text-xs text-[#6B7280]">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  defaultValue={member.role}
                  className="px-3 py-1.5 bg-white border border-black/[0.08] text-sm text-[#111827] focus:outline-none focus:border-[#7DBBFF]"
                  style={{ borderRadius: '8px' }}
                >
                  <option value="Admin">Admin</option>
                  <option value="Recruiter">Recruiter</option>
                  <option value="Hiring Manager">Hiring Manager</option>
                  <option value="Viewer">Viewer</option>
                </select>
                <button className="text-sm text-[#EF4444] hover:text-[#DC2626] transition-colors">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-[#7DBBFF]/5 border border-[#7DBBFF]/20" style={{ borderRadius: '12px' }}>
          <p className="text-xs text-[#6B7280]">
            <span className="font-semibold text-[#111827]">Permission Levels:</span>
            <br />
            <span className="font-medium">Admin</span> - Full access to all features
            <br />
            <span className="font-medium">Recruiter</span> - Manage candidates and view analytics
            <br />
            <span className="font-medium">Hiring Manager</span> - View and comment on candidates
            <br />
            <span className="font-medium">Viewer</span> - Read-only access
          </p>
        </div>
      </div>

      {/* Other Settings Grid */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            </div>
            <h3 className="text-base text-[#111827] font-semibold">Notifications</h3>
          </div>
          <p className="text-sm text-[#6B7280] mb-4">Configure email and in-app notifications</p>
          <button className="text-sm text-[#7DBBFF] hover:text-[#6aabef] transition-colors font-medium">
            Manage Notifications
          </button>
        </div>

        <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            </div>
            <h3 className="text-base text-[#111827] font-semibold">Security</h3>
          </div>
          <p className="text-sm text-[#6B7280] mb-4">Manage password and two-factor authentication</p>
          <button className="text-sm text-[#7DBBFF] hover:text-[#6aabef] transition-colors font-medium">
            Security Settings
          </button>
        </div>

        <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            </div>
            <h3 className="text-base text-[#111827] font-semibold">Billing</h3>
          </div>
          <p className="text-sm text-[#6B7280] mb-4">View invoices and update payment methods</p>
          <button className="text-sm text-[#7DBBFF] hover:text-[#6aabef] transition-colors font-medium">
            Billing Details
          </button>
        </div>

        <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
              <User className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            </div>
            <h3 className="text-base text-[#111827] font-semibold">Profile</h3>
          </div>
          <p className="text-sm text-[#6B7280] mb-4">Update your personal information</p>
          <button className="text-sm text-[#7DBBFF] hover:text-[#6aabef] transition-colors font-medium">
            Edit Profile
          </button>
        </div>

        <div className="bg-white p-6 border border-black/[0.08] shadow-sm" style={{ borderRadius: '20px' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
            </div>
            <h3 className="text-base text-[#111827] font-semibold">Trait Weighting</h3>
          </div>
          <p className="text-sm text-[#6B7280] mb-4">Adjust the importance of different traits in the hiring process</p>
          <button type="button" className="text-sm text-[#7DBBFF] hover:text-[#6aabef] transition-colors font-medium">
            Configure Trait Weighting
          </button>
        </div>
      </div>

      {/* Developer Tools - Reset Onboarding */}
      <div className="mt-6 p-4 bg-[#F59E0B]/5 border border-[#F59E0B]/20" style={{ borderRadius: '12px' }}>
        <p className="text-xs text-[#6B7280] mb-3">
          <span className="font-semibold text-[#111827]">Developer Tools:</span> Testing & Demo
        </p>
        <button
          type="button"
          onClick={() => void handleResetOnboarding()}
          className="text-xs text-[#F59E0B] hover:text-[#D97706] transition-colors font-medium"
        >
          Reset Onboarding
        </button>
      </div>
    </div>
  );
}