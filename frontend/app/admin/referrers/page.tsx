'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
                      <div className="font-medium text-slate-900">{referrer.full_name}</div>
                      {referrer.linkedin && (
                        <a
                          href={referrer.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-orange-600 hover:text-orange-700"
                        >
                          LinkedIn →
                        </a>
                      )}
                    </td>
                    <td className="text-slate-600">{referrer.email}</td>
                    <td className="text-slate-600">{referrer.company}</td>
                    <td className="text-slate-600">{referrer.role}</td>
                    <td className="text-center">
                      <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-full text-xs font-semibold ${
                        referrer.eoiCount > 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {referrer.eoiCount}
                      </span>
                    </td>
                    <td className="text-slate-500 text-sm">
                      {new Date(referrer.createdAt).toLocaleDateString()}
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
