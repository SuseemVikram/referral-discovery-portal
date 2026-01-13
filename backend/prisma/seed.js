const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const candidates = [
    {
      first_name: 'Sarah',
      last_name_initial: 'M',
      candidate_email: 'sarah.m@example.com',
      target_roles: ['Senior Software Engineer', 'Tech Lead'],
      primary_skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
      location: 'San Francisco, CA',
      remote_ok: true,
      short_profile: 'Experienced full-stack engineer with 8+ years building scalable web applications.',
      projects: {
        title: 'E-commerce Platform',
        bullets: [
          'Built microservices architecture serving 1M+ users',
          'Reduced API response time by 60%',
          'Implemented real-time inventory management system',
        ],
      },
      availability_status: 'Open',
    },
    {
      first_name: 'James',
      last_name_initial: 'K',
      candidate_email: 'james.k@example.com',
      target_roles: ['Backend Engineer', 'DevOps Engineer'],
      primary_skills: ['Python', 'Django', 'AWS', 'Docker', 'Kubernetes'],
      location: 'New York, NY',
      remote_ok: false,
      short_profile: 'Backend specialist focused on cloud infrastructure and API design.',
      projects: {
        title: 'Cloud Migration Project',
        bullets: [
          'Migrated legacy system to AWS with zero downtime',
          'Designed RESTful APIs handling 10K+ requests/min',
          'Set up CI/CD pipelines reducing deployment time by 80%',
        ],
      },
      availability_status: 'Open',
    },
    {
      first_name: 'Maria',
      last_name_initial: 'R',
      candidate_email: 'maria.r@example.com',
      target_roles: ['Frontend Engineer', 'UI/UX Developer'],
      primary_skills: ['JavaScript', 'React', 'Vue.js', 'CSS', 'Figma'],
      location: 'Austin, TX',
      remote_ok: true,
      short_profile: 'Creative frontend developer passionate about user experience and modern web design.',
      projects: {
        title: 'Design System Implementation',
        bullets: [
          'Created reusable component library used across 5+ products',
          'Improved page load performance by 45%',
          'Collaborated with design team to implement new UI patterns',
        ],
      },
      availability_status: 'Open',
    },
  ];

  for (const candidate of candidates) {
    await prisma.candidate.upsert({
      where: { candidate_email: candidate.candidate_email },
      update: {},
      create: candidate,
    });
  }

  console.log('Seeded 3 candidates');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

