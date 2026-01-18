'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { adminApi } from '@/lib/api/services/admin.api';
import { isAuthError } from '@/lib/types/errors';

interface Admin {
  id: string;
  email: string;
  full_name: string;
  company: string;
}

export default function AdminRolesPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);

  const loadAdmins = async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    try {
      const data = await adminApi.getAdmins();
      setAdmins(data.admins || []);
    } catch (err) {
      if (err instanceof Error && isAuthError(err)) {
        router.push('/login');
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, [isLoggedIn]);

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    setAddSuccess(null);

    if (!email.trim()) {
      setAddError('Please enter an email address');
      return;
    }

    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setAdding(true);

    try {
      const data = await adminApi.addAdmin(email.trim());
      const adminEmail = data?.admin?.email || email.trim();
      setAddSuccess(`Successfully made ${adminEmail} an admin`);
      setEmail('');
      loadAdmins();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add admin';
      setAddError(errorMessage);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string, adminEmail: string) => {
    if (!confirm(`Remove admin privileges from ${adminEmail}?`)) {
      return;
    }

    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    try {
      await adminApi.removeAdmin(adminId);
      setAdmins((prev) => prev.filter((a) => a.id !== adminId));
      setAddSuccess(`Removed admin privileges from ${adminEmail}`);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to remove admin');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100dvh-4rem)] min-h-[calc(100vh-4rem)] p-4 sm:p-6">
        <div className="max-w-xl mx-auto">
          <h1 className="page-title mb-6">Admin Roles</h1>
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
      <div className="min-h-[calc(100dvh-4rem)] min-h-[calc(100vh-4rem)] p-4 sm:p-6">
        <div className="max-w-xl mx-auto">
          <h1 className="page-title mb-6">Admin Roles</h1>
          <div className="alert alert-error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="page-title mb-6">Admin Roles</h1>

        {/* Add Admin Form */}
        <div className="card p-4 sm:p-6 mb-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Add New Admin</h2>
          <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter referrer email address"
              className="input flex-1 min-w-0"
              disabled={adding}
            />
            <button
              type="submit"
              disabled={adding}
              className="btn btn-primary w-full sm:w-auto"
            >
              {adding ? (
                <>
                  <div className="spinner !w-4 !h-4 !border-white !border-t-transparent" />
                  Adding...
                </>
              ) : (
                'Make Admin'
              )}
            </button>
          </form>
          {addError && (
            <div className="alert alert-error mt-4">{addError}</div>
          )}
          {addSuccess && (
            <div className="alert alert-success mt-4">{addSuccess}</div>
          )}
          <p className="mt-4 text-xs text-slate-500">
            Note: The email must belong to an existing referrer account.
          </p>
        </div>

        {/* Current Admins List */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Current Admins</h2>
            <span className="badge badge-blue !px-3 !py-1">
              {admins.length} Admin{admins.length !== 1 ? 's' : ''}
            </span>
          </div>

          {admins.length === 0 ? (
            <p className="text-slate-500 text-sm">No admins found</p>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => {
                const isCurrentUser = user?.email === admin.email;
                return (
                  <div
                    key={admin.id}
                    className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                      isCurrentUser ? 'bg-orange-50 border border-orange-100' : 'bg-slate-50 border border-slate-100'
                    }`}
                  >
                    <div>
                      <p className="font-medium text-slate-900">
                        {admin.full_name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-orange-600 font-normal">(You)</span>
                        )}
                      </p>
                      <p className="text-sm text-slate-600">{admin.email}</p>
                      <p className="text-xs text-slate-500">{admin.company}</p>
                    </div>
                    {!isCurrentUser && (
                      <button
                        onClick={() => handleRemoveAdmin(admin.id, admin.email)}
                        className="btn btn-danger !py-1.5 !px-3 !text-xs"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
