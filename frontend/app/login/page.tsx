'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import { useAuth } from '@/lib/AuthContext';
import { authApi } from '@/lib/api/services/auth.api';
import toast from 'react-hot-toast';

type LoginMethod = 'email' | 'google' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn, isLoading } = useAuth();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<LoginMethod>('google');
  const hasHandledSessionRef = useRef(false);
  
  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.replace('/candidates');
    }
  }, [isLoggedIn, isLoading, router]);
  
  // Handle NextAuth session token (only for Google OAuth callback)
  useEffect(() => {
    if (session && (session as any).token && !hasHandledSessionRef.current && !isLoggedIn) {
      hasHandledSessionRef.current = true;
      login((session as any).token);
      toast.success('Logged in successfully!');
    }
  }, [session, login, isLoggedIn]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone_number: '',
    otp: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await authApi.login({
        email: formData.email,
        password: formData.password,
      });

      login(result.token);
      toast.success('Logged in successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn('google', { callbackUrl: '/candidates' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(errorMessage);
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    if (!formData.phone_number) {
      setError('Phone number is required');
      return;
    }

    setSendingOTP(true);
    setError(null);

    try {
      await authApi.requestOTP(formData.phone_number);
      setOtpSent(true);
      toast.success('OTP sent to your phone number');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSendingOTP(false);
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await authApi.verifyOTP(formData.phone_number, formData.otp);
      login(result.token);
      toast.success('Logged in successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'OTP verification failed';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="spinner mx-auto" />
      </div>
    );
  }

  // Don't render login form if already logged in (will redirect)
  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
            <p className="text-slate-500 mt-2">Sign in to your account to continue</p>
          </div>
          
          {error && (
            <div className="alert alert-error mb-6">
              {error}
            </div>
          )}
          
          {/* Method Selector */}
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setMethod('email')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                method === 'email'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => setMethod('google')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                method === 'google'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => setMethod('otp')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                method === 'otp'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mobile
            </button>
          </div>

          {/* Email/Password Form */}
          {method === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3"
            >
              {loading ? (
                <>
                  <div className="spinner !w-4 !h-4 !border-white !border-t-transparent" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
          )}

          {/* Google Sign In */}
          {method === 'google' && (
            <div className="space-y-5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-white border border-slate-300 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="spinner !w-4 !h-4" />
                    <span className="text-slate-700 font-medium">Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="text-slate-700 font-medium text-[15px]">Continue with Google</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Mobile OTP Form */}
          {method === 'otp' && (
            <form onSubmit={handleOTPSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    className="input flex-1"
                    placeholder="+91 12345 67890"
                    disabled={otpSent}
                  />
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleRequestOTP}
                      disabled={sendingOTP}
                      className="btn btn-secondary px-4 whitespace-nowrap"
                    >
                      {sendingOTP ? (
                        <div className="spinner !w-4 !h-4" />
                      ) : (
                        'Send OTP'
                      )}
                    </button>
                  )}
                </div>
              </div>
              {otpSent && (
                <>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">
                      Enter OTP
                    </label>
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      required
                      maxLength={6}
                      className="input"
                      placeholder="123456"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setFormData((prev) => ({ ...prev, otp: '' }));
                      }}
                      className="btn btn-secondary flex-1"
                    >
                      Change Number
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn btn-primary flex-1 py-3"
                    >
                      {loading ? (
                        <>
                          <div className="spinner !w-4 !h-4 !border-white !border-t-transparent" />
                          Verifying...
                        </>
                      ) : (
                        'Verify OTP'
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
        
        <p className="mt-8 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-medium text-orange-600 hover:text-orange-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
