import { Building2, Briefcase, MapPin, MessageSquare, Eye, Star, Calendar, ArrowUpRight, Clock, ChevronDown, TrendingUp, Phone, Mail, Sparkles, X, Send, Download, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Company {
  id: number;
  name: string;
  logo?: string;
  role: string;
  location: string;
  status: 'Viewed' | 'Shortlisted' | 'Contacted' | 'Interview Scheduled';
  date: string;
  matchScore?: number;
  lastActivity?: string;
  nextStep?: string;
  interviewDetails?: {
    date: string;
    time: string;
    contactPerson: string;
    contactEmail: string;
  };
}

interface ModalState {
  type: 'interview' | 'followup' | 'message' | 'roledetails' | null;
  company: Company | null;
}

export function CompaniesPage() {
  const [activeTab, setActiveTab] = useState<'interested' | 'myInterests'>('interested');
  const [sortBy, setSortBy] = useState<'recent' | 'match' | 'status'>('recent');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [savedCompanies, setSavedCompanies] = useState<Set<number>>(new Set([1, 6]));
  const [modalState, setModalState] = useState<ModalState>({ type: null, company: null });
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Mock data for companies interested in the applicant
  const companiesInterested: Company[] = [
    {
      id: 1,
      name: 'TechFlow Inc.',
      role: 'Senior Product Designer',
      location: 'San Francisco, CA',
      status: 'Interview Scheduled',
      date: '2 days ago',
      matchScore: 94,
      lastActivity: 'Interview scheduled for Feb 15',
      nextStep: 'View Interview Details',
      interviewDetails: {
        date: 'February 15, 2026',
        time: '2:00 PM PST',
        contactPerson: 'Sarah Chen',
        contactEmail: 'sarah.chen@techflow.com',
      },
    },
    {
      id: 2,
      name: 'DesignHub',
      role: 'Lead UX Designer',
      location: 'New York, NY',
      status: 'Contacted',
      date: '5 days ago',
      matchScore: 89,
      lastActivity: 'Sent you a message',
      nextStep: 'Follow Up',
    },
    {
      id: 3,
      name: 'InnovateCo',
      role: 'Product Designer',
      location: 'Austin, TX',
      status: 'Shortlisted',
      date: '1 week ago',
      matchScore: 87,
      lastActivity: 'Added to shortlist',
      nextStep: 'Follow Up',
    },
    {
      id: 4,
      name: 'CreativeMinds',
      role: 'Senior Designer',
      location: 'Remote',
      status: 'Viewed',
      date: '1 week ago',
      matchScore: 85,
      lastActivity: 'Viewed your profile',
      nextStep: 'Send Message',
    },
    {
      id: 5,
      name: 'FutureTech',
      role: 'Design Lead',
      location: 'Seattle, WA',
      status: 'Shortlisted',
      date: '2 weeks ago',
      matchScore: 82,
      lastActivity: 'Added to shortlist',
      nextStep: 'Follow Up',
    },
  ];

  // Mock data for companies the applicant is interested in
  const myInterests: Company[] = [
    {
      id: 6,
      name: 'Notion',
      role: 'Product Designer',
      location: 'San Francisco, CA',
      status: 'Contacted',
      date: '3 days ago',
      matchScore: 96,
      lastActivity: 'You sent a message',
      nextStep: 'Follow Up',
    },
    {
      id: 7,
      name: 'Linear',
      role: 'Design Engineer',
      location: 'Remote',
      status: 'Viewed',
      date: '1 week ago',
      matchScore: 93,
      lastActivity: 'You viewed this role',
      nextStep: 'Apply Now',
    },
    {
      id: 8,
      name: 'Figma',
      role: 'Senior Product Designer',
      location: 'San Francisco, CA',
      status: 'Shortlisted',
      date: '1 week ago',
      matchScore: 91,
      lastActivity: 'Application in review',
      nextStep: 'Check Status',
    },
  ];

  const companies = activeTab === 'interested' ? companiesInterested : myInterests;

  // Calculate status counts
  const statusCounts = {
    viewed: companies.filter(c => c.status === 'Viewed').length,
    shortlisted: companies.filter(c => c.status === 'Shortlisted').length,
    contacted: companies.filter(c => c.status === 'Contacted').length,
    interviewed: companies.filter(c => c.status === 'Interview Scheduled').length,
  };

  // Filter companies based on status filter
  const filteredCompanies = statusFilter === 'all' 
    ? companies 
    : companies.filter(c => c.status.toLowerCase().replace(' ', '') === statusFilter.replace(' ', ''));

  const toggleSave = (companyId: number) => {
    setSavedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(companyId)) {
        newSet.delete(companyId);
      } else {
        newSet.add(companyId);
      }
      return newSet;
    });
  };

  const getStatusStyle = (status: Company['status']) => {
    switch (status) {
      case 'Interview Scheduled':
        return 'bg-gradient-to-r from-[#10B981]/10 to-[#059669]/10 text-[#10B981] border-[#10B981]/30';
      case 'Contacted':
        return 'bg-gradient-to-r from-[#7DBBFF]/10 to-[#3B82F6]/10 text-[#7DBBFF] border-[#7DBBFF]/30';
      case 'Shortlisted':
        return 'bg-gradient-to-r from-[#F59E0B]/10 to-[#D97706]/10 text-[#F59E0B] border-[#F59E0B]/30';
      case 'Viewed':
        return 'bg-gradient-to-r from-[#9CA3AF]/10 to-[#6B7280]/10 text-[#6B7280] border-[#9CA3AF]/30';
      default:
        return 'bg-[#F9F9FA] text-[#6B7280] border-black/[0.08]';
    }
  };

  const getStatusIcon = (status: Company['status']) => {
    switch (status) {
      case 'Interview Scheduled':
        return <Calendar className="w-3 h-3" strokeWidth={2} />;
      case 'Contacted':
        return <MessageSquare className="w-3 h-3" strokeWidth={2} />;
      case 'Shortlisted':
        return <Star className="w-3 h-3" strokeWidth={2} />;
      case 'Viewed':
        return <Eye className="w-3 h-3" strokeWidth={2} />;
      default:
        return null;
    }
  };

  const getNextStepStyle = (step: string) => {
    if (step.includes('Interview')) {
      return 'bg-[#10B981] hover:bg-[#059669] text-white';
    } else if (step.includes('Follow')) {
      return 'bg-[#7DBBFF] hover:bg-[#6aabef] text-white';
    } else {
      return 'border border-[#7DBBFF] text-[#7DBBFF] hover:bg-[#7DBBFF]/5';
    }
  };

  const openModal = (type: ModalState['type'], company: Company) => {
    setModalState({ type, company });
  };

  const closeModal = () => {
    setModalState({ type: null, company: null });
    setFollowUpMessage('');
    setChatMessage('');
  };

  const showToast = (message: string) => {
    setToast({ message, visible: true });
  };

  const handleAddToCalendar = () => {
    if (modalState.company) {
      showToast('Interview added to calendar!');
      closeModal();
    }
  };

  const handleReschedule = () => {
    if (modalState.company) {
      showToast('Reschedule request sent!');
      closeModal();
    }
  };

  const sendFollowUpMessage = () => {
    if (modalState.company && followUpMessage.trim()) {
      showToast(`Follow-up sent to ${modalState.company.name}!`);
      closeModal();
    }
  };

  const sendMessage = () => {
    if (modalState.company && chatMessage.trim()) {
      showToast(`Message sent to ${modalState.company.name}!`);
      closeModal();
    }
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalState.type) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modalState.type]);

  // Auto-hide toast
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast({ message: '', visible: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl text-[#111827] font-semibold mb-2">Companies & Opportunities</h1>
        <p className="text-sm text-[#6B7280]">Track your interactions and explore opportunities</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-[#F9F9FA] border border-black/[0.08] inline-flex" style={{ borderRadius: '12px' }}>
        <button
          onClick={() => setActiveTab('interested')}
          className={`px-6 py-2.5 text-sm font-medium transition-all ${
            activeTab === 'interested'
              ? 'bg-white text-[#111827] shadow-sm'
              : 'text-[#6B7280] hover:text-[#111827]'
          }`}
          style={{ borderRadius: '10px' }}
        >
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" strokeWidth={2} />
            <span>Interested in Me</span>
            <span className={`px-2 py-0.5 text-xs font-semibold ${
              activeTab === 'interested' ? 'bg-[#7DBBFF] text-white' : 'bg-[#E5E7EB] text-[#6B7280]'
            }`} style={{ borderRadius: '6px' }}>
              {companiesInterested.length}
            </span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('myInterests')}
          className={`px-6 py-2.5 text-sm font-medium transition-all ${
            activeTab === 'myInterests'
              ? 'bg-white text-[#111827] shadow-sm'
              : 'text-[#6B7280] hover:text-[#111827]'
          }`}
          style={{ borderRadius: '10px' }}
        >
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4" strokeWidth={2} />
            <span>My Interests</span>
            <span className={`px-2 py-0.5 text-xs font-semibold ${
              activeTab === 'myInterests' ? 'bg-[#7DBBFF] text-white' : 'bg-[#E5E7EB] text-[#6B7280]'
            }`} style={{ borderRadius: '6px' }}>
              {myInterests.length}
            </span>
          </div>
        </button>
      </div>

      {/* Summary Bar with Status Counts */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setStatusFilter('all')}
          className={`p-4 bg-white border transition-all ${
            statusFilter === 'all' 
              ? 'border-[#7DBBFF] shadow-sm ring-2 ring-[#7DBBFF]/20' 
              : 'border-black/[0.08] hover:border-[#7DBBFF]/50'
          }`}
          style={{ borderRadius: '12px' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#6B7280] font-medium uppercase">All Companies</span>
            <Sparkles className="w-4 h-4 text-[#7DBBFF]" strokeWidth={2} />
          </div>
          <p className="text-2xl text-[#111827] font-semibold">{companies.length}</p>
        </button>

        <button
          onClick={() => setStatusFilter('viewed')}
          className={`p-4 bg-white border transition-all ${
            statusFilter === 'viewed' 
              ? 'border-[#6B7280] shadow-sm ring-2 ring-[#6B7280]/20' 
              : 'border-black/[0.08] hover:border-[#6B7280]/50'
          }`}
          style={{ borderRadius: '12px' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#6B7280] font-medium uppercase">Viewed</span>
            <Eye className="w-4 h-4 text-[#6B7280]" strokeWidth={2} />
          </div>
          <p className="text-2xl text-[#111827] font-semibold">{statusCounts.viewed}</p>
        </button>

        <button
          onClick={() => setStatusFilter('shortlisted')}
          className={`p-4 bg-white border transition-all ${
            statusFilter === 'shortlisted' 
              ? 'border-[#F59E0B] shadow-sm ring-2 ring-[#F59E0B]/20' 
              : 'border-black/[0.08] hover:border-[#F59E0B]/50'
          }`}
          style={{ borderRadius: '12px' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#6B7280] font-medium uppercase">Shortlisted</span>
            <Star className="w-4 h-4 text-[#F59E0B]" strokeWidth={2} />
          </div>
          <p className="text-2xl text-[#111827] font-semibold">{statusCounts.shortlisted}</p>
        </button>

        <button
          onClick={() => setStatusFilter('contacted')}
          className={`p-4 bg-white border transition-all ${
            statusFilter === 'contacted' 
              ? 'border-[#7DBBFF] shadow-sm ring-2 ring-[#7DBBFF]/20' 
              : 'border-black/[0.08] hover:border-[#7DBBFF]/50'
          }`}
          style={{ borderRadius: '12px' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[#6B7280] font-medium uppercase">Contacted</span>
            <MessageSquare className="w-4 h-4 text-[#7DBBFF]" strokeWidth={2} />
          </div>
          <p className="text-2xl text-[#111827] font-semibold">{statusCounts.contacted}</p>
        </button>
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[#6B7280]">
          Showing <span className="font-semibold text-[#111827]">{filteredCompanies.length}</span> {filteredCompanies.length === 1 ? 'company' : 'companies'}
        </p>
        
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="appearance-none pl-4 pr-10 py-2 bg-white border border-black/[0.08] text-sm text-[#111827] hover:border-[#7DBBFF]/50 focus:outline-none focus:border-[#7DBBFF] transition-all cursor-pointer"
            style={{ borderRadius: '10px' }}
          >
            <option value="recent">Most Recent</option>
            <option value="match">Best Match</option>
            <option value="status">Status</option>
          </select>
          <ChevronDown className="w-4 h-4 text-[#6B7280] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredCompanies.map((company) => (
          <div
            key={company.id}
            className="relative bg-white p-4 border border-black/[0.08] hover:border-[#7DBBFF]/30 hover:shadow-lg transition-all duration-300 group"
            style={{ borderRadius: '14px' }}
          >
            {/* Save Star Button */}
            <button
              onClick={() => toggleSave(company.id)}
              className={`absolute top-4 right-4 p-1.5 transition-all duration-300 ${
                savedCompanies.has(company.id)
                  ? 'bg-[#F59E0B] text-white scale-110'
                  : 'bg-[#F9F9FA] text-[#9CA3AF] hover:bg-[#F59E0B]/10 hover:text-[#F59E0B]'
              }`}
              style={{ borderRadius: '8px' }}
            >
              <Star 
                className="w-4 h-4" 
                strokeWidth={2} 
                fill={savedCompanies.has(company.id) ? 'currentColor' : 'none'} 
              />
            </button>

            {/* Header with Logo and Info */}
            <div className="flex items-start gap-4 mb-4">
              {/* Company Logo - 56px */}
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#7DBBFF]/20 to-[#8B5CF6]/20 flex items-center justify-center shrink-0 border border-black/[0.06] group-hover:scale-105 transition-transform duration-300">
                <Building2 className="w-7 h-7 text-[#7DBBFF]" strokeWidth={1.5} />
              </div>

              {/* Company Info */}
              <div className="flex-1 min-w-0 pr-8">
                <h3 className="text-lg text-[#111827] font-bold mb-1 truncate">{company.name}</h3>
                <p className="text-sm text-[#6B7280] mb-2 truncate">{company.role}</p>
                
                {/* Location and Match Score on one line */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-[#9CA3AF] flex items-center gap-1">
                    <MapPin className="w-3 h-3" strokeWidth={2} />
                    {company.location}
                  </span>
                  {company.matchScore && (
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-[#10B981]/10 to-[#059669]/10 border border-[#10B981]/30 text-[#10B981] font-semibold" style={{ borderRadius: '6px' }}>
                      <Sparkles className="w-2.5 h-2.5" strokeWidth={2} />
                      <span>{company.matchScore}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status Badge - Right Aligned */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-black/[0.06]">
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border transition-all duration-300 ${getStatusStyle(company.status)}`} style={{ borderRadius: '8px' }}>
                {getStatusIcon(company.status)}
                <span>{company.status}</span>
              </div>
              
              <span className="text-xs text-[#9CA3AF] flex items-center gap-1">
                <Clock className="w-3 h-3" strokeWidth={2} />
                {company.date}
              </span>
            </div>

            {/* Last Activity Snippet */}
            {company.lastActivity && (
              <div className="mb-4 p-2.5 bg-[#F9F9FA] border border-black/[0.04]" style={{ borderRadius: '8px' }}>
                <p className="text-xs text-[#6B7280]">
                  <span className="font-medium text-[#111827]">Recent: </span>
                  {company.lastActivity}
                </p>
              </div>
            )}

            {/* Next Step CTA */}
            {company.nextStep && (
              <button 
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-300 ${getNextStepStyle(company.nextStep)}`}
                style={{ borderRadius: '10px' }}
                onClick={() => openModal(
                  company.nextStep.includes('Interview') ? 'interview' :
                  company.nextStep.includes('Follow') ? 'followup' :
                  company.nextStep.includes('Message') ? 'message' :
                  company.nextStep.includes('Apply') ? 'roledetails' :
                  company.nextStep.includes('Check') ? 'roledetails' : null,
                  company
                )}
              >
                {company.nextStep.includes('Interview') && <Calendar className="w-4 h-4" strokeWidth={2} />}
                {company.nextStep.includes('Follow') && <MessageSquare className="w-4 h-4" strokeWidth={2} />}
                {company.nextStep.includes('Message') && <Mail className="w-4 h-4" strokeWidth={2} />}
                {company.nextStep.includes('Apply') && <ArrowUpRight className="w-4 h-4" strokeWidth={2} />}
                {company.nextStep.includes('Check') && <Eye className="w-4 h-4" strokeWidth={2} />}
                <span>{company.nextStep}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredCompanies.length === 0 && (
        <div className="bg-white p-12 border border-black/[0.08] shadow-sm text-center" style={{ borderRadius: '20px' }}>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F9F9FA] flex items-center justify-center">
            <Building2 className="w-8 h-8 text-[#9CA3AF]" strokeWidth={1.5} />
          </div>
          <h3 className="text-base text-[#111827] font-semibold mb-2">No companies found</h3>
          <p className="text-sm text-[#6B7280] max-w-md mx-auto mb-4">
            {statusFilter === 'all'
              ? activeTab === 'interested'
                ? 'Companies that are interested in your profile will appear here.'
                : 'Companies you have saved or applied to will appear here.'
              : `No companies with status "${statusFilter}".`}
          </p>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="px-4 py-2 bg-[#7DBBFF] text-white hover:bg-[#6aabef] transition-all text-sm font-medium"
              style={{ borderRadius: '10px' }}
            >
              View All Companies
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {modalState.type === 'interview' && modalState.company && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.3s_ease-out]" 
          onClick={closeModal}
        >
          <div 
            className="bg-white p-6 shadow-2xl w-full max-w-md animate-[slideUp_0.3s_ease-out]" 
            style={{ borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/[0.08]">
              <h3 className="text-lg text-[#111827] font-bold">Interview Details</h3>
              <button 
                onClick={closeModal} 
                className="p-1.5 text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F9F9FA] transition-all"
                style={{ borderRadius: '8px' }}
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* Company Info */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7DBBFF]/20 to-[#8B5CF6]/20 flex items-center justify-center shrink-0 border border-black/[0.06]">
                  <Building2 className="w-6 h-6 text-[#7DBBFF]" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-base text-[#111827] font-semibold">{modalState.company.name}</h4>
                  <p className="text-sm text-[#6B7280]">{modalState.company.role}</p>
                </div>
              </div>

              {/* Interview Details */}
              <div className="space-y-3 p-4 bg-[#F9F9FA] border border-black/[0.06]" style={{ borderRadius: '12px' }}>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-[#7DBBFF] mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="text-xs text-[#6B7280] mb-0.5">Date</p>
                    <p className="text-sm text-[#111827] font-medium">{modalState.company.interviewDetails?.date}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#7DBBFF] mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="text-xs text-[#6B7280] mb-0.5">Time</p>
                    <p className="text-sm text-[#111827] font-medium">{modalState.company.interviewDetails?.time}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#7DBBFF] mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="text-xs text-[#6B7280] mb-0.5">Contact Person</p>
                    <p className="text-sm text-[#111827] font-medium">{modalState.company.interviewDetails?.contactPerson}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#7DBBFF] mt-0.5" strokeWidth={2} />
                  <div>
                    <p className="text-xs text-[#6B7280] mb-0.5">Email</p>
                    <p className="text-sm text-[#111827] font-medium">{modalState.company.interviewDetails?.contactEmail}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#10B981] text-white hover:bg-[#059669] transition-all text-sm font-medium"
                style={{ borderRadius: '10px' }}
                onClick={handleAddToCalendar}
              >
                <Calendar className="w-4 h-4" strokeWidth={2} />
                <span>Add to Calendar</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] transition-all text-sm font-medium"
                style={{ borderRadius: '10px' }}
                onClick={handleReschedule}
              >
                <Clock className="w-4 h-4" strokeWidth={2} />
                <span>Reschedule</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState.type === 'followup' && modalState.company && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.3s_ease-out]" 
          onClick={closeModal}
        >
          <div 
            className="bg-white p-6 shadow-2xl w-full max-w-md animate-[slideUp_0.3s_ease-out]" 
            style={{ borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/[0.08]">
              <h3 className="text-lg text-[#111827] font-bold">Send Follow-Up Message</h3>
              <button 
                onClick={closeModal} 
                className="p-1.5 text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F9F9FA] transition-all"
                style={{ borderRadius: '8px' }}
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* Company Info */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7DBBFF]/20 to-[#8B5CF6]/20 flex items-center justify-center shrink-0 border border-black/[0.06]">
                  <Building2 className="w-6 h-6 text-[#7DBBFF]" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h4 className="text-base text-[#111827] font-semibold">{modalState.company.name}</h4>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium border ${getStatusStyle(modalState.company.status)} mt-1`} style={{ borderRadius: '6px' }}>
                    {getStatusIcon(modalState.company.status)}
                    <span>{modalState.company.status}</span>
                  </div>
                </div>
              </div>

              {/* Pre-filled subject */}
              <div className="mb-4">
                <label className="block text-xs text-[#6B7280] font-medium mb-2">Subject</label>
                <input
                  type="text"
                  value={`Follow-Up: ${modalState.company.role}`}
                  readOnly
                  className="w-full px-3 py-2 bg-[#F9F9FA] border border-black/[0.06] text-sm text-[#111827]"
                  style={{ borderRadius: '10px' }}
                />
              </div>

              {/* Message textarea */}
              <div>
                <label className="block text-xs text-[#6B7280] font-medium mb-2">Message</label>
                <textarea
                  value={followUpMessage}
                  onChange={(e) => setFollowUpMessage(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7DBBFF] transition-all resize-none"
                  style={{ borderRadius: '10px' }}
                  placeholder="Type your follow-up message here..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7DBBFF] text-white hover:bg-[#6aabef] transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderRadius: '10px' }}
                onClick={sendFollowUpMessage}
                disabled={!followUpMessage.trim()}
              >
                <Send className="w-4 h-4" strokeWidth={2} />
                <span>Send Message</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] transition-all text-sm font-medium"
                style={{ borderRadius: '10px' }}
                onClick={closeModal}
              >
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState.type === 'message' && modalState.company && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.3s_ease-out]" 
          onClick={closeModal}
        >
          <div 
            className="bg-white p-6 shadow-2xl w-full max-w-md animate-[slideUp_0.3s_ease-out]" 
            style={{ borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/[0.08]">
              <h3 className="text-lg text-[#111827] font-bold">Start Conversation</h3>
              <button 
                onClick={closeModal} 
                className="p-1.5 text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F9F9FA] transition-all"
                style={{ borderRadius: '8px' }}
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* Company Info */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7DBBFF]/20 to-[#8B5CF6]/20 flex items-center justify-center shrink-0 border border-black/[0.06]">
                  <Building2 className="w-6 h-6 text-[#7DBBFF]" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h4 className="text-base text-[#111827] font-semibold">{modalState.company.name}</h4>
                  <p className="text-sm text-[#6B7280]">{modalState.company.role}</p>
                </div>
              </div>

              {/* Message textarea */}
              <div>
                <label className="block text-xs text-[#6B7280] font-medium mb-2">Your Message</label>
                <textarea
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="w-full h-32 px-3 py-2 border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7DBBFF] transition-all resize-none"
                  style={{ borderRadius: '10px' }}
                  placeholder="Introduce yourself and express your interest..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7DBBFF] text-white hover:bg-[#6aabef] transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderRadius: '10px' }}
                onClick={sendMessage}
                disabled={!chatMessage.trim()}
              >
                <Send className="w-4 h-4" strokeWidth={2} />
                <span>Send Message</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] transition-all text-sm font-medium"
                style={{ borderRadius: '10px' }}
                onClick={closeModal}
              >
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {modalState.type === 'roledetails' && modalState.company && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.3s_ease-out]" 
          onClick={closeModal}
        >
          <div 
            className="bg-white p-6 shadow-2xl w-full max-w-md animate-[slideUp_0.3s_ease-out]" 
            style={{ borderRadius: '16px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/[0.08]">
              <h3 className="text-lg text-[#111827] font-bold">Role Details</h3>
              <button 
                onClick={closeModal} 
                className="p-1.5 text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F9F9FA] transition-all"
                style={{ borderRadius: '8px' }}
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* Company Info */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#7DBBFF]/20 to-[#8B5CF6]/20 flex items-center justify-center shrink-0 border border-black/[0.06]">
                  <Building2 className="w-6 h-6 text-[#7DBBFF]" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="text-base text-[#111827] font-semibold">{modalState.company.name}</h4>
                  <p className="text-sm text-[#6B7280]">{modalState.company.role}</p>
                </div>
              </div>

              {/* Role Details */}
              <div className="space-y-4 p-4 bg-[#F9F9FA] border border-black/[0.06]" style={{ borderRadius: '12px' }}>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Location</p>
                  <p className="text-sm text-[#111827] font-medium flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#7DBBFF]" strokeWidth={2} />
                    {modalState.company.location}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7280] mb-1">Status</p>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border ${getStatusStyle(modalState.company.status)}`} style={{ borderRadius: '8px' }}>
                    {getStatusIcon(modalState.company.status)}
                    <span>{modalState.company.status}</span>
                  </div>
                </div>
                {modalState.company.matchScore && (
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Match Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-black/[0.06] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#10B981] to-[#059669]"
                          style={{ width: `${modalState.company.matchScore}%` }}
                        />
                      </div>
                      <span className="text-sm text-[#111827] font-semibold">{modalState.company.matchScore}%</span>
                    </div>
                  </div>
                )}
                {modalState.company.lastActivity && (
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Last Activity</p>
                    <p className="text-sm text-[#111827]">{modalState.company.lastActivity}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7DBBFF] text-white hover:bg-[#6aabef] transition-all text-sm font-medium"
                style={{ borderRadius: '10px' }}
                onClick={() => {
                  showToast('Application submitted successfully!');
                  closeModal();
                }}
              >
                <ArrowUpRight className="w-4 h-4" strokeWidth={2} />
                <span>Apply Now</span>
              </button>
              <button
                className="flex items-center justify-center gap-2 px-4 py-2.5 border border-black/[0.08] text-[#111827] hover:bg-[#F9F9FA] transition-all text-sm font-medium"
                style={{ borderRadius: '10px' }}
                onClick={closeModal}
              >
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div className="fixed bottom-4 right-4 z-50 animate-[slideInRight_0.3s_ease-out]">
          <div className="bg-[#10B981] text-white px-4 py-3 shadow-lg flex items-center gap-3" style={{ borderRadius: '12px' }}>
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Check className="w-3 h-3" strokeWidth={3} />
            </div>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}