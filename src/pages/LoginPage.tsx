import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { Mail, Lock, User, LogIn } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signupWithEmail(email, password, displayName, role);
      } else {
        await loginWithEmail(email, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative min-h-[calc(100vh-64px)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(37,99,235,0.06)_0%,transparent_60%)] pointer-events-none"></div>

      <GlassCard className="max-w-md w-full p-8 border-slate-200/50" delay={0.1}>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">
            {isSignUp ? 'Create JanVoice Account' : 'Sign In to Portal'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access secure citizen reports and AI recommendations
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-500 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
                  />
                  <User className="absolute left-3 top-3 text-slate-400" size={16} />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Select Access Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-sm bg-transparent"
                >
                  <option value="citizen">Citizen (Submit complaints, track status)</option>
                  <option value="mp">Member of Parliament (AI Recommendations, Charts, Chat)</option>
                  <option value="admin">Administrator (Moderation, clustering engine)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
              />
              <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm"
              />
              <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-6"
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn size={15} />
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
          </div>
          <span className="relative bg-white dark:bg-slate-900 px-3 text-[10px] text-slate-400 font-bold tracking-wider uppercase">Or Continue With</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <g transform="matrix(1, 0, 0, 1, 0, 0)">
              <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.83 21.56,11.45 21.35,11.1z" fill="#4285F4" />
              <path d="M12,20.8c2.64,0 4.87,-0.87 6.49,-2.37l-3.3,-2.6c-0.9,0.6 -2.07,0.97 -3.19,0.97 -2.46,0 -4.54,-1.66 -5.29,-3.9H3.32v2.7C4.94,18.8 8.24,20.8 12,20.8z" fill="#34A853" />
              <path d="M6.71,12.9c-0.2,-0.6 -0.31,-1.24 -0.31,-1.9s0.11,-1.3 0.31,-1.9V6.4H3.32C2.65,7.74 2.27,9.3 2.27,11s0.38,3.26 1.05,4.6L6.71,12.9z" fill="#FBBC05" />
              <path d="M12,5.2c1.44,0 2.73,0.5 3.74,1.46l2.8,-2.8C16.85,2.3 14.62,1.2 12,1.2 8.24,1.2 4.94,3.2 3.32,6.4l3.39,2.7C7.46,6.86 9.54,5.2 12,5.2z" fill="#EA4335" />
            </g>
          </svg>
          Google Identity SSO
        </button>

        <p className="mt-6 text-center text-xs text-slate-500">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary hover:underline font-semibold cursor-pointer"
          >
            {isSignUp ? 'Sign In' : 'Sign Up Here'}
          </button>
        </p>
      </GlassCard>
    </div>
  );
};
