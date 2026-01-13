'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/AuthContext';
import { adminApi } from '@/lib/api/services/admin.api';

interface EOILogEntry {
  sentAt: string;
  referrerEmail: string;
  referrerName: string;
  referrerCompany: string;
  candidateId: string;
  candidateName: string;
  candidateRoles: string[];
}

export default function AdminEOIPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [logs, setLogs] = useState<EOILogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLogs() {
      if (!isLoggedIn) {
        router.push('/login');
        return;
      }

      try {
        const data = await adminApi.getEOILogs();
        setLogs(data.logs || []);
      } catch (err) {
        if (err instanceof Error && ((err as any).status === 401 || (err as any).status === 403)) {
          router.push('/login');
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to load EOI logs');
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [isLoggedIn]);

  const handleExport = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setExporting(true);

    try {
      const blob = await adminApi.exportEOILogs();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eoi-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('EOI logs exported successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to export EOI logs');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="page-title mb-6">EOI Logs</h1>
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
          <h1 className="page-title mb-6">EOI Logs</h1>
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="page-header">
          <h1 className="page-title">EOI Logs</h1>
          {logs.length > 0 && (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="btn btn-primary"
            >
              {exporting ? (
                <>
                  <div className="spinner !w-4 !h-4 !border-white !border-t-transparent" />
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export CSV
                </>
              )}
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <p className="empty-state-title">No EOI logs found</p>
              <p className="empty-state-text">Once referrers send interest, their activity will appear here</p>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Referrer</th>
                  <th>Candidate</th>
                  <th>Roles</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, index) => (
                  <tr key={index}>
                    <td className="text-slate-900 font-medium">
                      {new Date(log.sentAt).toLocaleDateString()}
                    </td>
                    <td>
                      <p className="font-medium text-slate-900">{log.referrerName}</p>
                      <p className="text-xs text-slate-500">{log.referrerEmail}</p>
                      <p className="text-xs text-slate-500">{log.referrerCompany}</p>
                    </td>
                    <td>
                      <p className="font-medium text-slate-900">{log.candidateName}</p>
                      <p className="text-xs text-slate-500">ID: {log.candidateId}</p>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {log.candidateRoles.map((role, idx) => (
                          <span key={idx} className="badge badge-gray">
                            {role}
                          </span>
                        ))}
                      </div>
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
