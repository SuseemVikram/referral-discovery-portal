'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/AuthContext';
import { adminApi } from '@/lib/api/services/admin.api';
import AdminVisibilityToggle from '../components/AdminVisibilityToggle';
import AdminAvailabilitySelect from '../components/AdminAvailabilitySelect';
import { useRolesAndSkills } from '@/lib/hooks/useRolesAndSkills';

interface Candidate {
  id: string;
  first_name: string;
  last_name_initial: string;
  candidate_email: string;
  target_roles: string[];
  primary_skills: string[];
  availability_status: string;
  is_active: boolean;
}

export default function AdminCandidatesPage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailSearch, setEmailSearch] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);

  const { isLoggedIn } = useAuth();
  const { roles: COMMON_ROLES, skills: COMMON_SKILLS } = useRolesAndSkills();

  const loadCandidates = useCallback(async () => {
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const result = await adminApi.getCandidates({
        email: emailSearch.trim() || undefined,
        roles: selectedRoles.length > 0 ? selectedRoles.join(',') : undefined,
        skills: selectedSkills.length > 0 ? selectedSkills.join(',') : undefined,
      });

      setCandidates(result.candidates || []);
    } catch (err) {
      if (err instanceof Error && 'status' in err && (err.status === 401 || err.status === 403)) {
        router.push('/login');
        return;
      }
      // Silent error handling
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, emailSearch, selectedRoles, selectedSkills]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const handleVisibilityChange = (candidateId: string, newState: boolean) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, is_active: newState } : c))
    );
  };

  const handleAvailabilityChange = (candidateId: string, newStatus: 'Open' | 'Paused') => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, availability_status: newStatus } : c))
    );
  };

  const handleAddRole = (role: string) => {
    if (role && !selectedRoles.includes(role)) {
      setSelectedRoles((prev) => [...prev, role]);
    }
  };

  const handleRemoveRole = (role: string) => {
    setSelectedRoles((prev) => prev.filter((r) => r !== role));
  };

  const handleAddSkill = (skill: string) => {
    if (skill && !selectedSkills.includes(skill)) {
      setSelectedSkills((prev) => [...prev, skill]);
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills((prev) => prev.filter((s) => s !== skill));
  };

  const handleClearFilters = () => {
    setEmailSearch('');
    setSelectedRoles([]);
    setSelectedSkills([]);
  };

  const handleDelete = async (candidateId: string, candidateName: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${candidateName}"?\n\nThis action cannot be undone. All EOI history for this candidate will also be deleted.`
    );

    if (!confirmed) return;

    setDeleting(candidateId);

    try {
      await adminApi.deleteCandidate(candidateId);
      setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
      toast.success('Candidate deleted successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete candidate');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ALL ${candidates.length} candidates?\n\nThis action cannot be undone. All EOI history will also be deleted.\n\nType "DELETE ALL" to confirm.`
    );

    if (!confirmed) return;

    const doubleConfirm = window.prompt('Type "DELETE ALL" (case-sensitive) to confirm:');
    if (doubleConfirm !== 'DELETE ALL') {
      toast.error('Deletion cancelled. Confirmation text did not match.');
      return;
    }

    setDeletingAll(true);

    try {
      const result = await adminApi.deleteAllCandidates();
      setCandidates([]);
      toast.success(result.message || `All ${result.count} candidates deleted successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete all candidates');
    } finally {
      setDeletingAll(false);
    }
  };

  const hasFilters = emailSearch.trim() || selectedRoles.length > 0 || selectedSkills.length > 0;

  return (
    <div className="min-h-[calc(100dvh-4rem)] min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="page-header flex-col sm:flex-row gap-3 sm:gap-0">
          <h1 className="page-title">Candidate Management</h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span className="text-sm text-slate-500">
            {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
          </span>
            {candidates.length > 0 && (
              <button
                onClick={handleDeleteAll}
                disabled={deletingAll}
                className="btn btn-danger !py-1.5 !px-3 !text-xs"
              >
                {deletingAll ? 'Deleting All...' : 'Delete All'}
              </button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="card p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-slate-500 hover:text-orange-600 transition-colors min-h-[44px] px-2 -mr-2"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Search by Email
              </label>
              <input
                type="text"
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                placeholder="Enter email address..."
                className="input"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Filter by Role
              </label>
              <select
                value=""
                onChange={(e) => handleAddRole(e.target.value)}
                className="input"
              >
                <option value="">Select role to add...</option>
                {COMMON_ROLES.filter((r) => !selectedRoles.includes(r)).map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
                Filter by Skill
              </label>
              <select
                value=""
                onChange={(e) => handleAddSkill(e.target.value)}
                className="input"
              >
                <option value="">Select skill to add...</option>
                {COMMON_SKILLS.filter((s) => !selectedSkills.includes(s)).map((skill) => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedRoles.length > 0 || selectedSkills.length > 0) && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-500 mr-2">Active filters:</span>
              <div className="inline-flex flex-wrap gap-2 mt-1">
                {selectedRoles.map((role) => (
                  <span
                    key={role}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg"
                  >
                    <span className="text-slate-400">Role:</span> {role}
                    <button
                      onClick={() => handleRemoveRole(role)}
                      className="ml-0.5 text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {selectedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-lg"
                  >
                    <span className="text-emerald-500">Skill:</span> {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-0.5 text-emerald-400 hover:text-emerald-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="card">
            <div className="empty-state">
              <div className="spinner mx-auto" />
              <p className="mt-4 text-slate-500 text-sm">Loading candidates...</p>
            </div>
          </div>
        ) : candidates.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="empty-state-title">No candidates found</p>
              <p className="empty-state-text">Try adjusting your filters</p>
            </div>
          </div>
        ) : (
          <div className="table-container">
            <table className="table min-w-[640px]">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Target Roles</th>
                  <th>Skills</th>
                  <th>Availability</th>
                  <th>Visibility</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td className="font-medium text-slate-900">
                      {candidate.first_name} {candidate.last_name_initial}.
                    </td>
                    <td className="text-slate-600">
                      {candidate.candidate_email}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {candidate.target_roles.slice(0, 2).map((role, idx) => (
                          <span key={idx} className="badge badge-gray">
                            {role}
                          </span>
                        ))}
                        {candidate.target_roles.length > 2 && (
                          <span className="text-xs text-slate-400">
                            +{candidate.target_roles.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {candidate.primary_skills.slice(0, 2).map((skill, idx) => (
                          <span key={idx} className="badge badge-green">
                            {skill}
                          </span>
                        ))}
                        {candidate.primary_skills.length > 2 && (
                          <span className="text-xs text-slate-400">
                            +{candidate.primary_skills.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <AdminAvailabilitySelect
                        candidateId={candidate.id}
                        availability={candidate.availability_status as 'Open' | 'Paused'}
                        onChange={(newStatus) =>
                          handleAvailabilityChange(candidate.id, newStatus)
                        }
                      />
                    </td>
                    <td>
                      <AdminVisibilityToggle
                        candidateId={candidate.id}
                        isActive={candidate.is_active}
                        onChange={(newState) =>
                          handleVisibilityChange(candidate.id, newState)
                        }
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(candidate.id, `${candidate.first_name} ${candidate.last_name_initial}.`)}
                        disabled={deleting === candidate.id}
                        className="btn btn-danger !py-1.5 !px-3 !text-xs"
                      >
                        {deleting === candidate.id ? 'Deleting...' : 'Delete'}
                      </button>
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
