'use client';

import { useState } from 'react';

interface FiltersProps {
  filters: {
    roles: string[];
    skills: string[];
    location: string;
    availability_status: '' | 'Open' | 'Paused';
  };
  onChange: (filters: {
    roles: string[];
    skills: string[];
    location: string;
    availability_status: '' | 'Open' | 'Paused';
  }) => void;
}

const AVAILABLE_ROLES = [
  'Senior Software Engineer',
  'Tech Lead',
  'Backend Engineer',
  'DevOps Engineer',
  'Frontend Engineer',
  'UI/UX Developer',
];

const AVAILABLE_SKILLS = [
  'TypeScript',
  'React',
  'Node.js',
  'PostgreSQL',
  'Python',
  'Django',
  'AWS',
  'Docker',
  'Kubernetes',
  'JavaScript',
  'Vue.js',
  'CSS',
  'Figma',
];

export default function Filters({ filters, onChange }: FiltersProps) {
  const [expandedSections, setExpandedSections] = useState({
    roles: true,
    skills: false,
  });

  const toggleSection = (section: 'roles' | 'skills') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    if (checked) {
      onChange({ ...filters, roles: [...filters.roles, role] });
    } else {
      onChange({ ...filters, roles: filters.roles.filter((r) => r !== role) });
    }
  };

  const handleSkillChange = (skill: string, checked: boolean) => {
    if (checked) {
      onChange({ ...filters, skills: [...filters.skills, skill] });
    } else {
      onChange({ ...filters, skills: filters.skills.filter((s) => s !== skill) });
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, location: e.target.value });
  };

  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, availability_status: e.target.value as '' | 'Open' | 'Paused' });
  };

  const clearFilters = () => {
    onChange({ roles: [], skills: [], location: '', availability_status: '' });
  };

  const hasActiveFilters = filters.roles.length > 0 || filters.skills.length > 0 || filters.location || filters.availability_status;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-900">Filters</span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-slate-500 hover:text-orange-600 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Location */}
      <div className="px-4 py-4 border-b border-slate-100">
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
          Location
        </label>
        <input
          type="text"
          value={filters.location}
          onChange={handleLocationChange}
          placeholder="City or region..."
          className="input !py-2"
        />
      </div>

      {/* Availability */}
      <div className="px-4 py-4 border-b border-slate-100">
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
          Availability
        </label>
        <select
          value={filters.availability_status}
          onChange={handleAvailabilityChange}
          className="input !py-2"
        >
          <option value="">All</option>
          <option value="Open">Open</option>
          <option value="Paused">Paused</option>
        </select>
      </div>

      {/* Roles - Collapsible */}
      <div className="border-b border-slate-100">
        <button
          onClick={() => toggleSection('roles')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Roles {filters.roles.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-[10px] normal-case font-semibold">
                {filters.roles.length}
              </span>
            )}
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${expandedSections.roles ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.roles && (
          <div className="px-4 pb-3 space-y-1">
            {AVAILABLE_ROLES.map((role) => (
              <label
                key={role}
                className="flex items-center gap-2.5 py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filters.roles.includes(role)}
                  onChange={(e) => handleRoleChange(role, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-slate-700">{role}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Skills - Collapsible */}
      <div>
        <button
          onClick={() => toggleSection('skills')}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
        >
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Skills {filters.skills.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] normal-case font-semibold">
                {filters.skills.length}
              </span>
            )}
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${expandedSections.skills ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {expandedSections.skills && (
          <div className="px-4 pb-3 grid grid-cols-2 gap-1">
            {AVAILABLE_SKILLS.map((skill) => (
              <label
                key={skill}
                className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filters.skills.includes(skill)}
                  onChange={(e) => handleSkillChange(skill, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-xs text-slate-700">{skill}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
