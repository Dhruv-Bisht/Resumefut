import { rateResume } from '../../lib/scoring';
import { validateResumeText } from '../../lib/resumeValidation';

function extractProfiles(text) {
  const github = new Set();
  const leetcode = new Set();
  const githubRe = /(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9-]+)(?:[/?#]|$)/gi;
  const leetcodeRe = /(?:https?:\/\/)?(?:www\.)?leetcode\.com\/(?:u\/)?([A-Za-z0-9_-]+)(?:[/?#]|$)/gi;
  let match;
  while ((match = githubRe.exec(text))) github.add(match[1]);
  while ((match = leetcodeRe.exec(text))) leetcode.add(match[1]);
  return { github: [...github][0] || null, leetcode: [...leetcode][0] || null };
}

async function fetchGitHub(username) {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'ResumeFUT' },
    });
    if (!res.ok) return null;
    const user = await res.json();

    const reposRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'ResumeFUT' },
    });
    const repos = reposRes.ok ? await reposRes.json() : [];
    const totalStars = Array.isArray(repos) ? repos.reduce((sum, repo) => sum + Number(repo.stargazers_count || 0), 0) : 0;
    const created = user.created_at ? new Date(user.created_at) : null;
    const accountYears = created ? Math.max(0, Math.floor((Date.now() - created.getTime()) / (365.25 * 24 * 60 * 60 * 1000))) : 0;

    return {
      username,
      publicRepos: Number(user.public_repos || 0),
      followers: Number(user.followers || 0),
      totalStars,
      accountYears,
      avatarUrl: user.avatar_url || null,
      profileUrl: user.html_url || `https://github.com/${username}`,
    };
  } catch {
    return null;
  }
}

async function fetchLeetCode(username) {
  try {
    const query = `query userPublicProfile($username: String!) { matchedUser(username: $username) { username profile { ranking reputation } submitStatsGlobal { acSubmissionNum { difficulty count } } } }`;
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com/' },
      body: JSON.stringify({ query, variables: { username } }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const user = json?.data?.matchedUser;
    if (!user) return null;
    const solved = (user.submitStatsGlobal?.acSubmissionNum || []).reduce((sum, item) => sum + (item.difficulty === 'All' ? Number(item.count || 0) : 0), 0);
    return {
      username,
      solved,
      ranking: Number(user.profile?.ranking || 0),
      profileUrl: `https://leetcode.com/u/${username}/`,
    };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, name, pageCount } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Add a resume PDF or paste your resume text first.' });
  }

  const validation = validateResumeText(text, { pageCount });
  if (!validation.valid) {
    return res.status(400).json({ error: validation.message });
  }

  try {
    const profiles = extractProfiles(text);
    const [github, leetcode] = await Promise.all([
      profiles.github ? fetchGitHub(profiles.github) : Promise.resolve(null),
      profiles.leetcode ? fetchLeetCode(profiles.leetcode) : Promise.resolve(null),
    ]);
    const card = rateResume(text, { name, external: { github, leetcode } });
    return res.status(200).json({ card, profiles: { github: github ? github.profileUrl : null, leetcode: leetcode ? leetcode.profileUrl : null } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong scoring that resume.' });
  }
}
