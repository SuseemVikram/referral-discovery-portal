'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const { isLoggedIn, isLoading, isLoggingOut, isAdmin, user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [candidatesDropdownOpen, setCandidatesDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const candidatesDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (candidatesDropdownRef.current && !candidatesDropdownRef.current.contains(event.target as Node)) {
        setCandidatesDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setUserDropdownOpen(false);
    setCandidatesDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  /* Prevent body scroll when mobile menu is open */
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const isCandidatesActive = pathname === '/admin/candidates' || pathname === '/admin/import';

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
  };

  const getUserInitials = () => {
    if (!user?.full_name) return '?';
    const names = user.full_name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0][0].toUpperCase();
  };

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const showAuthButtons = !isAuthPage;
  const isAdminPage = pathname.startsWith('/admin');
  const isActive = (path: string) => pathname === path;

  const navLinkClass = (active: boolean) =>
    `px-3 py-2 text-sm font-medium rounded-lg transition-all ${
      active
        ? 'bg-slate-100 text-slate-900'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
    }`;

  const dropdownItemClass = (active: boolean) =>
    `block px-4 py-2.5 text-sm transition-colors ${
      active
        ? 'bg-slate-50 text-slate-900 font-medium'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  if (isLoading) {
    return (
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold text-orange-600 hover:text-orange-700 transition-colors">
            Referral
          </Link>
          <div className="spinner" />
        </div>
      </header>
    );
  }

  return (
    <>
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-semibold text-orange-600 hover:text-orange-700 transition-colors">
          Referral
        </Link>

        {/* Hamburger - mobile only */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden p-2 -mr-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {isLoggedIn ? (
            <>
              {/* Browse Candidates */}
              <Link
                href="/candidates"
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive('/candidates') && !isAdminPage
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-slate-600 hover:text-orange-600 hover:bg-slate-50'
                }`}
              >
                Browse Candidates
              </Link>

              {/* Admin Navigation */}
              {isAdmin && (
                <>
                  <div className="w-px h-6 bg-slate-200 mx-3" />
                  
                  <Link href="/admin/referrers" className={navLinkClass(isActive('/admin/referrers'))}>
                    Referrers
                  </Link>
                  <Link href="/admin/roles" className={navLinkClass(isActive('/admin/roles'))}>
                    Roles
                  </Link>
                  <Link href="/admin/eoi" className={navLinkClass(isActive('/admin/eoi'))}>
                    Logs
                  </Link>
                  <Link href="/admin/analytics" className={navLinkClass(isActive('/admin/analytics'))}>
                    Analytics
                  </Link>
                  
                  {/* Candidates Dropdown - Moved to end */}
                  <div className="relative" ref={candidatesDropdownRef}>
                    <button
                      onClick={() => setCandidatesDropdownOpen(!candidatesDropdownOpen)}
                      className={`flex items-center gap-1.5 ${navLinkClass(isCandidatesActive)}`}
                    >
                      Candidates
                      <svg
                        className={`w-4 h-4 transition-transform ${candidatesDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {candidatesDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
                        <Link href="/admin/candidates" className={dropdownItemClass(isActive('/admin/candidates'))}>
                          Manage
                        </Link>
                        <Link href="/admin/import" className={dropdownItemClass(isActive('/admin/import'))}>
                          Import
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* User Menu */}
              <div className="w-px h-6 bg-slate-200 mx-3" />
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isAdmin ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {getUserInitials()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-slate-900 leading-tight">
                      {user?.full_name || 'User'}
                    </div>
                    <div className="text-xs text-slate-500 leading-tight">
                      {isAdmin ? 'Admin' : 'Referrer'}
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                      <div className="text-sm font-medium text-slate-900">{user?.full_name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{user?.email}</div>
                      <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-md ${
                        isAdmin ? 'bg-orange-100 text-orange-700' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {isAdmin ? 'Administrator' : 'Referrer'}
                      </span>
                    </div>
                    <div className="py-1.5">
                      <Link href="/account" className={dropdownItemClass(isActive('/account'))}>
                        My Account
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 py-1.5">
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            showAuthButtons && (
              <>
                <Link
                  href="/candidates"
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    isActive('/candidates')
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-slate-600 hover:text-orange-600 hover:bg-slate-50'
                  }`}
                >
                  Browse Candidates
                </Link>
                <div className="w-px h-6 bg-slate-200 mx-3" />
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )
          )}
        </nav>
      </div>
    </header>

    {/* Mobile menu overlay */}
    {mobileMenuOpen && (
      <div
        className="fixed inset-0 z-40 bg-white overflow-y-auto md:hidden"
        style={{ top: 'calc(env(safe-area-inset-top, 0px) + 3.5rem)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile menu"
      >
        <div className="flex flex-col py-4 px-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Menu</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 -mr-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-1">
            <Link
              href="/candidates"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center min-h-[44px] px-4 rounded-lg text-base font-medium ${
                isActive('/candidates') && !pathname.startsWith('/admin')
                  ? 'bg-orange-50 text-orange-700'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Browse Candidates
            </Link>
            {isLoggedIn && isAdmin && (
              <>
                <div className="my-2 border-t border-slate-100" />
                <span className="px-4 pt-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</span>
                <Link href="/admin/referrers" onClick={() => setMobileMenuOpen(false)} className={`flex items-center min-h-[44px] px-4 rounded-lg text-base ${isActive('/admin/referrers') ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}>Referrers</Link>
                <Link href="/admin/roles" onClick={() => setMobileMenuOpen(false)} className={`flex items-center min-h-[44px] px-4 rounded-lg text-base ${isActive('/admin/roles') ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}>Roles</Link>
                <Link href="/admin/eoi" onClick={() => setMobileMenuOpen(false)} className={`flex items-center min-h-[44px] px-4 rounded-lg text-base ${isActive('/admin/eoi') ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}>Logs</Link>
                <Link href="/admin/analytics" onClick={() => setMobileMenuOpen(false)} className={`flex items-center min-h-[44px] px-4 rounded-lg text-base ${isActive('/admin/analytics') ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}>Analytics</Link>
                <Link href="/admin/candidates" onClick={() => setMobileMenuOpen(false)} className={`flex items-center min-h-[44px] px-4 rounded-lg text-base ${isActive('/admin/candidates') ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}>Candidates – Manage</Link>
                <Link href="/admin/import" onClick={() => setMobileMenuOpen(false)} className={`flex items-center min-h-[44px] px-4 rounded-lg text-base ${isActive('/admin/import') ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}>Candidates – Import</Link>
              </>
            )}
            {isLoggedIn && (
              <>
                <div className="my-2 border-t border-slate-100" />
                <div className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${isAdmin ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                      {getUserInitials()}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{user?.full_name || 'User'}</div>
                      <div className="text-sm text-slate-500">{user?.email}</div>
                    </div>
                  </div>
                </div>
                <Link href="/account" onClick={() => setMobileMenuOpen(false)} className={`flex items-center min-h-[44px] px-4 rounded-lg text-base ${isActive('/account') ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-700 hover:bg-slate-50'}`}>My Account</Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  disabled={isLoggingOut}
                  className="flex items-center min-h-[44px] px-4 rounded-lg text-base text-left text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </>
            )}
            {!isLoggedIn && showAuthButtons && (
              <>
                <div className="my-2 border-t border-slate-100" />
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center min-h-[44px] px-4 rounded-lg text-base text-slate-700 hover:bg-slate-50">Login</Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="flex items-center min-h-[44px] px-4 rounded-lg text-base font-medium bg-orange-600 text-white mx-4 mt-2 justify-center">Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    )}
    </>
  );
}
