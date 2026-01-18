'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { adminApi } from '@/lib/api/services/admin.api';
import { isAuthError } from '@/lib/types/errors';

interface Referrer {
  id: string;
  email: string;
  full_name: string;
  company: string;
  role: string;
  linkedin: string | null;
  is_admin: boolean;
  createdAt: string;
  eoiCount: number;
}

export default function AdminReferrersPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [referrers, setReferrers] = useState<Referrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReferrers() {
      if (!isLoggedIn) {
        router.push('/login');
        return;
      }

      try {
        const data = await adminApi.getReferrers();
        setReferrers(data.referrers || []);
      } catch (err) {
        if (err instanceof Error && isAuthError(err)) {
          router.push('/login');
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load referrers');
      } finally {
        setLoading(false);
      }
    }
    loadReferrers();
  }, [isLoggedIn, router]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="page-title mb-6">Referrers</h1>
          <div className="card">
            <div className="empty-state">
              <div className="spinner mx-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="page-title mb-6">Referrers</h1>
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    );
  }

  const totalEOIs = referrers.reduce((sum, r) => sum + r.eoiCount, 0);

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">Referrers</h1>
          <div className="flex gap-3">
            <span className="badge badge-blue !px-3 !py-1.5">
              {referrers.length} Total
            </span>
            <span className="badge badge-green !px-3 !py-1.5">
              {totalEOIs} EOIs Sent
            </span>
          </div>
        </div>

        {referrers.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="empty-state-title">No referrers yet</p>
              <p className="empty-state-text">Referrers will appear here once they sign up</p>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Role</th>
                  <th className="text-center">EOIs</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {referrers.map((referrer) => (
                  <tr key={referrer.id}>
                    <td>
                      <div className="flex flex-col gap-1.5">
                        <Link
                          href={`/admin/referrers/${referrer.id}`}
                          className="font-medium text-slate-900 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                          {referrer.full_name}
                        </Link>
                        {referrer.linkedin && (
                          <a
                            href={referrer.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 w-fit px-2 py-0.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="text-slate-600">{referrer.email}</td>
                    <td className="text-slate-600">{referrer.company || <span className="text-slate-400">—</span>}</td>
                    <td className="text-slate-600">{referrer.role || <span className="text-slate-400">—</span>}</td>
                    <td className="text-center">
                      <span className={`inline-flex items-center justify-center min-w-[2.5rem] px-2.5 py-1 rounded-full text-xs font-semibold ${
                        referrer.eoiCount > 0
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {referrer.eoiCount}
                      </span>
                    </td>
                    <td className="text-slate-500 text-sm">
                      {new Date(referrer.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
