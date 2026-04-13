import { ChevronRight, User, Briefcase, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface OverviewScreenProps {
  onNavigate: (tab: 'applicant' | 'employer' | 'assessment') => void;
}

export function OverviewScreen({ onNavigate }: OverviewScreenProps) {
  const [showPathModal, setShowPathModal] = useState(false);

  const handleGetStarted = () => {
    setShowPathModal(true);
  };

  const handlePathSelect = (path: 'applicant' | 'employer' | 'assessment') => {
    setShowPathModal(false);
    // Small delay for smooth transition
    setTimeout(() => {
      onNavigate(path);
    }, 300);
  };

  return (
    <div className="relative h-screen bg-[#fafafa] flex flex-col overflow-hidden">
      {/* Ambient background lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/3 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]" />
        <div className="absolute top-40 right-1/3 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="mb-8 text-[#111827] font-extrabold tracking-tight text-[3.3rem] leading-[1.1]">
            Hiring that understands
            <br />
            who people really are
          </h1>
          
          {/* Description */}
          <p className="text-[#374151] max-w-xl mx-auto leading-relaxed mb-10 text-lg">
            Move beyond résumé. CMe uses deep trait analysis and behavioral insights to create 
            meaningful matches between talent and opportunity.
          </p>

          {/* CTA Button */}
          <button 
            onClick={handleGetStarted}
            className="px-12 py-4 bg-[#7dbbff] hover:bg-[#6aabef] text-white transition-all mb-16 hover:shadow-lg hover:scale-105" 
            style={{ borderRadius: '50px' }}
          >
            Get started
          </button>

          {/* Animated Connection Visualization */}
          <div className="flex justify-center">
            <div className="relative w-[300px] h-[60px]">
              {/* Left Node - Applicant */}
              <motion.div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#7dbbff]/20 border-2 border-[#7dbbff]/40 flex items-center justify-center"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="w-6 h-6 rounded-full bg-[#7dbbff]" />
              </motion.div>

              {/* Right Node - Employer */}
              <motion.div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[#7dbbff]/20 border-2 border-[#7dbbff]/40 flex items-center justify-center"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1.5,
                }}
              >
                <div className="w-6 h-6 rounded-full bg-[#7dbbff]" />
              </motion.div>

              {/* Connecting Line */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 60">
                <motion.line
                  x1="24"
                  y1="30"
                  x2="276"
                  y2="30"
                  stroke="#7dbbff"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: [0, 1, 1, 0],
                    opacity: [0, 0.4, 0.4, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </svg>

              {/* Traveling Particle */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#7dbbff]"
                animate={{
                  left: ["24px", "276px"],
                  opacity: [0, 1, 1, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Path Selection Modal */}
      <AnimatePresence>
        {showPathModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setShowPathModal(false)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="fixed inset-0 z-50 flex items-center justify-center p-8 pointer-events-none"
            >
              <div className="relative bg-white p-10 shadow-2xl pointer-events-auto max-w-4xl w-full" style={{ borderRadius: '24px' }}>
                {/* Close Button */}
                <button
                  onClick={() => setShowPathModal(false)}
                  className="absolute top-6 right-6 p-2 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F9F9FA] transition-all"
                  style={{ borderRadius: '8px' }}
                >
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>

                {/* Header */}
                <div className="text-center mb-10">
                  <h2 className="text-3xl text-[#111827] font-bold mb-3">Choose Your Path</h2>
                  <p className="text-[#6B7280] text-lg">Select how you'd like to get started with CMe</p>
                </div>

                {/* Path Cards */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* Applicant Card */}
                  <motion.button
                    onClick={() => handlePathSelect('applicant')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative p-8 bg-gradient-to-br from-[#8B5CF6]/5 via-[#7DBBFF]/5 to-[#10B981]/5 border-2 border-[#8B5CF6]/20 hover:border-[#8B5CF6]/40 transition-all group overflow-hidden"
                    style={{ borderRadius: '16px' }}
                  >
                    {/* Gradient Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/0 via-[#7DBBFF]/0 to-[#10B981]/0 group-hover:from-[#8B5CF6]/10 group-hover:via-[#7DBBFF]/10 group-hover:to-[#10B981]/10 transition-all duration-500" />
                    
                    <div className="relative">
                      {/* Icon */}
                      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#7DBBFF] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <User className="w-8 h-8 text-white" strokeWidth={2} />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl text-[#111827] font-semibold mb-3">I'm an Applicant</h3>

                      {/* Tagline */}
                      <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
                        Discover your strengths, showcase what makes you unique, and get matched with roles that fit who you truly are.
                      </p>

                      {/* CTA */}
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#7DBBFF] text-white font-medium text-sm group-hover:shadow-lg transition-all" style={{ borderRadius: '12px' }}>
                        <span>Get Started</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                      </div>
                    </div>
                  </motion.button>

                  {/* Employer Card */}
                  <motion.button
                    onClick={() => handlePathSelect('employer')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative p-8 bg-gradient-to-br from-[#7DBBFF]/5 via-[#10B981]/5 to-[#8B5CF6]/5 border-2 border-[#7DBBFF]/20 hover:border-[#7DBBFF]/40 transition-all group overflow-hidden"
                    style={{ borderRadius: '16px' }}
                  >
                    {/* Gradient Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#7DBBFF]/0 via-[#10B981]/0 to-[#8B5CF6]/0 group-hover:from-[#7DBBFF]/10 group-hover:via-[#10B981]/10 group-hover:to-[#8B5CF6]/10 transition-all duration-500" />
                    
                    <div className="relative">
                      {/* Icon */}
                      <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-gradient-to-br from-[#7DBBFF] to-[#10B981] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <Briefcase className="w-8 h-8 text-white" strokeWidth={2} />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl text-[#111827] font-semibold mb-3">I'm an Employer</h3>

                      {/* Tagline */}
                      <p className="text-[#6B7280] text-sm leading-relaxed mb-6">
                        Find the right people faster by understanding what truly drives them, beyond skills and experience.
                      </p>

                      {/* CTA */}
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7DBBFF] to-[#10B981] text-white font-medium text-sm group-hover:shadow-lg transition-all" style={{ borderRadius: '12px' }}>
                        <span>Get Started</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                      </div>
                    </div>
                  </motion.button>
                </div>

                {/* Continue as Guest */}
                <div className="text-center pt-6 border-t border-black/[0.06]">
                  <p className="text-sm text-[#9CA3AF] mb-3">Want to explore first?</p>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => handlePathSelect('applicant')}
                      className="text-sm text-[#8B5CF6] hover:text-[#7c4ee5] font-medium transition-colors"
                    >
                      Preview Applicant View
                    </button>
                    <span className="text-[#D1D5DB]">•</span>
                    <button
                      onClick={() => handlePathSelect('employer')}
                      className="text-sm text-[#7DBBFF] hover:text-[#6aabef] font-medium transition-colors"
                    >
                      Preview Employer View
                    </button>
                    <span className="text-[#D1D5DB]">•</span>
                    <button
                      onClick={() => handlePathSelect('assessment')}
                      className="text-sm text-[#10B981] hover:text-[#0da574] font-medium transition-colors"
                    >
                      Assessment Link Demo
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}