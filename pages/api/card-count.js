import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const count = (await kv.get('cards_rated')) || 0;
      return res.status(200).json({ count });
    } catch (err) {
      return res.status(500).json({ error: 'Could not read card count.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const count = await kv.incr('cards_rated');
      return res.status(200).json({ count });
    } catch (err) {
      return res.status(500).json({ error: 'Could not update card count.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}