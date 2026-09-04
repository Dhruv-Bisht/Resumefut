const RESUME_SECTIONS = {
  contact: /\b(email|e-mail|phone|mobile|linkedin|github|leetcode|portfolio|contact)\b/i,
  experience: /\b(experience|work experience|professional experience|employment|internship|internships|work history)\b/i,
  skills: /\b(skills|technical skills|technologies|tech stack|tools|competencies|proficienc(?:y|ies))\b/i,
  projects: /\b(projects|personal projects|academic projects|selected projects)\b/i,
  education: /\b(education|academic|degree|bachelor|master|ph\.d|b\.e\.?|b\.tech|m\.tech|university|college)\b/i,
  achievements: /\b(achievements|certifications|certificates|awards|publications|leadership|activities|honors)\b/i,
};

// Strong document-level rejection signals. These are intentionally paired with
// other signals so a normal resume mentioning an exam/certification is not rejected.
const DOCUMENT_REJECTION = [
  /\badmit\s*card\b/i,
  /\bhall\s*ticket\b/i,
  /\b(?:entrance|competitive)\s+(?:exam|test)\b/i,
  /\b(?:examination|exam)\s+(?:center|centre|date|code|name)\b/i,
  /\broll\s*(?:no|number)\b/i,
  /\bregistration\s*(?:no|number)\b/i,
  /\bcandidate\s*(?:name|id|signature)\b/i,
  /\bseat\s*(?:no|number)\b/i,
];

const BOOK_SIGNALS = [
  /\btable\s+of\s+contents\b/i,
  /\bcontents\s+page\b/i,
  /\bchapter\s+(?:[0-9ivx]+|one|two|three|four|five|six|seven|eight|nine|ten)\b/i,
  /\bchapter\s+\d+/i,
  /\bisbn(?:-?1[03])?\b/i,
  /\bpublisher(?:s|ed)?\b/i,
  /\bpublication\s+date\b/i,
  /\bprinted\s+in\b/i,
  /\bcopyright\s+©?\s*\d{4}/i,
  /\ball\s+rights\s+reserved\b/i,
  /\bforeword\b/i,
  /\bafterword\b/i,
  /\backnowledg(?:e)?ments?\b/i,
  /\bindex\s+of\s+(?:terms|subjects|names)\b/i,
];

const RESUME_IDENTITY = /\b(resume|curriculum vitae|professional summary|career summary|objective)\b/i;
const ROLE_WORDS = /\b(engineer|developer|designer|analyst|scientist|manager|intern|consultant|architect|administrator|researcher|student|lead|director|specialist|associate)\b/i;
const DATE_RANGE = /\b(?:19|20)\d{2}\s*[-–—]\s*(?:19|20)\d{2}|\b(?:19|20)\d{2}\s*[-–—]\s*(?:present|current)\b|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}\b/i;
const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE = /(?:\+?\d[\d\s().-]{8,}\d)/;
const BULLET_LINE = /^(?:[•●▪◦‣\-*]|\d+[.)])\s+/;
const ACTION_WORDS = /\b(built|developed|designed|implemented|created|led|managed|improved|increased|reduced|optimized|launched|delivered|deployed|automated|analyzed|engineered|developed|worked|interned|founded)\b/i;

export function validateResumeText(rawText = '', options = {}) {
  const text = String(rawText).replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
  const pageCount = Number.isFinite(Number(options.pageCount)) ? Number(options.pageCount) : null;
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const lower = text.toLowerCase();

  if (pageCount !== null && pageCount > 3) {
    return { valid: false, reason: 'too-many-pages', message: `This resume has ${pageCount} pages. ResumeFUT accepts resumes up to 3 pages.` };
  }

  if (text.length < 180) {
    return { valid: false, reason: 'too-short', message: 'This document is too short to be a resume. Upload a complete resume or paste the full resume text.' };
  }

  // Extremely large extracted text is a useful safety net for books and reports,
  // especially when page metadata is unavailable (e.g. pasted text).
  if (text.length > 32000) {
    return { valid: false, reason: 'too-long', message: 'This document is too long to be a resume. Keep the resume to 3 pages or fewer.' };
  }

  const rejectionHits = DOCUMENT_REJECTION.filter((re) => re.test(text));
  const matchedSections = Object.entries(RESUME_SECTIONS)
    .filter(([, re]) => re.test(text))
    .map(([key]) => key);

  if (rejectionHits.length >= 2 || (rejectionHits.length >= 1 && matchedSections.length < 4)) {
    return { valid: false, reason: 'document-type', message: 'That document does not look like a resume. Please upload a resume, not an admit card, hall ticket, exam document or marksheet.' };
  }

  const bookHits = BOOK_SIGNALS.filter((re) => re.test(text));
  const bulletLines = lines.filter((line) => BULLET_LINE.test(line)).length;
  const actionLines = lines.filter((line) => ACTION_WORDS.test(line)).length;
  const contactSignals = Number(EMAIL.test(text)) + Number(PHONE.test(text)) + Number(/\blinkedIn\b/i.test(text)) + Number(/\bgithub\.com\b/i.test(text)) + Number(/\bleetcode\.com\b/i.test(text));
  const structureSignals = [
    RESUME_IDENTITY.test(text),
    ROLE_WORDS.test(text),
    DATE_RANGE.test(text),
    contactSignals >= 1,
    contactSignals >= 2,
    bulletLines >= 3,
    actionLines >= 3,
  ].filter(Boolean).length;

  // A book/report can accidentally contain words such as "education" or
  // "projects". Require several independent resume-structure signals instead
  // of trusting section keywords alone.
  if (bookHits.length >= 2 && structureSignals < 5) {
    return { valid: false, reason: 'book-like', message: 'This PDF looks more like a book, report or long-form document than a resume. Upload a resume of 3 pages or fewer.' };
  }

  if (matchedSections.length < 4) {
    return { valid: false, reason: 'missing-sections', message: 'Resume format not recognized. Include at least four sections such as Contact, Experience, Skills, Projects, Education or Certifications.' };
  }

  if (contactSignals === 0) {
    return { valid: false, reason: 'missing-contact', message: 'We could not find resume contact information. Include an email, phone number, LinkedIn, GitHub or LeetCode profile.' };
  }

  // Strong resume shape: sections + identity/role/date structure + evidence of
  // work/projects. This catches ordinary books that happen to contain headings.
  if (structureSignals < 4 || (bulletLines < 2 && actionLines < 2 && !DATE_RANGE.test(text))) {
    return { valid: false, reason: 'weak-resume-shape', message: 'This document does not have enough resume structure. Upload a standard resume with roles/projects, dates and contact details.' };
  }

  // Table-of-contents/chapter-heavy documents are rejected unless the text has
  // unusually strong resume structure.
  if (bookHits.length >= 3 && structureSignals < 6) {
    return { valid: false, reason: 'long-form-document', message: 'This document looks like long-form reading material rather than a resume. Please upload your 1–3 page resume.' };
  }

  return { valid: true, sections: matchedSections, pageCount, structureSignals };
}
