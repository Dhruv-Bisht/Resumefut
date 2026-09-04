const RESUME_SECTIONS = {
  contact: /\b(email|e-mail|phone|mobile|linkedin|github|leetcode|portfolio|contact)\b/i,
  experience: /\b(experience|work experience|professional experience|employment|internship|internships)\b/i,
  skills: /\b(skills|technical skills|technologies|tech stack|tools|competencies|proficienc(?:y|ies))\b/i,
  projects: /\b(projects|personal projects|academic projects|selected projects)\b/i,
  education: /\b(education|academic|degree|bachelor|master|b\.e\.?|b\.tech|m\.tech|university|college)\b/i,
  achievements: /\b(achievements|certifications|certificates|awards|publications|leadership|activities)\b/i,
};

const DOCUMENT_REJECTION = [
  /\badmit\s*card\b/i,
  /\bhall\s*ticket\b/i,
  /\bexamination\s*(?:center|centre|date|name|code)\b/i,
  /\bexam\s*(?:center|centre|date|code|name)\b/i,
  /\broll\s*(?:no|number)\b/i,
  /\bregistration\s*(?:no|number)\b/i,
  /\bcandidate\s*(?:name|id|signature)\b/i,
  /\bseat\s*(?:no|number)\b/i,
  /\bentrance\s*(?:exam|test)\b/i,
  /\bdate\s*of\s*birth\b/i,
];

export function validateResumeText(rawText = '') {
  const text = String(rawText).replace(/\s+/g, ' ').trim();
  if (text.length < 180) {
    return { valid: false, message: 'This document is too short to be a resume. Upload a complete resume or paste the full resume text.' };
  }

  const rejectionHits = DOCUMENT_REJECTION.filter((re) => re.test(text));
  const matchedSections = Object.entries(RESUME_SECTIONS).filter(([, re]) => re.test(text)).map(([key]) => key);

  // A resume should contain several recognizable sections. Requiring three
  // keeps the validator flexible while blocking admit cards and unrelated PDFs.
  if (rejectionHits.length >= 2 || (rejectionHits.length >= 1 && matchedSections.length < 4)) {
    return { valid: false, message: 'That PDF does not look like a resume. Please upload the resume using the supported resume format.' };
  }

  if (matchedSections.length < 3) {
    return { valid: false, message: 'Resume format not recognized. Include at least three sections such as Experience, Skills, Projects, Education, Contact or Certifications.' };
  }

  return { valid: true, sections: matchedSections };
}
