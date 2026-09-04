import { rateResume } from '../../lib/scoring';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, name } = req.body || {};

  if (!text || typeof text !== 'string' || text.trim().length < 30) {
    return res.status(400).json({
      error: 'Not enough text to work with — paste more of your resume or try a different PDF.',
    });
  }

  try {
    const card = rateResume(text, { name: name || 'Player' });
    return res.status(200).json({ card });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong scoring that resume.' });
  }
}
