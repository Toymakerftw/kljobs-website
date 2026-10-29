// Normalizes scraped job records from raw github pipeline data

const KNOWN_SKILLS = [
  'React', 'Node.js', 'Python', 'Java', 'Angular', 'Vue', 'Next.js', 'TypeScript', 'JavaScript',
  'Flutter', 'Android', 'iOS', 'Swift', 'Kotlin', 'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes',
  'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'BigQuery', 'DevOps', 'CI/CD', 'PHP', 'Laravel', 'Django',
  '.NET', 'C#', 'C++', 'Golang', 'Rust', 'Spring Boot', 'GraphQL', 'Tailwind', 'AI/ML',
  'Generative AI', 'LLM', 'Data Engineering', 'QA / Testing', 'Automation', 'Selenium',
  'UI/UX', 'Figma', 'Salesforce', 'SAP', 'Linux', 'Security', 'FastAPI', 'Flask', 'Redis',
  'Microservices', 'System Design', 'Power BI', 'Tableau', 'Looker'
];

export function cleanRoleTitle(rawRole, company, description) {
  const roleStr = (rawRole || '').trim();
  const compStr = (company || '').trim();
  const descStr = (description || '').trim();

  // If role is missing, or exactly equals company name, extract title from description
  const isDuplicateOfCompany = !roleStr || 
    roleStr.toLowerCase() === compStr.toLowerCase() ||
    roleStr.toLowerCase().replace(/[\s\.\(\)pvt ltd]+/g, '') === compStr.toLowerCase().replace(/[\s\.\(\)pvt ltd]+/g, '');

  if (isDuplicateOfCompany && descStr) {
    const lines = descStr.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0) {
      // Find the first line that looks like a title
      for (const line of lines.slice(0, 4)) {
        let candidate = line
          .replace(/^(job title|position|role|opening for|designation)\s*[:\-–]\s*/i, '')
          .replace(/^job description$/i, '')
          .trim();

        if (
          candidate &&
          candidate.length >= 3 &&
          candidate.length <= 85 &&
          !candidate.toLowerCase().includes('job description') &&
          !candidate.toLowerCase().startsWith('company:') &&
          !candidate.toLowerCase().startsWith('key responsibilities')
        ) {
          return candidate;
        }
      }
    }
  }

  // If role already has content, clean typical prefixes
  if (roleStr) {
    return roleStr
      .replace(/^(job title|position|role)\s*[:\-–]\s*/i, '')
      .trim();
  }

  return 'Software Professional';
}

export function parseExperienceLevel(desc, role) {
  const text = `${role || ''} ${desc || ''}`.toLowerCase();

  if (
    text.includes('trainee') ||
    text.includes('fresher') ||
    text.includes('intern') ||
    text.includes('0 year') ||
    text.includes('0-1 year') ||
    text.includes('0 - 1 year') ||
    text.includes('fresh graduate') ||
    text.includes('entry level')
  ) {
    return { level: 'Fresher / Trainee', tag: 'fresher', badgeColor: 'green' };
  }

  // Look for range e.g. 5-8 years, 2-5 years, 0-2 years
  const rangeMatch = text.match(/(\d+)\s*(?:-|to)\s*(\d+)\s*years?/);
  if (rangeMatch) {
    const minYears = parseInt(rangeMatch[1], 10);
    if (minYears >= 6) return { level: `${minYears}-${rangeMatch[2]} yrs (Senior+)`, tag: 'senior', badgeColor: 'amber' };
    if (minYears >= 3) return { level: `${minYears}-${rangeMatch[2]} yrs (Mid)`, tag: 'mid', badgeColor: 'blue' };
    return { level: `${minYears}-${rangeMatch[2]} yrs (Junior)`, tag: 'junior', badgeColor: 'teal' };
  }

  // Single year e.g. 5+ years
  const singleMatch = text.match(/(\d+)\+?\s*years?/);
  if (singleMatch) {
    const years = parseInt(singleMatch[1], 10);
    if (years >= 5) return { level: `${years}+ yrs (Senior)`, tag: 'senior', badgeColor: 'amber' };
    if (years >= 2) return { level: `${years}+ yrs (Mid)`, tag: 'mid', badgeColor: 'blue' };
    return { level: `${years} yr (Junior)`, tag: 'junior', badgeColor: 'teal' };
  }

  if (/lead|architect|principal|director|head of/i.test(role || '')) {
    return { level: 'Lead / Architect (6+ yrs)', tag: 'lead', badgeColor: 'purple' };
  }

  return { level: 'Experience: Any', tag: 'open', badgeColor: 'slate' };
}

export function extractSkills(desc, role) {
  const combined = ` ${role || ''} ${desc || ''} `;
  const found = [];

  for (const skill of KNOWN_SKILLS) {
    // Escape regex special chars
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(combined)) {
      found.push(skill);
      if (found.length >= 6) break; // Limit to top 6 prominent skills for neatness
    }
  }

  return found;
}

export function normalizeTechPark(parkRaw) {
  const raw = (parkRaw || '').toLowerCase();
  if (raw.includes('techno')) {
    return {
      name: 'Technopark',
      city: 'Thiruvananthapuram',
      emoji: '🥥',
      badgeClass: 'tp-badge'
    };
  }
  if (raw.includes('info')) {
    return {
      name: 'Infopark',
      city: 'Kochi',
      emoji: '🌴',
      badgeClass: 'ip-badge'
    };
  }
  if (raw.includes('cyber') || raw.includes('kozhikode') || raw.includes('ul cyber')) {
    return {
      name: 'Cyberpark',
      city: 'Kozhikode',
      emoji: '☕',
      badgeClass: 'cp-badge'
    };
  }
  return {
    name: parkRaw || 'Kerala IT',
    city: 'Kerala',
    emoji: '🚀',
    badgeClass: 'general-badge'
  };
}

export function calculateDeadlineStatus(deadlineStr) {
  if (!deadlineStr) return { text: 'Open / Rolling', isUrgent: false, isExpired: false };

  // Parse formats like DD-MM-YYYY or YYYY-MM-DD
  let deadlineDate = null;
  if (/^\d{2}-\d{2}-\d{4}$/.test(deadlineStr)) {
    const [d, m, y] = deadlineStr.split('-');
    deadlineDate = new Date(`${y}-${m}-${d}`);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(deadlineStr)) {
    deadlineDate = new Date(deadlineStr);
  }

  if (!deadlineDate || isNaN(deadlineDate.getTime())) {
    return { text: deadlineStr, isUrgent: false, isExpired: false };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadlineDate.setHours(0, 0, 0, 0);

  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `Expired (${Math.abs(diffDays)}d ago)`, isUrgent: false, isExpired: true };
  }
  if (diffDays === 0) {
    return { text: 'Expires Today! ⏰', isUrgent: true, isExpired: false };
  }
  if (diffDays === 1) {
    return { text: 'Expires Tomorrow! ⚡', isUrgent: true, isExpired: false };
  }
  if (diffDays <= 3) {
    return { text: `${diffDays} days left`, isUrgent: true, isExpired: false };
  }
  return { text: `${diffDays} days left`, isUrgent: false, isExpired: false };
}

export function normalizeJob(raw, index) {
  const cleanTitle = cleanRoleTitle(raw.role, raw.company, raw.description);
  const parkInfo = normalizeTechPark(raw.tech_park);
  const expInfo = parseExperienceLevel(raw.description, cleanTitle);
  const skills = (raw.skills && raw.skills.length > 0) ? raw.skills : extractSkills(raw.description, cleanTitle);
  const deadlineInfo = calculateDeadlineStatus(raw.deadline);

  // Email extraction fallback
  let email = (raw.email || '').trim();
  if (!email && raw.description) {
    const emailMatch = raw.description.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      email = emailMatch[0];
    }
  }

  const id = raw.id || `job-${index}-${(raw.company || 'co').slice(0, 4)}-${(cleanTitle || 'role').slice(0, 4)}`.replace(/\s+/g, '-').toLowerCase();

  return {
    ...raw,
    id,
    cleanTitle,
    parkInfo,
    expInfo,
    skills,
    email,
    deadlineInfo,
    isWalkIn: Boolean(raw.is_walk_in || /walk[\s\-]?in/i.test(`${cleanTitle} ${raw.description || ''}`))
  };
}
