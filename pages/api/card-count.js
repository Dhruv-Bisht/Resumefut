// import { kv } from '@vercel/kv';

// export default async function handler(req, res) {
//   if (req.method === 'GET') {
//     try {
//       const count = (await kv.get('cards_rated')) || 0;
//       return res.status(200).json({ count });
//     } catch (err) {
//       return res.status(500).json({ error: 'Could not read card count.' });
//     }
//   }

//   if (req.method === 'POST') {
//     try {
//       const count = await kv.incr('cards_rated');
//       return res.status(200).json({ count });
//     } catch (err) {
//       return res.status(500).json({ error: 'Could not update card count.' });
//     }
//   }

//   res.setHeader('Allow', ['GET', 'POST']);
//   res.status(405).end(`Method ${req.method} Not Allowed`);
// }

// pages/api/card-count.js

// import { Redis } from '@upstash/redis';

// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
// });

// export default async function handler(req, res) {
//   if (req.method === 'GET') {
//     try {
//       const count = (await redis.get('cards_rated')) || 0;
//       return res.status(200).json({ count });
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ error: 'Could not read card count.' });
//     }
//   }

//   if (req.method === 'POST') {
//     try {
//       const count = await redis.incr('cards_rated');
//       return res.status(200).json({ count });
//     } catch (err) {
//       console.error(err);
//       return res.status(500).json({ error: 'Could not update card count.' });
//     }
//   }

//   res.setHeader('Allow', ['GET', 'POST']);
//   res.status(405).end(`Method ${req.method} Not Allowed`);
// }

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const count = (await redis.get('cards_rated')) || 0;
      return res.status(200).json({ count });
    } catch (err) {
      console.error('card-count GET failed:', err);
      return res.status(500).json({ error: 'Could not read card count.' });
    }
  }

  if (req.method === 'POST') {
    try {
      const count = await redis.incr('cards_rated');
      return res.status(200).json({ count });
    } catch (err) {
      console.error('card-count POST failed:', err);
      return res.status(500).json({ error: 'Could not update card count.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}