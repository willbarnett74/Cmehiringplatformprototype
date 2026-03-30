import { useState } from 'react';
import { OverviewScreen } from './components/OverviewScreen';
import { ApplicantScreen } from './components/ApplicantScreen';
import { EmployerScreen } from './components/EmployerScreen';
import { DesignSystem } from './components/DesignSystem';
import { AssessmentLink } from './src/pages/AssessmentLink';
import { Sparkles, Palette } from 'lucide-react';
import { UserProfileProvider } from './contexts/UserProfileContext';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'applicant' | 'employer' | 'design' | 'assessment'>('overview');

  const handleNavigateToPath = (tab: 'applicant' | 'employer' | 'assessment') => {
    setActiveTab(tab);
  };

  return (
    <UserProfileProvider>
      <div className="min-h-screen bg-[#0a0a0f] text-white">
        {/* Top Navigation */}
        <nav className="border-b border-white/5 bg-[#0a0a0f]/60 backdrop-blur-2xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-12">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                    CMe
                  </h1>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-5 py-2 transition-all relative ${
                      activeTab === 'overview'
                        ? 'text-white'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {activeTab === 'overview' && (
                      <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/10" />
                    )}
                    <span className="relative">Overview</span>
                  </button>
                  <button
                    onClick={() => handleNavigateToPath('applicant')}
                    className={`px-5 py-2 transition-all relative ${
                      activeTab === 'applicant'
                        ? 'text-white'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {activeTab === 'applicant' && (
                      <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/10" />
                    )}
                    <span className="relative">Applicant View</span>
                  </button>
                  <button
                    onClick={() => handleNavigateToPath('employer')}
                    className={`px-5 py-2 transition-all relative ${
                      activeTab === 'employer'
                        ? 'text-white'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {activeTab === 'employer' && (
                      <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/10" />
                    )}
                    <span className="relative">Employer View</span>
                  </button>
                  <button
                    onClick={() => handleNavigateToPath('assessment')}
                    className={`px-5 py-2 transition-all relative ${
                      activeTab === 'assessment'
                        ? 'text-white'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {activeTab === 'assessment' && (
                      <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/10" />
                    )}
                    <span className="relative">Assessment Link</span>
                  </button>
                </div>
              </div>
              <div>
                <button
                  onClick={() => setActiveTab('design')}
                  className={`flex items-center gap-2 px-4 py-2 transition-all relative ${
                    activeTab === 'design'
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {activeTab === 'design' && (
                    <div className="absolute inset-0 bg-white/5 rounded-lg border border-white/10" />
                  )}
                  <Palette className="w-4 h-4 relative" strokeWidth={1.5} />
                  <span className="relative text-sm">Design System</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Screen Content */}
        <main>
          {activeTab === 'overview' && <OverviewScreen onNavigate={handleNavigateToPath} />}
          {activeTab === 'applicant' && <ApplicantScreen />}
          {activeTab === 'employer' && <EmployerScreen />}
          {activeTab === 'design' && <DesignSystem />}
          {activeTab === 'assessment' && <AssessmentLink />}
        </main>
      </div>
    </UserProfileProvider>
  );
}