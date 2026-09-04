/**
 * ResumeFUT scoring engine.
 *
 * Fully local, deterministic, keyword/regex-based heuristics — no AI calls,
 * no network requests, nothing leaves the process running it.
 *
 * Six stats are produced, mirroring FIFA Ultimate Team's PAC/SHO/PAS/DRI/
 * DEF/PHY layout:
 *
 *   EXP  Experience    - tenure and seniority
 *   SKL  Skills        - breadth of listed skills/tools
 *   LED  Leadership    - management/ownership language
 *   IMP  Impact        - quantified, results-driven bullets
 *   EDU  Education     - degrees and certifications
 *   VER  Versatility   - range of industries/roles touched
 *
 * Each stat function returns { score, raw, rawLabel } so the UI can show
 * both the 1-99 rating *and* the underlying signal it came from (e.g.
 * "6 yrs tracked" next to the EXP bar) — see buildScoutingMetrics below.
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
  { pattern: /\b(ph\.?d|doctorate)\b/i, score: 92, label: 'PhD' },
  { pattern: /\b(mba|m\.?s\.?|m\.?a\.?|master'?s?)\b/i, score: 84, label: "Master's" },
  { pattern: /\b(b\.?s\.?|b\.?a\.?|bachelor'?s?)\b/i, score: 76, label: "Bachelor's" },
  { pattern: /\b(associate'?s?|a\.?a\.?s?)\b/i, score: 65, label: "Associate's" },
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

// Section headers we should never mistake for a person's name.
const NON_NAME_LINES = /\b(resume|cv|curriculum vitae|summary|objective|experience|education|skills|contact|profile|projects|certifications|references)\b/i;

function extractYearRanges(text) {
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
      totalYears += Math.min(end - start, 15);
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
  const base = 40 + Math.min(totalYears, 15) * 3.2;
  const seniorityBonus = Math.min(seniorityHits * 4, 16);
  const roleBonus = Math.min(rangeCount * 1.5, 8);
  return {
    score: clamp(base + seniorityBonus + roleBonus),
    raw: totalYears,
    rawLabel: `${totalYears} yr${totalYears === 1 ? '' : 's'} tracked`,
  };
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
  return {
    score: clamp(base),
    raw: hits,
    rawLabel: `${hits} skill${hits === 1 ? '' : 's'} matched`,
  };
}

function scoreLeadership(text) {
  const hits = countMatches(text, LEADERSHIP_KEYWORDS);
  const teamSizeMatches = text.match(/team of\s+(\d{1,3})/gi) || [];
  const teamBonus = teamSizeMatches.reduce((acc, m) => {
    const n = parseInt(m.match(/\d{1,3}/)?.[0], 10) || 0;
    return acc + Math.min(n / 2, 12);
  }, 0);
  const base = 38 + hits * 4 + teamBonus;
  return {
    score: clamp(base),
    raw: hits,
    rawLabel: `${hits} leadership mention${hits === 1 ? '' : 's'}`,
  };
}

function scoreImpact(text) {
  let hits = 0;
  for (const re of IMPACT_PATTERNS) {
    const found = text.match(re);
    if (found) hits += found.length;
  }
  const verbHits = countMatches(text, IMPACT_VERBS);
  const total = hits + verbHits;
  const base = 36 + hits * 3.2 + verbHits * 2.5;
  return {
    score: clamp(base),
    raw: total,
    rawLabel: `${total} quantified win${total === 1 ? '' : 's'}`,
  };
}

function scoreEducation(text) {
  let best = { score: 60, label: 'Unlisted' };
  for (const tier of DEGREE_TIERS) {
    if (tier.pattern.test(text) && tier.score > best.score) best = tier;
  }
  const certHits = (text.match(CERT_PATTERN) || []).length;
  const certBonus = Math.min(certHits * 3, 12);
  return {
    score: clamp(best.score + certBonus),
    raw: certHits,
    rawLabel: `${best.label} · ${certHits} cert${certHits === 1 ? '' : 's'}`,
  };
}

function scoreVersatility(text) {
  let buckets = 0;
  for (const key in INDUSTRY_BUCKETS) {
    if (INDUSTRY_BUCKETS[key].test(text)) buckets += 1;
  }
  const base = 40 + buckets * 8;
  return {
    score: clamp(base),
    raw: buckets,
    rawLabel: `${buckets} industr${buckets === 1 ? 'y' : 'ies'} touched`,
  };
}

function detectPosition(text) {
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

const ARCHETYPES = {
  exp: { name: 'THE VETERAN', style: 'STEADY', blurb: 'time-tested, unhurried, hard to catch out.' },
  skl: { name: 'THE SPECIALIST', style: 'FOCUSED', blurb: 'deep in the toolkit, precise under pressure.' },
  led: { name: 'THE CAPTAIN', style: 'COMMANDING', blurb: 'organizes the room before the room asks.' },
  imp: { name: 'THE CLOSER', style: 'DECISIVE', blurb: 'shows up in the numbers, not just the notes.' },
  edu: { name: 'THE SCHOLAR', style: 'MEASURED', blurb: 'credentialed, deliberate, plays the long game.' },
  ver: { name: 'THE GENERALIST', style: 'ADAPTABLE', blurb: 'comfortable wherever the ball lands.' },
};

function pickArchetype(stats, overall) {
  if (overall >= 90) {
    return { name: 'THE ICON', style: 'ELITE', blurb: 'a rare, complete profile.' };
  }
  const [topKey] = Object.entries(stats).sort((a, b) => b[1].score - a[1].score)[0];
  return ARCHETYPES[topKey] || { name: 'THE PROSPECT', style: 'RAW', blurb: 'early, but the tools are there.' };
}

const PLAYSTYLE_MAP = {
  exp: 'Road Veteran',
  skl: 'Sharpshooter',
  led: 'Captain',
  imp: 'Closer',
  edu: 'Scholar',
  ver: 'Explorer',
};

function buildPlaystyles(stats) {
  return Object.entries(stats)
    .sort((a, b) => b[1].score - a[1].score)
    .filter(([, v]) => v.score >= 60)
    .slice(0, 3)
    .map(([key, v]) => ({ name: PLAYSTYLE_MAP[key], score: v.score }));
}

function rateWord(v) {
  if (v >= 75) return 'HIGH';
  if (v >= 55) return 'MED';
  return 'LOW';
}

function buildAttributes(stats) {
  const starsFrom = (v) => {
    if (v >= 85) return 5;
    if (v >= 70) return 4;
    if (v >= 55) return 3;
    if (v >= 40) return 2;
    return 1;
  };
  return {
    skillMoves: starsFrom(stats.skl.score),
    weakFoot: starsFrom(stats.ver.score),
    workRate: `${rateWord(stats.led.score)} / ${rateWord(stats.imp.score)}`,
  };
}

function buildScoutingMetrics(stats) {
  const order = ['exp', 'skl', 'imp', 'led', 'ver', 'edu'];
  const labels = { exp: 'Experience', skl: 'Skills', imp: 'Impact', led: 'Leadership', ver: 'Versatility', edu: 'Education' };
  return order.map((key) => ({
    key,
    label: labels[key],
    rawLabel: stats[key].rawLabel,
    score: stats[key].score,
  }));
}

// Best-effort name extraction: resumes almost always lead with the
// candidate's name as the first non-empty, non-header line. This is a
// heuristic, not a guarantee — the UI lets the person correct it.
export function extractName(rawText) {
  const lines = (rawText || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const NAME_LINE = /^[\p{L}][\p{L}.'-]*(\s+[\p{L}][\p{L}.'-]*){1,3}$/u;

  for (const line of lines.slice(0, 12)) {
    if (line.length < 3 || line.length > 40) continue;
    if (NON_NAME_LINES.test(line)) continue;
    if (/[@\d]/.test(line)) continue;
    if (/^https?:\/\//i.test(line)) continue;
    if (!NAME_LINE.test(line)) continue;
    return line;
  }
  return null;
}

export function rateResume(rawText, { name } = {}) {
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
    (stats.exp.score + stats.skl.score + stats.led.score + stats.imp.score + stats.edu.score + stats.ver.score) / 6
  );
  const position = detectPosition(text);
  const archetype = pickArchetype(stats, overall);
  const resolvedName = (name && name.trim()) || extractName(text) || 'Player';

  let tier = 'bronze';
  if (overall >= 90) tier = 'ultimate';
  else if (overall >= 75) tier = 'goldtier';
  else if (overall >= 50) tier = 'silver';

  return {
    name: resolvedName.toUpperCase(),
    overall,
    position: position.code,
    positionLabel: position.label,
    archetype: archetype.name,
    style: archetype.style,
    tagline: archetype.blurb,
    tier,
    statList: [
      { key: 'exp', label: 'EXP', value: stats.exp.score },
      { key: 'skl', label: 'SKL', value: stats.skl.score },
      { key: 'led', label: 'LED', value: stats.led.score },
      { key: 'imp', label: 'IMP', value: stats.imp.score },
      { key: 'edu', label: 'EDU', value: stats.edu.score },
      { key: 'ver', label: 'VER', value: stats.ver.score },
    ],
    attributes: buildAttributes(stats),
    playstyles: buildPlaystyles(stats),
    metrics: buildScoutingMetrics(stats),
  };
}
