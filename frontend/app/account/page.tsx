'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { authApi } from '@/lib/api/services/auth.api';
import { isAuthError } from '@/lib/types/errors';
import { isProfileComplete, getReturnPath, clearReturnPath } from '@/lib/utils/profile-complete';
import { COUNTRY_CODES, CountryCode } from '@/lib/constants/country-codes';

export default function AccountPage() {
  const router = useRouter();
  const { isLoggedIn, isLoading: authLoading, isLoggingOut, logout, refreshUser, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    role: '',
    linkedin: '',
    phone_number: '',
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCode>(COUNTRY_CODES.find(c => c.code === 'IN') || COUNTRY_CODES[0]);
  const [countryCodeDropdownOpen, setCountryCodeDropdownOpen] = useState(false);
  const [countryCodeSearch, setCountryCodeSearch] = useState('');
  const countryCodeDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (authLoading) return;

    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    async function loadProfile() {
      try {
        const data = await authApi.getProfile();
        setUserEmail(data.email || '');
        
        // Parse phone_number to extract country code and phone number
        let phoneNumber = '';
        let countryCode = COUNTRY_CODES.find(c => c.code === 'IN') || COUNTRY_CODES[0];
        const phoneNumberValue = data.phone_number;
        if (phoneNumberValue) {
          const countryMatch = COUNTRY_CODES.find(c => phoneNumberValue.startsWith(c.dialCode));
          if (countryMatch) {
            countryCode = countryMatch;
            phoneNumber = phoneNumberValue.replace(countryMatch.dialCode, '');
          } else {
            phoneNumber = phoneNumberValue;
          }
        }
        
        setSelectedCountryCode(countryCode);
        setFormData({
          full_name: data.full_name || '',
          company: data.company || '',
          role: data.role || '',
          linkedin: data.linkedin || '',
          phone_number: phoneNumber,
        });
      } catch (err) {
        if (err instanceof Error && isAuthError(err)) {
          logout();
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [authLoading, isLoggedIn, router, logout]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('New password and confirm password do not match');
      return;
    }

    setChangingPassword(true);

    try {
      await authApi.changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      setSuccess('Password changed successfully');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      setShowPasswordSection(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      // Combine country code with phone number
      const phoneNumber = formData.phone_number.trim().replace(/\s+/g, '');
      const fullPhoneNumber = phoneNumber ? selectedCountryCode.dialCode + phoneNumber : '';
      
      const profileData = {
        ...formData,
        phone_number: fullPhoneNumber || undefined,
      };
      
      await authApi.updateProfile(profileData);
      await refreshUser();
      
      const updatedUser = await authApi.getProfile();
      if (isProfileComplete(updatedUser)) {
        const { path, selectedIds } = getReturnPath();
        
        if (path) {
          clearReturnPath();
          
          if (path.startsWith('/candidates') && selectedIds.length > 0) {
            sessionStorage.setItem('pendingEOI', JSON.stringify(selectedIds));
          }
          
          setTimeout(() => {
            router.push(path);
          }, 1000);
          return;
        }
      }
      
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="card p-8">
            <h1 className="text-2xl font-semibold text-slate-900 mb-6 text-center">My Account</h1>
            <div className="flex items-center justify-center py-12">
              <div className="spinner" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="card p-8">
          <h1 className="text-2xl font-semibold text-slate-900 mb-8 text-center">My Account</h1>
          
          {error && (
            <div className="alert alert-error mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              {/* Email - Read Only */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="input bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">Phone Number</label>
                <div className="relative overflow-visible" ref={countryCodeDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setCountryCodeDropdownOpen(!countryCodeDropdownOpen)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-sm text-slate-700 hover:text-slate-900 z-[11] bg-white px-2.5 py-1.5 rounded-md border border-slate-300 pointer-events-auto"
                  >
                    <span className="whitespace-nowrap">{selectedCountryCode.dialCode}</span>
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {countryCodeDropdownOpen && (
                    <div className="absolute left-0 top-full mt-1 w-full sm:w-80 bg-white border border-slate-300 rounded-lg shadow-xl z-[100] max-h-96 overflow-hidden flex flex-col">
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
                    placeholder="1234567890"
                    className="input !pl-[130px]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">LinkedIn</label>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            {/* Password Change Section */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Change Password</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Update your account password</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordSection(!showPasswordSection)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showPasswordSection ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {showPasswordSection && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">Current Password</label>
                    <input
                      type="password"
                      name="current_password"
                      value={passwordData.current_password}
                      onChange={handlePasswordChange}
                      required
                      className="input"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm font-medium text-slate-700">New Password</label>
                    <input
                      type="password"
                      name="new_password"
                      value={passwordData.new_password}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className="input"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-medium text-slate-700">Confirm New Password</label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={passwordData.confirm_password}
                      onChange={handlePasswordChange}
                      required
                      minLength={6}
                      className="input"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={handlePasswordSubmit}
                      disabled={changingPassword}
                      className="btn btn-primary w-full py-2.5"
                    >
                      {changingPassword ? (
                        <>
                          <div className="spinner !w-4 !h-4 !border-white !border-t-transparent" />
                          Changing...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary w-full py-3"
              >
                {saving ? (
                  <>
                    <div className="spinner !w-4 !h-4 !border-white !border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="btn btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
