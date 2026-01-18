import { useState, useEffect } from 'react';
import { candidatesApi } from '../api/services/candidates.api';

export function useRolesAndSkills() {
  const [roles, setRoles] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    candidatesApi.getFilterMetadata()
      .then((metadata) => {
        setRoles(metadata.roles.sort());
        setSkills(metadata.skills.sort());
      })
      .catch(() => {
        // Empty arrays if API fails - no candidates means no filters
        setRoles([]);
        setSkills([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { roles, skills, loading };
}
