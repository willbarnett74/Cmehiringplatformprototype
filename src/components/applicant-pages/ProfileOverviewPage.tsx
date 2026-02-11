import { User, MapPin, Briefcase, Link as LinkIcon, Video, Check, Upload, Camera, Play, X } from 'lucide-react';
import { DSSectionHeader, DSElevatedCard, DSTag, DSSurfaceCard } from '../ds/DSComponents';
import { useState, useEffect } from 'react';
import { useUserProfile } from '../../contexts/UserProfileContext';

export function ProfileOverviewPage() {
  const { profileData, updateProfileData } = useUserProfile();
  
  // State for Identity Header
  const [identityEdit, setIdentityEdit] = useState(false);
  const [name, setName] = useState("Alex Rivera");
  const [tagline, setTagline] = useState("Product Designer transitioning into Product Management");
  const [location, setLocation] = useState("San Francisco, CA");
  const [experience, setExperience] = useState("5 years experience");
  const [website, setWebsite] = useState("alexrivera.design");
  const [identitySaved, setIdentitySaved] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // State for Video Introduction
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });

  const showToast = (message: string) => {
    setToast({ message, show: true });
    setTimeout(() => setToast({ message: '', show: false }), 1500);
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        showToast('Profile photo updated ✅');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVideoFile(reader.result as string);
        showToast('Video added successfully 🎥');
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    const interval = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 30) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const finishRecording = () => {
    setIsRecording(false);
    setVideoFile('recorded');
    setRecordingTime(0);
    showToast('Video added successfully 🎥');
  };

  // State for My Story
  const [myStoryEdit, setMyStoryEdit] = useState(false);
  const [myStoryContent, setMyStoryContent] = useState(
    "I started as a visual designer but found my passion in solving complex product problems. Over the past 5 years, I've led design for early-stage startups and scaled products from 0 to 100k users. Now I'm exploring product management roles where I can leverage my design thinking and user empathy to drive strategy.\n\nI thrive in ambiguous environments, love working cross-functionally, and am energized by solving problems that have real impact on people's daily lives."
  );
  const [myStorySaved, setMyStorySaved] = useState(false);

  // State for Job Preferences
  const [jobPrefEdit, setJobPrefEdit] = useState(false);
  const [employmentType, setEmploymentType] = useState("Full-time, Open to Contract");
  const [workArrangement, setWorkArrangement] = useState("Remote, Hybrid Flexible");
  const [jobPrefSaved, setJobPrefSaved] = useState(false);

  // State for What Motivates Me (Values)
  const [motivatesEdit, setMotivatesEdit] = useState(false);
  const [motivatesContent, setMotivatesContent] = useState(
    "Making an impact, Continuous learning, Cross-functional collaboration, Solving complex problems, User-centered thinking"
  );
  const [motivatesSaved, setMotivatesSaved] = useState(false);

  // State for How I Work (Working Style Snapshot)
  const [workStyleEdit, setWorkStyleEdit] = useState(false);
  const [workStyleContent, setWorkStyleContent] = useState(
    "Clear communicator, Fast-paced executor, Collaborative team player, Detail-oriented"
  );
  const [workStyleSaved, setWorkStyleSaved] = useState(false);
  
  // Update context when values change
  useEffect(() => {
    // Extract motivation tags from the comma-separated string
    const tags = motivatesContent.split(',').map(t => t.trim()).filter(t => t.length > 0);
    updateProfileData({ motivation_tags: tags });
  }, [motivatesContent]);

  useEffect(() => {
    // Determine work style from content keywords
    const content = workStyleContent.toLowerCase();
    let style: 'Analytical' | 'Collaborative' | 'Creative' | 'Balanced' | null = 'Balanced';
    
    if (content.includes('collaborative') || content.includes('team')) {
      style = 'Collaborative';
    } else if (content.includes('analytical') || content.includes('data')) {
      style = 'Analytical';
    } else if (content.includes('creative') || content.includes('innovative')) {
      style = 'Creative';
    }
    
    updateProfileData({ work_style_selection: style });
  }, [workStyleContent]);

  // State for Ideal Work Environment
  const [workEnvEdit, setWorkEnvEdit] = useState(false);
  const [workEnvContent, setWorkEnvContent] = useState(
    "Startup culture, Autonomous teams, Fast feedback loops, Growth-minded peers"
  );
  const [workEnvSaved, setWorkEnvSaved] = useState(false);

  // Save confirmation helper
  const showSaveConfirmation = (setSavedState: (value: boolean) => void) => {
    setSavedState(true);
    setTimeout(() => setSavedState(false), 1500);
  };

  return (
    <div>
      <DSSectionHeader
        title="Profile Overview"
        description="Your core identity and how you present yourself"
      />

      {/* 1. Identity Header */}
      <DSElevatedCard glowColor="purple" className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="text-[#6B7280] text-sm">Basic Information</div>
          <button
            onClick={() => {
              if (identityEdit) {
                setIdentityEdit(false);
                showSaveConfirmation(setIdentitySaved);
              } else {
                setIdentityEdit(true);
              }
            }}
            className="text-sm text-[#7dbbff] hover:text-[#6aabef] transition-colors"
          >
            {identityEdit ? 'Save' : 'Edit'}
          </button>
        </div>
        <div className="flex items-start gap-8">
          {/* Avatar */}
          <div className="relative shrink-0 group">
            <label htmlFor="profileImageUpload" className="cursor-pointer block">
              <div
                className="w-24 h-24 flex items-center justify-center overflow-hidden relative"
                style={{ borderRadius: '20px' }}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#E6F1FD] flex items-center justify-center">
                    <User className="w-12 h-12 text-[#7dbbff]" strokeWidth={1.5} />
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  <Camera className="w-6 h-6 mb-1" strokeWidth={1.5} />
                  <span className="text-xs">Change Photo</span>
                </div>
              </div>
            </label>
            <input
              type="file"
              id="profileImageUpload"
              accept="image/*"
              onChange={handleProfileImageUpload}
              className="hidden"
            />
          </div>

          {/* Core Info */}
          <div className="flex-1">
            {identityEdit ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full mb-2 px-3 py-2 bg-white border border-[#7dbbff] text-[#111827] focus:outline-none hover:border-[#D1D5DB]"
                style={{
                  borderRadius: '8px',
                  boxShadow: '0 0 0 3px rgba(125, 187, 255, 0.12)',
                  fontSize: '1.5rem',
                  fontWeight: '600'
                }}
              />
            ) : (
              <h3 className="mb-2 text-[#111827]">{name}</h3>
            )}

            {identityEdit ? (
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Your role or career direction"
                className="w-full mb-4 px-3 py-2 bg-white border border-[#7dbbff] text-[#6B7280] text-sm focus:outline-none hover:border-[#D1D5DB]"
                style={{
                  borderRadius: '8px',
                  boxShadow: '0 0 0 3px rgba(125, 187, 255, 0.12)'
                }}
              />
            ) : (
              <p className="text-[#6B7280] mb-4">{tagline}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[#6B7280] text-sm mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" strokeWidth={1.5} />
                {identityEdit ? (
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, State"
                    className="px-2 py-1 bg-white border border-[#7dbbff] text-[#6B7280] text-sm focus:outline-none hover:border-[#D1D5DB]"
                    style={{
                      borderRadius: '6px',
                      boxShadow: '0 0 0 2px rgba(125, 187, 255, 0.12)'
                    }}
                  />
                ) : (
                  <span>{location}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" strokeWidth={1.5} />
                {identityEdit ? (
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g., 5 years experience"
                    className="px-2 py-1 bg-white border border-[#7dbbff] text-[#6B7280] text-sm focus:outline-none hover:border-[#D1D5DB]"
                    style={{
                      borderRadius: '6px',
                      boxShadow: '0 0 0 2px rgba(125, 187, 255, 0.12)'
                    }}
                  />
                ) : (
                  <span>{experience}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4" strokeWidth={1.5} />
                {identityEdit ? (
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="yourwebsite.com"
                    className="px-2 py-1 bg-white border border-[#7dbbff] text-[#7dbbff] text-sm focus:outline-none hover:border-[#D1D5DB]"
                    style={{
                      borderRadius: '6px',
                      boxShadow: '0 0 0 2px rgba(125, 187, 255, 0.12)'
                    }}
                  />
                ) : (
                  <span className="text-[#7dbbff] hover:text-[#6aabef] transition-colors cursor-pointer">
                    {website}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        {identitySaved && (
          <div className="flex items-center gap-1 text-xs text-[#10B981] mt-3">
            <Check className="w-3 h-3" />
            <span>Saved successfully</span>
          </div>
        )}
      </DSElevatedCard>

      {/* 2. My Story */}
      <DSSurfaceCard className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[#6B7280]">My Story</div>
          <button
            onClick={() => {
              if (myStoryEdit) {
                setMyStoryEdit(false);
                showSaveConfirmation(setMyStorySaved);
              } else {
                setMyStoryEdit(true);
              }
            }}
            className="text-sm text-[#7dbbff] hover:text-[#6aabef] transition-colors"
          >
            {myStoryEdit ? 'Save' : 'Edit'}
          </button>
        </div>
        <p className="text-sm text-[#6B7280] mb-3">Describe your background and what drives your career path.</p>
        {myStoryEdit ? (
          <>
            <textarea
              value={myStoryContent}
              onChange={(e) => setMyStoryContent(e.target.value)}
              placeholder="Share your story..."
              className="w-full px-3 py-2 bg-white border border-[#7dbbff] text-[#111827] leading-relaxed resize-none focus:outline-none hover:border-[#D1D5DB] min-h-[120px]"
              style={{
                borderRadius: '8px',
                boxShadow: '0 0 0 3px rgba(125, 187, 255, 0.12)'
              }}
              maxLength={500}
            />
            <div className="text-xs text-[#9CA3AF] text-right mt-1">
              {myStoryContent.length} / 500 characters
            </div>
          </>
        ) : (
          <p className="text-[#111827] leading-relaxed whitespace-pre-line">
            {myStoryContent}
          </p>
        )}
        {myStorySaved && (
          <div className="flex items-center gap-1 text-xs text-[#10B981] mt-2">
            <Check className="w-3 h-3" />
            <span>Saved successfully</span>
          </div>
        )}
      </DSSurfaceCard>

      {/* 3. Video Introduction */}
      <DSSurfaceCard className="mb-6">
        <div className="mb-3 text-[#6B7280]">Video Introduction</div>
        <div className="relative aspect-video bg-[#F9F9FA] border border-black/[0.08] flex items-center justify-center overflow-hidden group" style={{ borderRadius: '12px' }}>
          {videoFile ? (
            // Uploaded state
            <>
              <div className="absolute inset-0 bg-[#7dbbff]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative text-center">
                <div className="w-20 h-20 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-3 mx-auto">
                  <Play className="w-10 h-10 text-[#10B981]" strokeWidth={1.5} />
                </div>
                <p className="text-[#10B981] mb-1">Video uploaded</p>
                <p className="text-[#6B7280] text-sm mb-4">2:30 introduction video</p>
                <label htmlFor="videoReupload" className="cursor-pointer inline-block px-4 py-2 bg-white border border-[#7dbbff] text-[#7dbbff] text-sm hover:bg-[#7dbbff]/5 transition-colors" style={{ borderRadius: '8px' }}>
                  <Upload className="w-4 h-4 inline-block mr-2" />
                  Re-upload Video
                </label>
                <input
                  type="file"
                  id="videoReupload"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
              </div>
            </>
          ) : (
            // Initial state
            <>
              <div className="absolute inset-0 bg-[#7dbbff]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative text-center">
                <div className="w-16 h-16 rounded-full bg-[#7dbbff]/10 flex items-center justify-center mb-3 mx-auto group-hover:bg-[#7dbbff]/20 transition-colors">
                  <Video className="w-8 h-8 text-[#7dbbff]" strokeWidth={1.5} />
                </div>
                <p className="text-[#6B7280] text-sm mb-3">2:30 introduction video</p>
                <div className="flex gap-2 justify-center">
                  <label htmlFor="videoUpload" className="cursor-pointer px-4 py-2 bg-white border border-[#7dbbff] text-[#7dbbff] text-sm hover:bg-[#7dbbff]/5 transition-colors" style={{ borderRadius: '8px' }}>
                    <Upload className="w-4 h-4 inline-block mr-2" />
                    Upload Video
                  </label>
                  <input
                    type="file"
                    id="videoUpload"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <button onClick={startRecording} className="px-4 py-2 bg-white border border-[#7dbbff] text-[#7dbbff] text-sm hover:bg-[#7dbbff]/5 transition-colors" style={{ borderRadius: '8px' }}>
                    <Camera className="w-4 h-4 inline-block mr-2" />
                    Record Video
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </DSSurfaceCard>

      {/* Recording Modal */}
      {isRecording && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 max-w-md w-full mx-4" style={{ borderRadius: '20px' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[#111827]">Recording Video</h3>
              <button onClick={() => setIsRecording(false)} className="text-[#6B7280] hover:text-[#111827]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-[#EF4444]/10 flex items-center justify-center mb-4 mx-auto animate-pulse">
                <div className="w-4 h-4 rounded-full bg-[#EF4444]" />
              </div>
              <p className="text-4xl mb-2 text-[#111827]">
                00:{recordingTime.toString().padStart(2, '0')}
              </p>
              <p className="text-sm text-[#6B7280]">Recording in progress...</p>
            </div>
            <button
              onClick={finishRecording}
              className="w-full px-4 py-3 bg-[#7dbbff] text-white hover:bg-[#6aabef] transition-colors"
              style={{ borderRadius: '8px' }}
            >
              Finish Recording
            </button>
          </div>
        </div>
      )}

      {/* 4. Job Preferences */}
      <DSSurfaceCard className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[#6B7280]">Job Preferences</div>
          <button
            onClick={() => {
              if (jobPrefEdit) {
                setJobPrefEdit(false);
                showSaveConfirmation(setJobPrefSaved);
              } else {
                setJobPrefEdit(true);
              }
            }}
            className="text-sm text-[#7dbbff] hover:text-[#6aabef] transition-colors"
          >
            {jobPrefEdit ? 'Save' : 'Edit'}
          </button>
        </div>
        <p className="text-sm text-[#6B7280] mb-3">Specify your preferred employment type and work arrangement.</p>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-[#6B7280] mb-2">Employment Type</div>
            {jobPrefEdit ? (
              <input
                type="text"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                placeholder="e.g., Full-time, Part-time, Contract"
                className="w-full px-3 py-2 bg-white border border-[#7dbbff] text-[#111827] text-sm focus:outline-none hover:border-[#D1D5DB]"
                style={{
                  borderRadius: '8px',
                  boxShadow: '0 0 0 3px rgba(125, 187, 255, 0.12)'
                }}
              />
            ) : (
              <p className="text-[#111827] text-sm">{employmentType}</p>
            )}
          </div>
          <div>
            <div className="text-sm text-[#6B7280] mb-2">Work Arrangement</div>
            {jobPrefEdit ? (
              <input
                type="text"
                value={workArrangement}
                onChange={(e) => setWorkArrangement(e.target.value)}
                placeholder="e.g., Remote, Hybrid, On-site"
                className="w-full px-3 py-2 bg-white border border-[#7dbbff] text-[#111827] text-sm focus:outline-none hover:border-[#D1D5DB]"
                style={{
                  borderRadius: '8px',
                  boxShadow: '0 0 0 3px rgba(125, 187, 255, 0.12)'
                }}
              />
            ) : (
              <p className="text-[#111827] text-sm">{workArrangement}</p>
            )}
          </div>
        </div>
        {jobPrefSaved && (
          <div className="flex items-center gap-1 text-xs text-[#10B981] mt-2">
            <Check className="w-3 h-3" />
            <span>Saved successfully</span>
          </div>
        )}
      </DSSurfaceCard>

      {/* 5. What Motivates Me (Values) */}
      <DSSurfaceCard className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[#6B7280]">What Motivates Me</div>
          <button
            onClick={() => {
              if (motivatesEdit) {
                setMotivatesEdit(false);
                showSaveConfirmation(setMotivatesSaved);
              } else {
                setMotivatesEdit(true);
              }
            }}
            className="text-sm text-[#7dbbff] hover:text-[#6aabef] transition-colors"
          >
            {motivatesEdit ? 'Save' : 'Edit'}
          </button>
        </div>
        <p className="text-sm text-[#6B7280] mb-3">List the values or factors that energize you.</p>
        {motivatesEdit ? (
          <>
            <textarea
              value={motivatesContent}
              onChange={(e) => setMotivatesContent(e.target.value)}
              placeholder="What motivates you in your work?"
              className="w-full px-3 py-2 bg-white border border-[#7dbbff] text-[#111827] text-sm resize-none focus:outline-none hover:border-[#D1D5DB] min-h-[80px]"
              style={{
                borderRadius: '8px',
                boxShadow: '0 0 0 3px rgba(125, 187, 255, 0.12)'
              }}
              maxLength={300}
            />
            <div className="text-xs text-[#9CA3AF] text-right mt-1">
              {motivatesContent.length} / 300 characters
            </div>
          </>
        ) : (
          <p className="text-[#111827] text-sm">{motivatesContent}</p>
        )}
        {motivatesSaved && (
          <div className="flex items-center gap-1 text-xs text-[#10B981] mt-2">
            <Check className="w-3 h-3" />
            <span>Saved successfully</span>
          </div>
        )}
      </DSSurfaceCard>

      {/* 6. How I Work (Working Style Snapshot) */}
      <DSSurfaceCard className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[#6B7280]">How I Work</div>
          <button
            onClick={() => {
              if (workStyleEdit) {
                setWorkStyleEdit(false);
                showSaveConfirmation(setWorkStyleSaved);
              } else {
                setWorkStyleEdit(true);
              }
            }}
            className="text-sm text-[#7dbbff] hover:text-[#6aabef] transition-colors"
          >
            {workStyleEdit ? 'Save' : 'Edit'}
          </button>
        </div>
        <p className="text-sm text-[#6B7280] mb-3">Describe your collaboration, communication, and pace preferences.</p>
        {workStyleEdit ? (
          <>
            <textarea
              value={workStyleContent}
              onChange={(e) => setWorkStyleContent(e.target.value)}
              placeholder="How do you work best?"
              className="w-full px-3 py-2 bg-white border border-[#7dbbff] text-[#111827] text-sm resize-none focus:outline-none hover:border-[#D1D5DB] min-h-[80px]"
              style={{
                borderRadius: '8px',
                boxShadow: '0 0 0 3px rgba(125, 187, 255, 0.12)'
              }}
              maxLength={300}
            />
            <div className="text-xs text-[#9CA3AF] text-right mt-1">
              {workStyleContent.length} / 300 characters
            </div>
          </>
        ) : (
          <p className="text-[#111827] text-sm">{workStyleContent}</p>
        )}
        {workStyleSaved && (
          <div className="flex items-center gap-1 text-xs text-[#10B981] mt-2">
            <Check className="w-3 h-3" />
            <span>Saved successfully</span>
          </div>
        )}
      </DSSurfaceCard>

      {/* 7. Ideal Work Environment */}
      <DSSurfaceCard>
        <div className="flex items-center justify-between mb-2">
          <div className="text-[#6B7280]">Ideal Work Environment</div>
          <button
            onClick={() => {
              if (workEnvEdit) {
                setWorkEnvEdit(false);
                showSaveConfirmation(setWorkEnvSaved);
              } else {
                setWorkEnvEdit(true);
              }
            }}
            className="text-sm text-[#7dbbff] hover:text-[#6aabef] transition-colors"
          >
            {workEnvEdit ? 'Save' : 'Edit'}
          </button>
        </div>
        <p className="text-sm text-[#6B7280] mb-3">Share the type of setting where you do your best work.</p>
        {workEnvEdit ? (
          <input
            type="text"
            value={workEnvContent}
            onChange={(e) => setWorkEnvContent(e.target.value)}
            placeholder="Describe your ideal environment..."
            className="w-full px-3 py-2 bg-white border border-[#7dbbff] text-[#111827] text-sm focus:outline-none hover:border-[#D1D5DB]"
            style={{
              borderRadius: '8px',
              boxShadow: '0 0 0 3px rgba(125, 187, 255, 0.12)'
            }}
          />
        ) : (
          <p className="text-[#111827] text-sm">{workEnvContent}</p>
        )}
        {workEnvSaved && (
          <div className="flex items-center gap-1 text-xs text-[#10B981] mt-2">
            <Check className="w-3 h-3" />
            <span>Saved successfully</span>
          </div>
        )}
      </DSSurfaceCard>

      {/* Toast notification */}
      {toast.show && (
        <div 
          className="fixed bottom-5 right-5 bg-[#10B981] text-white px-4 py-3 shadow-lg transition-opacity duration-300"
          style={{ 
            borderRadius: '12px',
            opacity: toast.show ? 1 : 0
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}