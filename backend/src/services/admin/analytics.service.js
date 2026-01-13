/**
 * Admin Analytics Service
 * Handles analytics and reporting
 */
const prisma = require('../../lib/prisma');
const candidateRepository = require('../../repositories/candidate.repository');
const referrerRepository = require('../../repositories/referrer.repository');
const eoiLogRepository = require('../../repositories/eoi-log.repository');

class AnalyticsService {
  /**
   * Get analytics data
   */
  async getAnalytics(days = 30) {
    const daysNum = parseInt(days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    startDate.setHours(0, 0, 0, 0);

    // Summary stats
    const [totalEOIs, totalCandidates, totalReferrers, activeCandidates] = await Promise.all([
      eoiLogRepository.count(),
      candidateRepository.count(),
      prisma.referrer.count(),
      candidateRepository.count({ is_active: true, availability_status: 'Open' }),
    ]);

    // EOIs in selected period
    const periodEOIs = await eoiLogRepository.countByDateRange(startDate);

    // Top candidates by EOI count
    const candidateEOICounts = await eoiLogRepository.groupByCandidate(10);
    const topCandidateIds = candidateEOICounts.map((c) => c.candidateId);
    const topCandidatesData = await prisma.candidate.findMany({
      where: { id: { in: topCandidateIds } },
      select: {
        id: true,
        first_name: true,
        last_name_initial: true,
        target_roles: true,
        primary_skills: true,
        availability_status: true,
        is_active: true,
      },
    });

    const topCandidates = candidateEOICounts.map((eoi) => {
      const candidate = topCandidatesData.find((c) => c.id === eoi.candidateId);
      return {
        id: eoi.candidateId,
        name: candidate ? `${candidate.first_name} ${candidate.last_name_initial}.` : 'Unknown',
        roles: candidate?.target_roles || [],
        skills: candidate?.primary_skills || [],
        availability: candidate?.availability_status || 'Unknown',
        isActive: candidate?.is_active ?? false,
        eoiCount: eoi._count.candidateId,
      };
    });

    // Get candidates who received EOIs in period
    const allEOILogs = await prisma.eOILog.findMany({
      where: { sentAt: { gte: startDate } },
      select: { candidateId: true },
    });

    const eoiCandidateIds = [...new Set(allEOILogs.map((e) => e.candidateId))];
    const eoiCandidates = await prisma.candidate.findMany({
      where: { id: { in: eoiCandidateIds } },
      select: { primary_skills: true, target_roles: true },
    });

    // Aggregate skills
    const skillCounts = {};
    eoiCandidates.forEach((c) => {
      (c.primary_skills || []).forEach((skill) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([skill, count]) => ({ skill, count }));

    // Aggregate roles
    const roleCounts = {};
    eoiCandidates.forEach((c) => {
      (c.target_roles || []).forEach((role) => {
        roleCounts[role] = (roleCounts[role] || 0) + 1;
      });
    });
    const topRoles = Object.entries(roleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([role, count]) => ({ role, count }));

    // EOI trend
    const eoiLogsInPeriod = await prisma.eOILog.findMany({
      where: { sentAt: { gte: startDate } },
      select: { sentAt: true },
    });

    const countsByDate = {};
    eoiLogsInPeriod.forEach((log) => {
      const dateStr = log.sentAt.toISOString().split('T')[0];
      countsByDate[dateStr] = (countsByDate[dateStr] || 0) + 1;
    });

    const eoiTrend = [];
    for (let i = daysNum - 1; i >= 0; i--) {
      const dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dateStr = dayStart.toISOString().split('T')[0];
      eoiTrend.push({
        date: dateStr,
        count: countsByDate[dateStr] || 0,
      });
    }

    // Top referrers
    const referrerEOICounts = await eoiLogRepository.groupByReferrer(5);
    const topReferrerIds = referrerEOICounts.map((r) => r.referrerId);
    const topReferrersData = await prisma.referrer.findMany({
      where: { id: { in: topReferrerIds } },
      select: {
        id: true,
        full_name: true,
        company: true,
      },
    });

    const topReferrers = referrerEOICounts.map((eoi) => {
      const referrer = topReferrersData.find((r) => r.id === eoi.referrerId);
      return {
        id: eoi.referrerId,
        name: referrer?.full_name || 'Unknown',
        company: referrer?.company || '',
        eoiCount: eoi._count.referrerId,
      };
    });

    return {
      summary: {
        totalEOIs,
        totalCandidates,
        totalReferrers,
        activeCandidates,
        periodEOIs,
        periodDays: daysNum,
      },
      topCandidates,
      topSkills,
      topRoles,
      topReferrers,
      eoiTrend,
    };
  }

  /**
   * Export analytics as CSV
   */
  async exportAnalytics(days = 30) {
    const daysNum = parseInt(days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();

    // Fetch all data
    const [allReferrers, allCandidates, periodEOILogs] = await Promise.all([
      prisma.referrer.findMany({
        select: {
          id: true,
          email: true,
          full_name: true,
          company: true,
          role: true,
          linkedin: true,
          is_admin: true,
          createdAt: true,
          eoiLogs: {
            select: { id: true, sentAt: true },
          },
        },
        orderBy: [
          { eoiLogs: { _count: 'desc' } },
          { createdAt: 'desc' },
        ],
      }),
      prisma.candidate.findMany({
        select: {
          id: true,
          first_name: true,
          last_name_initial: true,
          target_roles: true,
          primary_skills: true,
          location: true,
          remote_ok: true,
          availability_status: true,
          is_active: true,
          short_profile: true,
          createdAt: true,
          eoiLogs: {
            select: { id: true, sentAt: true },
          },
        },
        orderBy: [
          { eoiLogs: { _count: 'desc' } },
          { createdAt: 'desc' },
        ],
      }),
      eoiLogRepository.findByDateRange(startDate, endDate),
    ]);

    // Calculate stats
    const totalEOIs = await eoiLogRepository.count();
    const periodEOIs = periodEOILogs.length;
    const activeCandidates = allCandidates.filter(c => c.is_active && c.availability_status === 'Open').length;
    const adminCount = allReferrers.filter(r => r.is_admin).length;

    // Aggregate skills and roles
    const skillCounts = {};
    const roleCounts = {};
    allCandidates.forEach((c) => {
      (c.primary_skills || []).forEach((skill) => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
      (c.target_roles || []).forEach((role) => {
        roleCounts[role] = (roleCounts[role] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    const topRoles = Object.entries(roleCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);

    // Build CSV
    const lines = [];
    const reportDate = new Date().toISOString().split('T')[0];
    const reportTime = new Date().toLocaleTimeString('en-US', { hour12: false });
    const periodStart = startDate.toISOString().split('T')[0];
    const periodEnd = endDate.toISOString().split('T')[0];

    // Header
    lines.push('REFERRAL DISCOVERY PORTAL - ANALYTICS REPORT');
    lines.push('');
    lines.push('Report Information');
    lines.push(`Generated On,${reportDate} ${reportTime}`);
    lines.push(`Report Period,${periodStart} to ${periodEnd} (${daysNum} days)`);
    lines.push('');
    lines.push('');

    // Executive Summary
    lines.push('EXECUTIVE SUMMARY');
    lines.push('');
    lines.push('Metric,Value');
    lines.push(`Total Expressions of Interest (All Time),${totalEOIs}`);
    lines.push(`Expressions of Interest (Report Period),${periodEOIs}`);
    lines.push(`Total Registered Referrers,${allReferrers.length}`);
    lines.push(`Admin Users,${adminCount}`);
    lines.push(`Total Candidates in Database,${allCandidates.length}`);
    lines.push(`Active & Available Candidates,${activeCandidates}`);
    lines.push(`Inactive or Paused Candidates,${allCandidates.length - activeCandidates}`);
    lines.push('');
    lines.push('');

    // Skills Analysis
    lines.push('SKILLS ANALYSIS');
    lines.push('Top skills across all candidates ranked by frequency');
    lines.push('');
    lines.push('Rank,Skill,Candidate Count,Percentage');
    topSkills.forEach(([skill, count], idx) => {
      const percentage = ((count / allCandidates.length) * 100).toFixed(1);
      lines.push(`${idx + 1},"${skill}",${count},${percentage}%`);
    });
    lines.push('');
    lines.push('');

    // Roles Analysis
    lines.push('ROLES ANALYSIS');
    lines.push('Top target roles across all candidates ranked by frequency');
    lines.push('');
    lines.push('Rank,Role,Candidate Count,Percentage');
    topRoles.forEach(([role, count], idx) => {
      const percentage = ((count / allCandidates.length) * 100).toFixed(1);
      lines.push(`${idx + 1},"${role}",${count},${percentage}%`);
    });
    lines.push('');
    lines.push('');

    // Referrer Directory
    lines.push('REFERRER DIRECTORY');
    lines.push('Complete list of registered referrers sorted by activity');
    lines.push('');
    lines.push('Full Name,Email Address,Company,Job Title,LinkedIn Profile,Account Type,Total EOIs Sent,EOIs in Period,Registration Date');
    allReferrers.forEach((r) => {
      const name = (r.full_name || '').replace(/"/g, '""');
      const company = (r.company || '').replace(/"/g, '""');
      const role = (r.role || '').replace(/"/g, '""');
      const linkedin = (r.linkedin || '').replace(/"/g, '""');
      const totalEOI = r.eoiLogs.length;
      const periodEOI = r.eoiLogs.filter(e => new Date(e.sentAt) >= startDate).length;
      const joined = new Date(r.createdAt).toISOString().split('T')[0];
      const accountType = r.is_admin ? 'Administrator' : 'Referrer';
      lines.push(`"${name}","${r.email}","${company}","${role}","${linkedin}","${accountType}",${totalEOI},${periodEOI},${joined}`);
    });
    lines.push('');
    lines.push('');

    // Candidate Directory
    lines.push('CANDIDATE DIRECTORY');
    lines.push('Complete list of candidates sorted by interest received');
    lines.push('');
    lines.push('Candidate ID,Display Name,Target Roles,Primary Skills,Location,Remote Eligible,Availability Status,Profile Status,Profile Summary,Total EOIs Received,EOIs in Period,Date Added');
    allCandidates.forEach((c) => {
      const name = `${c.first_name} ${c.last_name_initial}.`.replace(/"/g, '""');
      const roles = (c.target_roles || []).join('; ').replace(/"/g, '""');
      const skills = (c.primary_skills || []).join('; ').replace(/"/g, '""');
      const location = (c.location || '').replace(/"/g, '""');
      const profile = (c.short_profile || '').replace(/"/g, '""').substring(0, 200);
      const totalEOI = c.eoiLogs.length;
      const periodEOI = c.eoiLogs.filter(e => new Date(e.sentAt) >= startDate).length;
      const created = new Date(c.createdAt).toISOString().split('T')[0];
      const remoteEligible = c.remote_ok ? 'Yes' : 'No';
      const profileStatus = c.is_active ? 'Active' : 'Inactive';
      lines.push(`"${c.id}","${name}","${roles}","${skills}","${location}","${remoteEligible}","${c.availability_status}","${profileStatus}","${profile}",${totalEOI},${periodEOI},${created}`);
    });
    lines.push('');
    lines.push('');

    // EOI Transaction Log
    lines.push('EOI TRANSACTION LOG');
    lines.push(`Activity log for the report period (${periodStart} to ${periodEnd})`);
    lines.push('');
    if (periodEOILogs.length === 0) {
      lines.push('No EOI activity recorded during this period.');
    } else {
      lines.push('Date,Time,Referrer Name,Referrer Email,Referrer Company,Candidate ID,Candidate Name,Candidate Roles');
      periodEOILogs.forEach((log) => {
        const dateTime = new Date(log.sentAt);
        const date = dateTime.toISOString().split('T')[0];
        const time = dateTime.toLocaleTimeString('en-US', { hour12: false });
        const referrerName = (log.referrerName || '').replace(/"/g, '""');
        const referrerCompany = (log.referrerCompany || '').replace(/"/g, '""');
        const candidateName = (log.candidateName || '').replace(/"/g, '""');
        const roles = (log.candidateRoles || []).join('; ').replace(/"/g, '""');
        lines.push(`${date},${time},"${referrerName}","${log.referrerEmail}","${referrerCompany}","${log.candidateId}","${candidateName}","${roles}"`);
      });
    }
    lines.push('');
    lines.push('');

    // Footer
    lines.push('END OF REPORT');
    lines.push(`Total Records: ${allReferrers.length} referrers | ${allCandidates.length} candidates | ${periodEOILogs.length} EOI transactions`);

    const csvContent = lines.join('\n');
    const filename = `Referral-Portal-Analytics-Report-${reportDate}.csv`;

    return {
      content: csvContent,
      filename,
    };
  }

  /**
   * Get sample CSV template
   */
  getSampleCSV() {
    return `candidate_id,first_name,last_name_initial,target_roles,primary_skills,location,remote_ok,availability_status,short_profile,candidate_email,project1_title,project1_bullets,project2_title,project2_bullets
CAND001,John,D,"Senior Software Engineer, Tech Lead","TypeScript, React, Node.js, PostgreSQL",San Francisco,true,Open,"Experienced full-stack developer with 8+ years in fintech. Led teams of 5-10 engineers. Strong in system design and mentorship.",john.doe@example.com,E-commerce Platform,"Built scalable checkout system handling 10k+ transactions/day; Reduced page load time by 40%; Implemented real-time inventory sync",Payment Gateway Integration,"Designed payment processing pipeline; Integrated with Stripe and PayPal; Achieved 99.9% uptime"
CAND002,Sarah,M,"Backend Engineer, DevOps Engineer","Python, Django, AWS, Docker, Kubernetes",New York,true,Open,"Backend specialist with deep AWS expertise. 6 years experience in high-traffic systems. Passionate about automation and CI/CD.",sarah.m@example.com,Cloud Migration Project,"Migrated 50+ microservices to AWS; Reduced infrastructure costs by 35%; Implemented auto-scaling",Monitoring System,"Built centralized logging with ELK stack; Created custom alerting dashboards; Reduced incident response time by 60%"
CAND003,Michael,K,"Frontend Engineer, UI/UX Developer","JavaScript, Vue.js, CSS, Figma",Austin,false,Open,"Creative frontend developer with strong design sensibility. 5 years building responsive, accessible web applications.",michael.k@example.com,Design System Library,"Created component library used across 10+ products; Improved design consistency by 80%; Documented 50+ components",Mobile-First Redesign,"Led responsive redesign initiative; Improved mobile conversion by 45%; Achieved WCAG 2.1 AA compliance"`;
  }
}

module.exports = new AnalyticsService();

