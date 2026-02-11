import { useState } from 'react';
import { Briefcase, GraduationCap, FileText, Upload, Plus, Edit3, Heart, Users, Lightbulb, Trash2, Save, File, X, Sparkles, TrendingUp } from 'lucide-react';
import { DSSectionHeader, DSSurfaceCard, DSTag } from '../ds/DSComponents';
import { toast } from 'sonner@2.0.3';
import { useUserProfile } from '../../contexts/UserProfileContext';

interface ExperienceEntry {
  id: string;
  jobTitle: string;
  company: string;
  dateFrom: string;
  dateTo: string;
  description: string;
}

interface EducationEntry {
  id: string;
  degree: string;
  institution: string;
  year: string;
  description?: string;
}

interface ProjectEntry {
  id: string;
  projectName: string;
  organization: string;
  dateFrom: string;
  dateTo: string;
  description: string;
}

// Editable input component - MOVED OUTSIDE
const EditableInput = ({ 
  value, 
  onChange, 
  placeholder, 
  multiline = false,
  autoFocus = false,
  id
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder: string;
  multiline?: boolean;
  autoFocus?: boolean;
  id?: string;
}) => {
  const baseClasses = "w-full px-3 py-2 bg-white border border-[#7DBBFF] text-[#111827] placeholder-[#9CA3AF] transition-all focus:outline-none focus:border-[#7DBBFF] focus:shadow-[0_0_0_3px_rgba(125,187,255,0.12)]";
  const style = { borderRadius: '8px' };

  if (multiline) {
    return (
      <textarea
        key={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${baseClasses} min-h-[80px] resize-none`}
        style={style}
        autoFocus={autoFocus}
      />
    );
  }

  return (
    <input
      type="text"
      key={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={baseClasses}
      style={style}
      autoFocus={autoFocus}
    />
  );
};

// Static text component - MOVED OUTSIDE
const StaticText = ({ children, secondary = false }: { children: React.ReactNode; secondary?: boolean }) => {
  return (
    <div className={secondary ? 'text-[#6B7280]' : 'text-[#111827]'}>
      {children}
    </div>
  );
};

// Format date for display - MOVED OUTSIDE
const formatDate = (date: string) => {
  if (date === 'Present') return 'Present';
  if (!date) return '';
  const [year, month] = date.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

// Experience card component - MOVED OUTSIDE
const ExperienceCard = ({ 
  entry, 
  type,
  isEditing,
  onEdit,
  onSave,
  onDelete,
  onUpdate
}: {
  entry: ExperienceEntry;
  type: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onUpdate: (field: string, value: string) => void;
}) => {
  return (
    <div 
      className="flex items-start justify-between p-4 bg-[#F9F9FA] border border-black/[0.08] hover:shadow-sm transition-shadow" 
      style={{ borderRadius: '12px' }}
    >
      <div className="flex-1 space-y-3">
        {isEditing ? (
          <>
            <EditableInput
              id={`${entry.id}-jobTitle`}
              value={entry.jobTitle}
              onChange={(value) => onUpdate('jobTitle', value)}
              placeholder="e.g. Marketing Coordinator"
              autoFocus={!entry.jobTitle}
            />
            <EditableInput
              id={`${entry.id}-company`}
              value={entry.company}
              onChange={(value) => onUpdate('company', value)}
              placeholder="e.g. CMe Tech or Freelance Project"
            />
            <div className="grid grid-cols-2 gap-3">
              <EditableInput
                id={`${entry.id}-dateFrom`}
                value={entry.dateFrom}
                onChange={(value) => onUpdate('dateFrom', value)}
                placeholder="Start (YYYY-MM)"
              />
              <EditableInput
                id={`${entry.id}-dateTo`}
                value={entry.dateTo}
                onChange={(value) => onUpdate('dateTo', value)}
                placeholder="End (YYYY-MM) or Present"
              />
            </div>
            <EditableInput
              id={`${entry.id}-description`}
              value={entry.description}
              onChange={(value) => onUpdate('description', value)}
              placeholder="Summarise what you worked on or achieved (1–3 sentences)."
              multiline
            />
          </>
        ) : (
          <>
            <StaticText>{entry.jobTitle || 'Untitled'}</StaticText>
            <StaticText secondary>
              {entry.company} · {formatDate(entry.dateFrom)} - {formatDate(entry.dateTo)}
            </StaticText>
            {entry.description && (
              <p className="text-sm text-[#6B7280]">{entry.description}</p>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-2 ml-4">
        {isEditing ? (
          <button
            onClick={onSave}
            className="p-2 text-[#7DBBFF] hover:text-[#6aabef] hover:bg-white transition-colors"
            style={{ borderRadius: '8px' }}
          >
            <Save className="w-4 h-4" strokeWidth={1.5} />
          </button>
        ) : (
          <button
            onClick={onEdit}
            className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-white transition-colors"
            style={{ borderRadius: '8px' }}
          >
            <Edit3 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-2 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-white transition-colors"
          style={{ borderRadius: '8px' }}
        >
          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

// Project card component - MOVED OUTSIDE  
const ProjectCard = ({ 
  entry, 
  type,
  isEditing,
  onEdit,
  onSave,
  onDelete,
  onUpdate
}: {
  entry: ProjectEntry;
  type: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onUpdate: (field: string, value: string) => void;
}) => {
  return (
    <div 
      className="flex items-start justify-between p-4 bg-[#F9F9FA] border border-black/[0.08] hover:shadow-sm transition-shadow" 
      style={{ borderRadius: '12px' }}
    >
      <div className="flex-1 space-y-3">
        {isEditing ? (
          <>
            <EditableInput
              id={`${entry.id}-projectName`}
              value={entry.projectName}
              onChange={(value) => onUpdate('projectName', value)}
              placeholder="e.g. Community Design Workshop"
              autoFocus={!entry.projectName}
            />
            <EditableInput
              id={`${entry.id}-organization`}
              value={entry.organization}
              onChange={(value) => onUpdate('organization', value)}
              placeholder="e.g. Non-profit or Personal Project"
            />
            <div className="grid grid-cols-2 gap-3">
              <EditableInput
                id={`${entry.id}-dateFrom`}
                value={entry.dateFrom}
                onChange={(value) => onUpdate('dateFrom', value)}
                placeholder="Start (YYYY-MM)"
              />
              <EditableInput
                id={`${entry.id}-dateTo`}
                value={entry.dateTo}
                onChange={(value) => onUpdate('dateTo', value)}
                placeholder="End (YYYY-MM) or Present"
              />
            </div>
            <EditableInput
              id={`${entry.id}-description`}
              value={entry.description}
              onChange={(value) => onUpdate('description', value)}
              placeholder="Summarise what you worked on or achieved (1–3 sentences)."
              multiline
            />
          </>
        ) : (
          <>
            <StaticText>{entry.projectName || 'Untitled'}</StaticText>
            <StaticText secondary>
              {entry.organization} · {formatDate(entry.dateFrom)} - {formatDate(entry.dateTo)}
            </StaticText>
            {entry.description && (
              <p className="text-sm text-[#6B7280]">{entry.description}</p>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-2 ml-4">
        {isEditing ? (
          <button
            onClick={onSave}
            className="p-2 text-[#7DBBFF] hover:text-[#6aabef] hover:bg-white transition-colors"
            style={{ borderRadius: '8px' }}
          >
            <Save className="w-4 h-4" strokeWidth={1.5} />
          </button>
        ) : (
          <button
            onClick={onEdit}
            className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-white transition-colors"
            style={{ borderRadius: '8px' }}
          >
            <Edit3 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-2 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-white transition-colors"
          style={{ borderRadius: '8px' }}
        >
          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

// Education card component - MOVED OUTSIDE
const EducationCard = ({ 
  entry, 
  isEditing,
  onEdit,
  onSave,
  onDelete,
  onUpdate
}: {
  entry: EducationEntry;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete: () => void;
  onUpdate: (field: string, value: string) => void;
}) => {
  return (
    <div 
      className="flex items-start justify-between p-4 bg-[#F9F9FA] border border-black/[0.08] hover:shadow-sm transition-shadow mb-4" 
      style={{ borderRadius: '12px' }}
    >
      <div className="flex-1 space-y-3">
        {isEditing ? (
          <>
            <EditableInput
              id={`${entry.id}-degree`}
              value={entry.degree}
              onChange={(value) => onUpdate('degree', value)}
              placeholder="e.g. B.A. Computer Science"
              autoFocus={!entry.degree}
            />
            <EditableInput
              id={`${entry.id}-institution`}
              value={entry.institution}
              onChange={(value) => onUpdate('institution', value)}
              placeholder="e.g. University of California, Berkeley"
            />
            <EditableInput
              id={`${entry.id}-year`}
              value={entry.year}
              onChange={(value) => onUpdate('year', value)}
              placeholder="Graduation Year (e.g. 2019)"
            />
            <EditableInput
              id={`${entry.id}-description`}
              value={entry.description || ''}
              onChange={(value) => onUpdate('description', value)}
              placeholder="Optional: Brief description of your focus or achievements"
              multiline
            />
          </>
        ) : (
          <>
            <StaticText>{entry.degree || 'Untitled'}</StaticText>
            <StaticText secondary>
              {entry.institution} · {entry.year}
            </StaticText>
            {entry.description && (
              <p className="text-sm text-[#6B7280]">{entry.description}</p>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-2 ml-4">
        {isEditing ? (
          <button
            onClick={onSave}
            className="p-2 text-[#7DBBFF] hover:text-[#6aabef] hover:bg-white transition-colors"
            style={{ borderRadius: '8px' }}
          >
            <Save className="w-4 h-4" strokeWidth={1.5} />
          </button>
        ) : (
          <button
            onClick={onEdit}
            className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-white transition-colors"
            style={{ borderRadius: '8px' }}
          >
            <Edit3 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        )}
        <button
          onClick={onDelete}
          className="p-2 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-white transition-colors"
          style={{ borderRadius: '8px' }}
        >
          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export function WorkHistoryPage() {
  const { profileData, updateProfileData } = useUserProfile();
  
  // State for employment entries
  const [employmentEntries, setEmploymentEntries] = useState<ExperienceEntry[]>([
    {
      id: '1',
      jobTitle: 'Senior Product Designer',
      company: 'Acme Corp',
      dateFrom: '2021-01',
      dateTo: 'Present',
      description: 'Led design system development and product redesign initiatives across multiple teams.',
    },
    {
      id: '2',
      jobTitle: 'Product Designer',
      company: 'StartupXYZ',
      dateFrom: '2019-01',
      dateTo: '2021-01',
      description: 'Designed core product features and established design processes for early-stage startup.',
    },
  ]);

  // State for education entries
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([
    {
      id: '1',
      degree: 'B.A. Design',
      institution: 'University of California, Berkeley',
      year: '2019',
      description: 'Focused on user-centered design principles and methodologies.',
    },
  ]);

  // State for passion projects
  const [passionProjects, setPassionProjects] = useState<ProjectEntry[]>([
    {
      id: '1',
      projectName: 'Design System Library',
      organization: 'Open-source component library',
      dateFrom: '2023-01',
      dateTo: 'Present',
      description: 'Created and maintain a React component library used by 500+ designers',
    },
    {
      id: '2',
      projectName: 'UX Mentorship Platform',
      organization: 'Side project',
      dateFrom: '2022-01',
      dateTo: 'Present',
      description: 'Building a platform connecting junior designers with industry mentors',
    },
  ]);

  // State for volunteer work
  const [volunteerWork, setVolunteerWork] = useState<ProjectEntry[]>([
    {
      id: '1',
      projectName: 'Design for Good Initiative',
      organization: 'Non-profit organization',
      dateFrom: '2020-01',
      dateTo: 'Present',
      description: 'Pro-bono design work for local non-profits and community organizations',
    },
  ]);

  // State for extracurricular activities
  const [extracurricular, setExtracurricular] = useState<ProjectEntry[]>([
    {
      id: '1',
      projectName: 'Design Community Organizer',
      organization: 'Local meetup group',
      dateFrom: '2021-01',
      dateTo: 'Present',
      description: 'Organize monthly design talks and workshops for 200+ local designers',
    },
    {
      id: '2',
      projectName: 'Podcast Host',
      organization: 'Design Voices Podcast',
      dateFrom: '2022-01',
      dateTo: 'Present',
      description: 'Weekly podcast interviewing designers about their career journeys',
    },
  ]);

  // State for certifications
  const [certifications, setCertifications] = useState<string[]>([
    'UX Certification, Nielsen Norman Group',
    'Figma Expert',
  ]);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteConfirmType, setDeleteConfirmType] = useState<string | null>(null);
  
  // Certification editing state
  const [editingCertIndex, setEditingCertIndex] = useState<number | null>(null);
  const [newCertValue, setNewCertValue] = useState<string>('');
  const [isAddingCert, setIsAddingCert] = useState<boolean>(false);

  // CV upload state
  const [uploadedCV, setUploadedCV] = useState<{
    name: string;
    uploadDate: string;
  } | null>(null);
  const [showCVDeleteConfirm, setShowCVDeleteConfirm] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Handle save
  const handleSave = (type: string) => {
    setEditingId(null);
    toast.success('Changes saved ✅', {
      duration: 1500,
      style: {
        background: '#10B981',
        color: 'white',
        border: 'none',
      },
    });
  };

  // Handle delete
  const handleDelete = (id: string, type: string) => {
    setDeleteConfirmId(id);
    setDeleteConfirmType(type);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId || !deleteConfirmType) return;

    switch (deleteConfirmType) {
      case 'employment':
        setEmploymentEntries(employmentEntries.filter(e => e.id !== deleteConfirmId));
        break;
      case 'education':
        setEducationEntries(educationEntries.filter(e => e.id !== deleteConfirmId));
        break;
      case 'passion':
        setPassionProjects(passionProjects.filter(e => e.id !== deleteConfirmId));
        break;
      case 'volunteer':
        setVolunteerWork(volunteerWork.filter(e => e.id !== deleteConfirmId));
        break;
      case 'extracurricular':
        setExtracurricular(extracurricular.filter(e => e.id !== deleteConfirmId));
        break;
    }

    setDeleteConfirmId(null);
    setDeleteConfirmType(null);
    toast.success('Entry removed', {
      duration: 1500,
    });
  };

  // Add new entry
  const addNewEntry = (type: string) => {
    const newId = Date.now().toString();
    
    switch (type) {
      case 'employment':
        setEmploymentEntries([
          ...employmentEntries,
          {
            id: newId,
            jobTitle: '',
            company: '',
            dateFrom: '',
            dateTo: '',
            description: '',
          },
        ]);
        setEditingId(newId);
        break;
      case 'education':
        setEducationEntries([
          ...educationEntries,
          {
            id: newId,
            degree: '',
            institution: '',
            year: '',
            description: '',
          },
        ]);
        setEditingId(newId);
        break;
      case 'passion':
        setPassionProjects([
          ...passionProjects,
          {
            id: newId,
            projectName: '',
            organization: '',
            dateFrom: '',
            dateTo: '',
            description: '',
          },
        ]);
        setEditingId(newId);
        break;
      case 'volunteer':
        setVolunteerWork([
          ...volunteerWork,
          {
            id: newId,
            projectName: '',
            organization: '',
            dateFrom: '',
            dateTo: '',
            description: '',
          },
        ]);
        setEditingId(newId);
        break;
      case 'extracurricular':
        setExtracurricular([
          ...extracurricular,
          {
            id: newId,
            projectName: '',
            organization: '',
            dateFrom: '',
            dateTo: '',
            description: '',
          },
        ]);
        setEditingId(newId);
        break;
    }
  };

  // Update entry
  const updateEntry = (id: string, type: string, field: string, value: string) => {
    switch (type) {
      case 'employment':
        setEmploymentEntries(employmentEntries.map(e => 
          e.id === id ? { ...e, [field]: value } : e
        ));
        break;
      case 'education':
        setEducationEntries(educationEntries.map(e => 
          e.id === id ? { ...e, [field]: value } : e
        ));
        break;
      case 'passion':
        setPassionProjects(passionProjects.map(e => 
          e.id === id ? { ...e, [field]: value } : e
        ));
        break;
      case 'volunteer':
        setVolunteerWork(volunteerWork.map(e => 
          e.id === id ? { ...e, [field]: value } : e
        ));
        break;
      case 'extracurricular':
        setExtracurricular(extracurricular.map(e => 
          e.id === id ? { ...e, [field]: value } : e
        ));
        break;
    }
  };
  
  // Certification handlers
  const addCertification = () => {
    if (newCertValue.trim()) {
      setCertifications([...certifications, newCertValue.trim()]);
      setNewCertValue('');
      setIsAddingCert(false);
      toast.success('Certification added ✅', {
        duration: 1500,
        style: {
          background: '#10B981',
          color: 'white',
          border: 'none',
        },
      });
    }
  };
  
  const updateCertification = (index: number, value: string) => {
    const updated = [...certifications];
    updated[index] = value;
    setCertifications(updated);
  };
  
  const saveCertification = () => {
    setEditingCertIndex(null);
    toast.success('Changes saved ✅', {
      duration: 1500,
      style: {
        background: '#10B981',
        color: 'white',
        border: 'none',
      },
    });
  };
  
  const deleteCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
    toast.success('Certification removed', {
      duration: 1500,
    });
  };

  // CV upload handlers
  const handleFileUpload = (file: File | null) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF or DOCX.', {
        duration: 2000,
      });
      return;
    }

    // Validate file size (10MB = 10 * 1024 * 1024 bytes)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10 MB.', {
        duration: 2000,
      });
      return;
    }

    const now = new Date();
    const uploadDate = `${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    
    setUploadedCV({
      name: file.name,
      uploadDate: uploadDate,
    });

    toast.success('CV uploaded successfully ✅', {
      duration: 1500,
      style: {
        background: '#10B981',
        color: 'white',
        border: 'none',
      },
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileUpload(file);
    e.target.value = ''; // Reset input
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] || null;
    handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const confirmDeleteCV = () => {
    setUploadedCV(null);
    setShowCVDeleteConfirm(false);
    toast.success('CV removed', {
      duration: 1500,
    });
  };

  return (
    <div>
      <DSSectionHeader
        title="Work History & CV"
        description="Traditional credentials and background"
      />
      
      {/* CV Upload Card */}
      <DSSurfaceCard className="p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-[#111827] mb-1">Upload CV / Resume</h3>
          <p className="text-sm text-[#6B7280]">Attach your resume for employers to review.</p>
        </div>
        
        {uploadedCV ? (
          <div className="p-4 bg-[#F9F9FA] border border-[#E5E7EB] hover:shadow-sm hover:border-[#D1D5DB] transition-all group" style={{ borderRadius: '12px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white border border-black/[0.08]" style={{ borderRadius: '8px' }}>
                  <File className="w-5 h-5 text-[#6B7280]" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-[#111827]">{uploadedCV.name}</div>
                  <div className="text-sm text-[#6B7280]">Uploaded {uploadedCV.uploadDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileInput}
                  />
                  <span className="text-sm text-[#7DBBFF] hover:text-[#6aabef] transition-colors">Replace</span>
                </label>
                <button
                  onClick={() => setShowCVDeleteConfirm(true)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-[#9CA3AF] hover:text-[#EF4444] transition-all"
                  style={{ borderRadius: '8px' }}
                >
                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed transition-all p-8 text-center cursor-pointer ${
              isDragging 
                ? 'border-[#7DBBFF] bg-[#7DBBFF]/5' 
                : 'border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-sm focus-within:border-[#7DBBFF] focus-within:shadow-[0_0_0_3px_rgba(125,187,255,0.12)]'
            }`}
            style={{ borderRadius: '12px' }}
          >
            <Upload className="w-8 h-8 text-[#9CA3AF] mx-auto mb-3" strokeWidth={1.5} />
            <div className="mb-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileInput}
                />
                <span className="text-[#7DBBFF] hover:text-[#6aabef] transition-colors">Choose File</span>
              </label>
              <span className="text-[#6B7280]"> or drag and drop</span>
            </div>
            <p className="text-sm text-[#9CA3AF]">Accepted formats: PDF, DOCX (max 10 MB)</p>
            {!uploadedCV && (
              <p className="text-sm text-[#9CA3AF] mt-2 italic">No CV uploaded yet.</p>
            )}
          </div>
        )}
      </DSSurfaceCard>

      {/* Career Readiness & Growth Section */}
      <DSSurfaceCard className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#7DBBFF]" strokeWidth={1.5} />
          <h3 className="text-[#111827]">Career Readiness & Growth</h3>
        </div>
        <p className="text-sm text-[#6B7280] mb-6">
          Help employers understand your career stage and openness to new opportunities.
        </p>

        {/* Total Experience */}
        <div className="mb-5">
          <label className="block text-sm text-[#111827] font-medium mb-2">
            Total Work Experience <span className="text-[#9CA3AF]">(Years)</span>
          </label>
          <select
            value={profileData.total_experience ?? ''}
            onChange={(e) => updateProfileData({ total_experience: e.target.value ? Number(e.target.value) : null })}
            className="w-full px-3 py-2.5 bg-white border border-[#D1D9E6] text-[#111827] placeholder-[#9CA3AF] transition-all focus:outline-none focus:border-[#7DBBFF] focus:shadow-[0_0_0_3px_rgba(125,187,255,0.12)]"
            style={{ borderRadius: '10px' }}
          >
            <option value="">Select years of experience...</option>
            <option value="0">0 years (Entry Level)</option>
            <option value="1">1 year</option>
            <option value="2">2 years</option>
            <option value="3">3 years</option>
            <option value="4">4 years</option>
            <option value="5">5 years</option>
            <option value="6">6 years</option>
            <option value="7">7 years</option>
            <option value="8">8 years</option>
            <option value="9">9 years</option>
            <option value="10">10 years</option>
            <option value="12">10+ years</option>
            <option value="15">15+ years</option>
          </select>
        </div>

        {/* Career Transition Toggle */}
        <div className="mb-5">
          <button
            onClick={() => updateProfileData({ is_transitioning: !profileData.is_transitioning })}
            className="flex items-center gap-3 w-full p-4 bg-[#F9FBFF] border border-[#E8EDF2] hover:border-[#7DBBFF]/30 transition-all"
            style={{ borderRadius: '12px' }}
          >
            <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all shrink-0 ${
              profileData.is_transitioning
                ? 'bg-[#7DBBFF] border-[#7DBBFF]'
                : 'bg-white border-[#D1D9E6]'
            }`} style={{ borderRadius: '6px' }}>
              {profileData.is_transitioning && (
                <svg className="w-3.5 h-3.5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm text-[#111827] font-medium">Career Transition / Returner</div>
              <div className="text-xs text-[#6B7280] mt-0.5">I'm transitioning careers or returning to the workforce</div>
            </div>
          </button>
        </div>

        {/* Readiness Tags */}
        <div className="mb-3">
          <label className="block text-sm text-[#111827] font-medium mb-3">
            Optional Readiness Tags
          </label>
          <div className="space-y-3">
            {/* Open to Career Change */}
            <button
              onClick={() => updateProfileData({ open_to_change: !profileData.open_to_change })}
              className="flex items-center gap-3 w-full p-3 bg-[#F9FBFF] border border-[#E8EDF2] hover:border-[#8B5CF6]/30 transition-all"
              style={{ borderRadius: '10px' }}
            >
              <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all shrink-0 ${
                profileData.open_to_change
                  ? 'bg-[#8B5CF6] border-[#8B5CF6]'
                  : 'bg-white border-[#D1D9E6]'
              }`} style={{ borderRadius: '6px' }}>
                {profileData.open_to_change && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm text-[#111827]">Open to Career Change</div>
              </div>
            </button>

            {/* Ready to Step Up */}
            <button
              onClick={() => updateProfileData({ ready_to_step_up: !profileData.ready_to_step_up })}
              className="flex items-center gap-3 w-full p-3 bg-[#F9FBFF] border border-[#E8EDF2] hover:border-[#10B981]/30 transition-all"
              style={{ borderRadius: '10px' }}
            >
              <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all shrink-0 ${
                profileData.ready_to_step_up
                  ? 'bg-[#10B981] border-[#10B981]'
                  : 'bg-white border-[#D1D9E6]'
              }`} style={{ borderRadius: '6px' }}>
                {profileData.ready_to_step_up && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm text-[#111827]">Ready to Step Up</div>
              </div>
            </button>

            {/* Recently Retrained */}
            <button
              onClick={() => updateProfileData({ recently_retrained: !profileData.recently_retrained })}
              className="flex items-center gap-3 w-full p-3 bg-[#F9FBFF] border border-[#E8EDF2] hover:border-[#F59E0B]/30 transition-all"
              style={{ borderRadius: '10px' }}
            >
              <div className={`w-5 h-5 border-2 flex items-center justify-center transition-all shrink-0 ${
                profileData.recently_retrained
                  ? 'bg-[#F59E0B] border-[#F59E0B]'
                  : 'bg-white border-[#D1D9E6]'
              }`} style={{ borderRadius: '6px' }}>
                {profileData.recently_retrained && (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7"></path>
                  </svg>
                )}
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm text-[#111827]">Recently Retrained / Reskilled</div>
              </div>
            </button>
          </div>
        </div>
      </DSSurfaceCard>

      <DSSurfaceCard className="p-8">
        <div className="space-y-8">
          {/* Employment */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
                <div className="text-[#111827]">Employment</div>
              </div>
            </div>
            <div className="space-y-4 ml-6">
              {employmentEntries.map((entry) => (
                <ExperienceCard
                  key={entry.id}
                  entry={entry}
                  type="employment"
                  isEditing={editingId === entry.id}
                  onEdit={() => setEditingId(entry.id)}
                  onSave={() => handleSave('employment')}
                  onDelete={() => handleDelete(entry.id, 'employment')}
                  onUpdate={(field, value) => updateEntry(entry.id, 'employment', field, value)}
                />
              ))}
              <button
                onClick={() => addNewEntry('employment')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#6B7280] hover:text-[#7DBBFF] bg-white hover:bg-[#F9F9FA] border border-black/[0.08] hover:border-[#7DBBFF]/30 transition-all w-full"
                style={{ borderRadius: '12px' }}
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                <span>Add New Experience</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-black/[0.08]" />

          {/* Education */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
                <div className="text-[#111827]">Education</div>
              </div>
            </div>
            <div className="ml-6 p-4 bg-[#F9F9FA] border border-black/[0.08]" style={{ borderRadius: '12px' }}>
              {educationEntries.map((entry) => (
                <EducationCard
                  key={entry.id}
                  entry={entry}
                  isEditing={editingId === entry.id}
                  onEdit={() => setEditingId(entry.id)}
                  onSave={() => handleSave('education')}
                  onDelete={() => handleDelete(entry.id, 'education')}
                  onUpdate={(field, value) => updateEntry(entry.id, 'education', field, value)}
                />
              ))}
              <button
                onClick={() => addNewEntry('education')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#6B7280] hover:text-[#7DBBFF] bg-white hover:bg-[#F9F9FA] border border-black/[0.08] hover:border-[#7DBBFF]/30 transition-all w-full"
                style={{ borderRadius: '12px' }}
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                <span>Add New Education</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-black/[0.08]" />

          {/* Passion Projects */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
                <div className="text-[#111827]">Passion Projects</div>
              </div>
            </div>
            <div className="space-y-4 ml-6">
              {passionProjects.map((entry) => (
                <ProjectCard
                  key={entry.id}
                  entry={entry}
                  type="passion"
                  isEditing={editingId === entry.id}
                  onEdit={() => setEditingId(entry.id)}
                  onSave={() => handleSave('passion')}
                  onDelete={() => handleDelete(entry.id, 'passion')}
                  onUpdate={(field, value) => updateEntry(entry.id, 'passion', field, value)}
                />
              ))}
              <button
                onClick={() => addNewEntry('passion')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#6B7280] hover:text-[#7DBBFF] bg-white hover:bg-[#F9F9FA] border border-black/[0.08] hover:border-[#7DBBFF]/30 transition-all w-full"
                style={{ borderRadius: '12px' }}
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                <span>Add New Project</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-black/[0.08]" />

          {/* Volunteer Work */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
                <div className="text-[#111827]">Volunteer Work</div>
              </div>
            </div>
            <div className="space-y-4 ml-6">
              {volunteerWork.map((entry) => (
                <ProjectCard
                  key={entry.id}
                  entry={entry}
                  type="volunteer"
                  isEditing={editingId === entry.id}
                  onEdit={() => setEditingId(entry.id)}
                  onSave={() => handleSave('volunteer')}
                  onDelete={() => handleDelete(entry.id, 'volunteer')}
                  onUpdate={(field, value) => updateEntry(entry.id, 'volunteer', field, value)}
                />
              ))}
              <button
                onClick={() => addNewEntry('volunteer')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#6B7280] hover:text-[#7DBBFF] bg-white hover:bg-[#F9F9FA] border border-black/[0.08] hover:border-[#7DBBFF]/30 transition-all w-full"
                style={{ borderRadius: '12px' }}
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                <span>Add Volunteer Work</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-black/[0.08]" />

          {/* Extracurricular Activities */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
                <div className="text-[#111827]">Extracurricular Activities</div>
              </div>
            </div>
            <div className="space-y-4 ml-6">
              {extracurricular.map((entry) => (
                <ProjectCard
                  key={entry.id}
                  entry={entry}
                  type="extracurricular"
                  isEditing={editingId === entry.id}
                  onEdit={() => setEditingId(entry.id)}
                  onSave={() => handleSave('extracurricular')}
                  onDelete={() => handleDelete(entry.id, 'extracurricular')}
                  onUpdate={(field, value) => updateEntry(entry.id, 'extracurricular', field, value)}
                />
              ))}
              <button
                onClick={() => addNewEntry('extracurricular')}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#6B7280] hover:text-[#7DBBFF] bg-white hover:bg-[#F9F9FA] border border-black/[0.08] hover:border-[#7DBBFF]/30 transition-all w-full"
                style={{ borderRadius: '12px' }}
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                <span>Add Activity</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-black/[0.08]" />

          {/* Certifications */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
              <div className="text-[#111827]">Certifications & achievements</div>
            </div>
            <div className="ml-6 space-y-3">
              {certifications.map((cert, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-3 bg-[#F9F9FA] border border-black/[0.08] hover:shadow-sm transition-shadow"
                  style={{ borderRadius: '12px' }}
                >
                  {editingCertIndex === index ? (
                    <EditableInput
                      value={cert}
                      onChange={(value) => updateCertification(index, value)}
                      placeholder="e.g. UX Certification, Nielsen Norman Group"
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 text-[#111827]">{cert}</span>
                  )}
                  <div className="flex items-center gap-2">
                    {editingCertIndex === index ? (
                      <button
                        onClick={saveCertification}
                        className="p-2 text-[#7DBBFF] hover:text-[#6aabef] hover:bg-white transition-colors"
                        style={{ borderRadius: '8px' }}
                      >
                        <Save className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingCertIndex(index)}
                        className="p-2 text-[#6B7280] hover:text-[#111827] hover:bg-white transition-colors"
                        style={{ borderRadius: '8px' }}
                      >
                        <Edit3 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteCertification(index)}
                      className="p-2 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-white transition-colors"
                      style={{ borderRadius: '8px' }}
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
              
              {isAddingCert ? (
                <div 
                  className="flex items-center gap-2 p-3 bg-[#F9F9FA] border border-[#7DBBFF] shadow-sm"
                  style={{ borderRadius: '12px' }}
                >
                  <EditableInput
                    value={newCertValue}
                    onChange={setNewCertValue}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={addCertification}
                      className="p-2 text-[#7DBBFF] hover:text-[#6aabef] hover:bg-white transition-colors"
                      style={{ borderRadius: '8px' }}
                    >
                      <Save className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingCert(false);
                        setNewCertValue('');
                      }}
                      className="p-2 text-[#9CA3AF] hover:text-[#EF4444] hover:bg-white transition-colors"
                      style={{ borderRadius: '8px' }}
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingCert(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#6B7280] hover:text-[#7DBBFF] bg-white hover:bg-[#F9F9FA] border border-black/[0.08] hover:border-[#7DBBFF]/30 transition-all w-full"
                  style={{ borderRadius: '12px' }}
                >
                  <Plus className="w-4 h-4" strokeWidth={1.5} />
                  <span>Add Certification</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </DSSurfaceCard>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 shadow-lg max-w-md w-full mx-4" style={{ borderRadius: '20px' }}>
            <h3 className="text-xl text-[#111827] mb-2">Remove Entry</h3>
            <p className="text-[#6B7280] mb-6">
              Are you sure you want to remove this experience? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setDeleteConfirmId(null);
                  setDeleteConfirmType(null);
                }}
                className="px-4 py-2 text-sm bg-white hover:bg-[#F9F9FA] border border-black/[0.08] text-[#111827] transition-colors"
                style={{ borderRadius: '10px' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm bg-[#EF4444] hover:bg-[#DC2626] text-white transition-colors"
                style={{ borderRadius: '10px' }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* CV Delete Confirmation Modal */}
      {showCVDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 shadow-lg max-w-md w-full mx-4" style={{ borderRadius: '20px' }}>
            <h3 className="text-xl text-[#111827] mb-2">Remove CV</h3>
            <p className="text-[#6B7280] mb-6">
              Are you sure you want to remove your uploaded CV? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCVDeleteConfirm(false)}
                className="px-4 py-2 text-sm bg-white hover:bg-[#F9F9FA] border border-black/[0.08] text-[#111827] transition-colors"
                style={{ borderRadius: '10px' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCV}
                className="px-4 py-2 text-sm bg-[#EF4444] hover:bg-[#DC2626] text-white transition-colors"
                style={{ borderRadius: '10px' }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}