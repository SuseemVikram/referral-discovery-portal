'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useAuth } from '@/lib/AuthContext';
import { authApi } from '@/lib/api/services/auth.api';
import toast from 'react-hot-toast';
import { COUNTRY_CODES, CountryCode } from '@/lib/constants/country-codes';

type SignupMethod = 'email' | 'google' | 'otp';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoggedIn, isLoading, refreshUser } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Get phone from URL if redirected from login
  const phoneFromUrl = searchParams.get('phone');
  const methodFromUrl = searchParams.get('method') as SignupMethod | null;
  const [method, setMethod] = useState<SignupMethod>(methodFromUrl === 'otp' ? 'otp' : 'google');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    company: '',
    role: '',
    linkedin: '',
    consent: false,
    phone_number: '',
    otp: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOTP, setSendingOTP] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>(COUNTRY_CODES.find(c => c.code === 'IN') || COUNTRY_CODES[0]);
  const [countryCodeDropdownOpen, setCountryCodeDropdownOpen] = useState(false);
  const [countryCodeSearch, setCountryCodeSearch] = useState('');
  const countryCodeDropdownRef = useRef<HTMLDivElement>(null);

  // Pre-fill phone number from URL if redirected from login
  useEffect(() => {
    if (phoneFromUrl && method === 'otp') {
      // Extract country code and phone number from full phone number
      const fullPhone = decodeURIComponent(phoneFromUrl);
      const countryMatch = COUNTRY_CODES.find(c => fullPhone.startsWith(c.dialCode));
      if (countryMatch) {
        setSelectedCountryCode(countryMatch);
        const phoneNumber = fullPhone.replace(countryMatch.dialCode, '');
        setFormData(prev => ({
          ...prev,
          phone_number: phoneNumber,
        }));
      } else {
        // If no country code match, just set the full number
        setFormData(prev => ({
          ...prev,
          phone_number: fullPhone,
        }));
      }
      // If redirected from login (phone not found), mark OTP as sent
      // But user needs to request a NEW OTP (cannot reuse the one from login)
      setOtpSent(false); // User needs to request new OTP
    }
  }, [phoneFromUrl, method]);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.replace('/candidates');
    }
  }, [isLoggedIn, isLoading, router]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryCodeDropdownRef.current && !countryCodeDropdownRef.current.contains(event.target as Node)) {
        setCountryCodeDropdownOpen(false);
      }
    }
    if (countryCodeDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [countryCodeDropdownOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await authApi.signup({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        company: formData.company,
        role: formData.role,
        linkedin: formData.linkedin,
        consent: formData.consent,
      });

      login(result.token);
      toast.success('Account created successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
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
      await signIn('google', { callbackUrl: '/account' });
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
      // Combine country code with phone number
      const phoneNumber = formData.phone_number.trim().replace(/\s+/g, '');
      const fullPhoneNumber = selectedCountryCode.dialCode + phoneNumber;
      // For signup, set for_signup=true to allow OTP even if phone doesn't exist
      await authApi.requestOTP(fullPhoneNumber, true);
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
      // Combine country code with phone number
      const phoneNumber = formData.phone_number.trim().replace(/\s+/g, '');
      const fullPhoneNumber = selectedCountryCode.dialCode + phoneNumber;
      
      // For mobile signup, all fields are required
      if (!formData.email || !formData.full_name || !formData.company || 
          !formData.role || !formData.linkedin) {
        setError('All fields (email, name, company, role, LinkedIn) are required for mobile signup');
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      // Prepare signup data for mobile signup
      // Phone number will be saved via phone_number field
      const signupData = {
        email: formData.email.trim(),
        full_name: formData.full_name.trim(),
        company: formData.company.trim(),
        role: formData.role.trim(),
        linkedin: formData.linkedin.trim(),
        phone_number: fullPhoneNumber,
      };

      const result = await authApi.verifyOTP(fullPhoneNumber, formData.otp, signupData);
      
      login(result.token);
      // Refresh user data to ensure profile is loaded
      await refreshUser();
      
      // For mobile signup, all details are filled, so profile is complete
      // Wait a bit for user data to be set in AuthContext, then redirect
      setTimeout(() => {
        toast.success('Account created successfully!');
        router.push('/candidates');
      }, 300);
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
      <div className="min-h-[calc(100dvh-4rem)] min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
        <div className="spinner mx-auto" />
      </div>
    );
  }

  // Don't render signup form if already logged in (will redirect)
  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        <div className="card p-4 sm:p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
            <p className="text-slate-500 mt-2">Start connecting with top candidates</p>
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
                <label className="block mb-2 text-sm font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="input"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">Email address</label>
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
                <label className="block mb-2 text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="input"
                  placeholder="Min. 6 characters"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-700">Company</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder="Acme Inc."
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-slate-700">Your Role</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="input"
                    placeholder="Recruiter"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">LinkedIn URL (optional)</label>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    required
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-600 leading-relaxed group-hover:text-slate-700">
                    I will contact candidates only for genuine referral/job opportunities.
                  </span>
                </label>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3"
              >
                {loading ? (
                  <>
                    <div className="spinner !w-4 !h-4 !border-white !border-t-transparent" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
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
            <form onSubmit={handleOTPSubmit} className="space-y-5 relative">
              {phoneFromUrl && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-orange-800 text-center">
                    Phone number verified. Please complete your profile details to continue.
                  </p>
                </div>
              )}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Phone Number
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1 overflow-visible min-w-0" ref={countryCodeDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setCountryCodeDropdownOpen(!countryCodeDropdownOpen)}
                      disabled={otpSent}
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900 z-[11] bg-white px-2.5 py-1.5 rounded-md border border-slate-300 pointer-events-auto min-h-[44px]"
                    >
                      <span className="whitespace-nowrap">{selectedCountryCode.dialCode}</span>
                      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {countryCodeDropdownOpen && (
                      <div className="absolute left-0 top-full mt-1 w-full min-w-[200px] sm:w-80 bg-white border border-slate-300 rounded-lg shadow-xl z-[100] max-h-[70vh] sm:max-h-96 overflow-hidden flex flex-col">
                        <div className="p-2 border-b border-slate-200">
                          <input
                            type="text"
                            placeholder="Search country..."
                            value={countryCodeSearch}
                            onChange={(e) => setCountryCodeSearch(e.target.value)}
                            className="input !py-2 w-full"
                            autoFocus
                          />
                        </div>
                        <div className="overflow-y-auto max-h-80">
                          {COUNTRY_CODES.filter((country) =>
                            country.name.toLowerCase().includes(countryCodeSearch.toLowerCase()) ||
                            country.dialCode.includes(countryCodeSearch) ||
                            country.code.toLowerCase().includes(countryCodeSearch.toLowerCase())
                          ).map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountryCode(country);
                                setCountryCodeDropdownOpen(false);
                                setCountryCodeSearch('');
                              }}
                              className={`w-full px-4 py-2 text-left hover:bg-slate-50 transition-colors flex items-center justify-between ${
                                selectedCountryCode.code === country.code ? 'bg-slate-100' : ''
                              }`}
                            >
                              <span className="text-sm text-slate-700">{country.name}</span>
                              <span className="text-sm font-medium text-slate-900">{country.dialCode}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      required
                      className="input flex-1 !pl-[110px] sm:!pl-[130px]"
                      placeholder="1234567890"
                      disabled={otpSent}
                    />
                  </div>
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleRequestOTP}
                      disabled={sendingOTP}
                      className="btn btn-secondary px-4 whitespace-nowrap w-full sm:w-auto"
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
                  
                  {/* Required fields for mobile signup */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        className="input"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">
                        Company <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        className="input"
                        placeholder="Company Name"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-slate-700">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        required
                        className="input"
                        placeholder="Your Role"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-slate-700">
                        LinkedIn Profile <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        required
                        className="input"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
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
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-orange-600 hover:text-orange-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100dvh-4rem)] min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
        <div className="spinner mx-auto" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
