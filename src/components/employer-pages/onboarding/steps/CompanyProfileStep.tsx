import { Building2 } from 'lucide-react';
import { useState } from 'react';

export interface CompanyProfile {
  companyName: string;
  industry: string;
  companySize: string;
}

interface CompanyProfileStepProps {
  initialData?: CompanyProfile;
  onNext: (data: CompanyProfile) => void;
}

export function CompanyProfileStep({ initialData, onNext }: CompanyProfileStepProps) {
  const [formData, setFormData] = useState<CompanyProfile>(
    initialData || {
      companyName: '',
      industry: '',
      companySize: '',
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid()) {
      onNext(formData);
    }
  };

  const isValid = () => {
    return (
      formData.companyName.trim() !== '' &&
      formData.industry.trim() !== '' &&
      formData.companySize !== ''
    );
  };

  return (
    <div>
      <div className="mb-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#7DBBFF]/10 flex items-center justify-center">
          <Building2 className="w-8 h-8 text-[#7DBBFF]" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl text-[#111827] font-semibold mb-2">Company Profile</h2>
        <p className="text-sm text-[#6B7280]">
          Tell us about your company to personalize your experience
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
        {/* Company Name */}
        <div>
          <label className="block text-sm text-[#111827] font-medium mb-2">
            Company Name <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            placeholder="Enter your company name"
            className="w-full px-4 py-3 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7DBBFF] transition-colors"
            style={{ borderRadius: '10px' }}
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm text-[#111827] font-medium mb-2">
            Industry <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="text"
            value={formData.industry}
            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
            placeholder="e.g., Technology, Healthcare, Finance"
            className="w-full px-4 py-3 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7DBBFF] transition-colors"
            style={{ borderRadius: '10px' }}
          />
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-sm text-[#111827] font-medium mb-2">
            Company Size <span className="text-[#EF4444]">*</span>
          </label>
          <select
            value={formData.companySize}
            onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
            className="w-full px-4 py-3 bg-white border border-black/[0.08] text-sm text-[#111827] focus:outline-none focus:border-[#7DBBFF] transition-colors"
            style={{ borderRadius: '10px' }}
          >
            <option value="">Select company size</option>
            <option value="1-10">1-10 employees</option>
            <option value="11-50">11-50 employees</option>
            <option value="51-200">51-200 employees</option>
            <option value="201-1000">201-1000 employees</option>
            <option value="1000+">1000+ employees</option>
          </select>
        </div>

        {/* Continue Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={!isValid()}
            className={`w-full px-6 py-3 text-white text-sm font-medium transition-colors ${
              isValid()
                ? 'bg-[#7DBBFF] hover:bg-[#6aabef] cursor-pointer'
                : 'bg-[#D1D5DB] cursor-not-allowed opacity-60'
            }`}
            style={{ borderRadius: '10px' }}
          >
            Continue to Role Selection
          </button>
        </div>
      </form>
    </div>
  );
}
