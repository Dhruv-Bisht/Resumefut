/**
 * ResumeFUT scoring engine.
 *
 * Fully local, deterministic, keyword/regex-based heuristics — no AI calls,
 * no network requests, no data leaves the browser/server process running it.
 *
 * This is intentionally simple so it's easy for contributors to read, tweak,
 * and extend. Six stats are produced, mirroring FIFA Ultimate Team's
 * PAC/SHO/PAS/DRI/DEF/PHY layout:
 *
 *   EXP  Experience    - tenure and seniority
 *   SKL  Skills        - breadth of listed skills/tools
 *   LED  Leadership    - management/ownership language
 *   IMP  Impact        - quantified, results-driven bullets
 *   EDU  Education     - degrees and certifications
 *   VER  Versatility   - range of industries/roles touched
 */

const clamp = (n, min = 1, max = 99) => Math.max(min, Math.min(max, Math.round(n)));

const SENIORITY_KEYWORDS = [
  'principal', 'staff', 'director', 'vp', 'vice president', 'head of',
  'chief', 'ceo', 'cto', 'coo', 'cfo', 'founder', 'co-founder', 'president',
];

const LEADERSHIP_KEYWORDS = [
  'led', 'lead', 'managed', 'management', 'founded', 'directed', 'supervised',
  'mentored', 'coached', 'oversaw', 'built a team', 'hired', 'onboarded',
  'coordinated', 'spearheaded', 'chaired',
];

const IMPACT_PATTERNS = [
  /\b\d{1,3}(\.\d+)?\s?%/g, // percentages
  /\$\s?\d[\d,]*(\.\d+)?\s?(k|m|b|million|billion)?/gi, // dollar figures
  /\b\d[\d,]{2,}\+?\b/g, // large raw numbers (e.g. 10,000 users)
];

const IMPACT_VERBS = [
  'increased', 'decreased', 'reduced', 'grew', 'saved', 'generated',
  'improved', 'boosted', 'cut', 'accelerated', 'streamlined', 'launched',
  'delivered', 'scaled', 'drove', 'optimized',
];

const DEGREE_TIERS = [
  { pattern: /\b(ph\.?d|doctorate)\b/i, score: 92 },
  { pattern: /\b(mba|m\.?s\.?|m\.?a\.?|master'?s?)\b/i, score: 84 },
  { pattern: /\b(b\.?s\.?|b\.?a\.?|bachelor'?s?)\b/i, score: 76 },
  { pattern: /\b(associate'?s?|a\.?a\.?s?)\b/i, score: 65 },
];

const CERT_PATTERN = /\b(certified|certification|certificate)\b/gi;

const INDUSTRY_BUCKETS = {
  engineering: /\b(software|engineer|developer|programmer|backend|frontend|full[\s-]?stack|devops|infrastructure)\b/i,
  data: /\b(data scien|data analy|machine learning|analytics|statistic)\b/i,
  design: /\b(designer|ux|ui|product design|graphic design)\b/i,
  product: /\b(product manager|product owner|product lead)\b/i,
  sales: /\b(sales|account executive|business development|bdr|sdr)\b/i,
  marketing: /\b(marketing|growth|seo|content strategy|brand)\b/i,
  finance: /\b(finance|financial|accounting|investment|audit)\b/i,
  healthcare: /\b(clinical|patient|healthcare|medical|nurse|hospital)\b/i,
  education: /\b(teacher|professor|curriculum|instructor|education)\b/i,
  operations: /\b(operations|logistics|supply chain|procurement)\b/i,
  legal: /\b(legal|attorney|counsel|compliance|paralegal)\b/i,
  consulting: /\b(consultant|consulting|advisory)\b/i,
  nonprofit: /\b(nonprofit|non-profit|ngo|volunteer)\b/i,
};

const SKILL_SECTION_HEADERS = /\b(skills|technologies|tools|proficienc(y|ies)|competenc(y|ies))\b/i;

// A broad-ish, contributor-extensible bag of common skill/tool tokens.
const SKILL_KEYWORDS = [
  'javascript', 'typescript', 'python', 'java', 'c\\+\\+', 'c#', 'go', 'rust',
  'sql', 'nosql', 'react', 'next\\.js', 'node', 'vue', 'angular', 'graphql',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd',
  'figma', 'sketch', 'photoshop', 'illustrator', 'excel', 'powerpoint',
  'salesforce', 'hubspot', 'tableau', 'power bi', 'looker', 'jira',
  'agile', 'scrum', 'seo', 'sem', 'google analytics', 'crm', 'erp',
  'negotiation', 'public speaking', 'project management', 'budgeting',
];

function extractYearRanges(text) {
  // Matches things like "2019 - 2023", "2019-Present", "Jan 2020 – Dec 2022"
  const rangeRe = /(19|20)\d{2}\s?[-–—]\s?((19|20)\d{2}|present|current)/gi;
  const matches = text.match(rangeRe) || [];
  let totalYears = 0;
  const currentYear = new Date().getFullYear();

  for (const m of matches) {
    const parts = m.split(/[-–—]/).map((s) => s.trim());
    const start = parseInt(parts[0].match(/(19|20)\d{2}/)?.[0], 10);
    const endRaw = parts[1]?.toLowerCase();
    const end = /present|current/.test(endRaw) ? currentYear : parseInt(endRaw?.match(/(19|20)\d{2}/)?.[0], 10);
    if (start && end && end >= start) {
      totalYears += Math.min(end - start, 15); // guard against typos
    }
  }
  return { totalYears, rangeCount: matches.length };
}

function countMatches(text, list) {
  let count = 0;
  for (const word of list) {
    const re = new RegExp(`\\b${word}\\b`, 'gi');
    const found = text.match(re);
    if (found) count += found.length;
  }
  return count;
}

function scoreExperience(text) {
  const { totalYears, rangeCount } = extractYearRanges(text);
  const seniorityHits = countMatches(text, SENIORITY_KEYWORDS);
  // Base on years (0-15+ -> 40-90), plus seniority language, plus a small
  // bonus for having multiple distinct roles (rangeCount).
  const base = 40 + Math.min(totalYears, 15) * 3.2;
  const seniorityBonus = Math.min(seniorityHits * 4, 16);
  const roleBonus = Math.min(rangeCount * 1.5, 8);
  return clamp(base + seniorityBonus + roleBonus);
}

function scoreSkills(text) {
  const lower = text.toLowerCase();
  let hits = 0;
  for (const raw of SKILL_KEYWORDS) {
    const re = new RegExp(`\\b${raw}\\b`, 'i');
    if (re.test(lower)) hits += 1;
  }
  const hasSkillSection = SKILL_SECTION_HEADERS.test(text) ? 6 : 0;
  const base = 42 + hits * 3.5 + hasSkillSection;
  return clamp(base);
}

function scoreLeadership(text) {
  const hits = countMatches(text, LEADERSHIP_KEYWORDS);
  const teamSizeMatches = text.match(/team of\s+(\d{1,3})/gi) || [];
  const teamBonus = teamSizeMatches.reduce((acc, m) => {
    const n = parseInt(m.match(/\d{1,3}/)?.[0], 10) || 0;
    return acc + Math.min(n / 2, 12);
  }, 0);
  const base = 38 + hits * 4 + teamBonus;
  return clamp(base);
}

function scoreImpact(text) {
  let hits = 0;
  for (const re of IMPACT_PATTERNS) {
    const found = text.match(re);
    if (found) hits += found.length;
  }
  const verbHits = countMatches(text, IMPACT_VERBS);
  const base = 36 + hits * 3.2 + verbHits * 2.5;
  return clamp(base);
}

function scoreEducation(text) {
  let best = 60; // generous baseline so lack of a detected degree isn't punishing
  for (const tier of DEGREE_TIERS) {
    if (tier.pattern.test(text) && tier.score > best) best = tier.score;
  }
  const certHits = (text.match(CERT_PATTERN) || []).length;
  const certBonus = Math.min(certHits * 3, 12);
  return clamp(best + certBonus);
}

function scoreVersatility(text) {
  let buckets = 0;
  for (const key in INDUSTRY_BUCKETS) {
    if (INDUSTRY_BUCKETS[key].test(text)) buckets += 1;
  }
  const base = 40 + buckets * 8;
  return clamp(base);
}

function detectPosition(text) {
  // Order matters: first confident match wins. Feel free to extend/reorder
  // this in a PR — it's meant to be a fun approximation, not gospel.
  const table = [
    { re: INDUSTRY_BUCKETS.engineering, code: 'CDM', label: 'Engineering' },
    { re: INDUSTRY_BUCKETS.data, code: 'CB', label: 'Data' },
    { re: INDUSTRY_BUCKETS.design, code: 'CAM', label: 'Design' },
    { re: INDUSTRY_BUCKETS.product, code: 'CM', label: 'Product' },
    { re: INDUSTRY_BUCKETS.sales, code: 'ST', label: 'Sales' },
    { re: INDUSTRY_BUCKETS.marketing, code: 'RW', label: 'Marketing' },
    { re: INDUSTRY_BUCKETS.finance, code: 'SW', label: 'Finance' },
    { re: INDUSTRY_BUCKETS.operations, code: 'RB', label: 'Operations' },
    { re: INDUSTRY_BUCKETS.legal, code: 'GK', label: 'Legal' },
    { re: INDUSTRY_BUCKETS.healthcare, code: 'GK', label: 'Healthcare' },
    { re: INDUSTRY_BUCKETS.education, code: 'LW', label: 'Education' },
    { re: INDUSTRY_BUCKETS.consulting, code: 'AM', label: 'Consulting' },
    { re: INDUSTRY_BUCKETS.nonprofit, code: 'LB', label: 'Nonprofit' },
  ];
  for (const row of table) {
    if (row.re.test(text)) return row;
  }
  return { code: 'SUB', label: 'Generalist' };
}

function pickArchetype(stats, overall) {
  if (overall >= 90) return 'THE ICON';
  const entries = Object.entries(stats).sort((a, b) => b[1] - a[1]);
  const [topKey] = entries[0];
  const map = {
    exp: 'THE VETERAN',
    skl: 'THE SPECIALIST',
    led: 'THE CAPTAIN',
    imp: 'THE CLOSER',
    edu: 'THE SCHOLAR',
    ver: 'THE GENERALIST',
  };
  return map[topKey] || 'THE PROSPECT';
}

export function rateResume(rawText, { name = 'PLAYER' } = {}) {
  const text = rawText || '';
  const stats = {
    exp: scoreExperience(text),
    skl: scoreSkills(text),
    led: scoreLeadership(text),
    imp: scoreImpact(text),
    edu: scoreEducation(text),
    ver: scoreVersatility(text),
  };
  const overall = clamp(
    (stats.exp + stats.skl + stats.led + stats.imp + stats.edu + stats.ver) / 6
  );
  const position = detectPosition(text);
  const archetype = pickArchetype(stats, overall);

  let tier = 'bronze';
  if (overall >= 90) tier = 'ultimate';
  else if (overall >= 75) tier = 'goldtier';
  else if (overall >= 50) tier = 'silver';

  return {
    name: name.toUpperCase(),
    overall,
    position: position.code,
    positionLabel: position.label,
    archetype,
    tier,
    statList: [
      { key: 'exp', label: 'EXP', value: stats.exp },
      { key: 'skl', label: 'SKL', value: stats.skl },
      { key: 'led', label: 'LED', value: stats.led },
      { key: 'imp', label: 'IMP', value: stats.imp },
      { key: 'edu', label: 'EDU', value: stats.edu },
      { key: 'ver', label: 'VER', value: stats.ver },
    ],
  };
}
