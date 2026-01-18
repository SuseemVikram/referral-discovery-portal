import { useState, useEffect, useCallback } from 'react';
import { candidatesApi } from '../api/services/candidates.api';

export function useRolesAndSkills() {
  const [roles, setRoles] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMetadata = useCallback(async () => {
    try {
      const metadata = await candidatesApi.getFilterMetadata();
      setRoles(metadata.roles.sort());
      setSkills(metadata.skills.sort());
    } catch () {
      setRoles([]);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return { roles, skills, loading, refetch: fetchMetadata };
}
