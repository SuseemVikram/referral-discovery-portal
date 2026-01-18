export const DEFAULT_ROLES = [
  'Senior Software Engineer',
  'Tech Lead',
  'Software Engineer',
  'Frontend Developer',
  'Frontend Engineer',
  'Backend Developer',
  'Backend Engineer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Engineer',
  'Data Scientist',
  'Product Manager',
  'UI/UX Designer',
  'UI/UX Developer',
  'QA Engineer',
  'Mobile Developer',
  'Site Reliability Engineer',
];

export const DEFAULT_SKILLS = [
  'TypeScript',
  'JavaScript',
  'React',
  'Vue.js',
  'Node.js',
  'Python',
  'Java',
  'Go',
  'Django',
  'PostgreSQL',
  'MongoDB',
  'AWS',
  'Docker',
  'Kubernetes',
  'CSS',
  'Figma',
  'GraphQL',
  'Next.js',
];

export let AVAILABLE_ROLES = [...DEFAULT_ROLES];
export let AVAILABLE_SKILLS = [...DEFAULT_SKILLS];

export function mergeRolesAndSkills(dynamicRoles: string[], dynamicSkills: string[]) {
  const rolesSet = new Set([...DEFAULT_ROLES, ...dynamicRoles]);
  const skillsSet = new Set([...DEFAULT_SKILLS, ...dynamicSkills]);
  
  AVAILABLE_ROLES = Array.from(rolesSet).sort();
  AVAILABLE_SKILLS = Array.from(skillsSet).sort();
}
