import { useState } from 'react';
import { Compass } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

type Mode = 'signin' | 'signup';

export function LoginScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmSent, setConfirmSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
    } else {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role: 'candidate' } },
      });
      if (error) {
        setError(error.message);
      } else {
        setConfirmSent(true);
      }
    }

    setLoading(false);
  };

  if (confirmSent) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-12 h-12 bg-[#7dbbff] flex items-center justify-center mx-auto mb-6" style={{ borderRadius: '14px' }}>
            <Compass className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-xl font-semibold text-[#111827] mb-2">Check your email</h1>
          <p className="text-sm text-[#6B7280]">
            We sent a confirmation link to <span className="font-medium text-[#111827]">{email}</span>.
            Click it to activate your account, then come back to sign in.
          </p>
          <button
            onClick={() => { setConfirmSent(false); setMode('signin'); }}
            className="mt-6 text-sm text-[#7dbbff] hover:underline"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 bg-[#7dbbff] flex items-center justify-center" style={{ borderRadius: '12px' }}>
            <Compass className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <span className="text-xl font-semibold text-[#111827]">CMe</span>
        </div>

        {/* Card */}
        <div className="bg-white border border-black/[0.08] p-8" style={{ borderRadius: '20px' }}>
          {/* Mode toggle */}
          <div className="flex bg-[#F3F4F6] p-1 mb-6" style={{ borderRadius: '10px' }}>
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); }}
              className={`flex-1 py-1.5 text-sm font-medium transition-all ${
                mode === 'signin'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
              style={{ borderRadius: '8px' }}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-1.5 text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-white text-[#111827] shadow-sm'
                  : 'text-[#6B7280] hover:text-[#111827]'
              }`}
              style={{ borderRadius: '8px' }}
            >
              Create account
            </button>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  required
                  className="w-full px-3 py-2.5 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7dbbff]"
                  style={{ borderRadius: '10px' }}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-3 py-2.5 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7dbbff]"
                style={{ borderRadius: '10px' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                className="w-full px-3 py-2.5 bg-white border border-black/[0.08] text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7dbbff]"
                style={{ borderRadius: '10px' }}
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2" style={{ borderRadius: '8px' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium text-white bg-[#7dbbff] hover:bg-[#5aaeff] disabled:opacity-60 transition-colors"
              style={{ borderRadius: '10px' }}
            >
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#9CA3AF] mt-6">
          Your profile is private. Only matched employers can view it.
        </p>
      </div>
    </div>
  );
}
