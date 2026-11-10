import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllAccountUids } from '../_lib/trading/account';
import { recordPortfolioSnapshot } from '../_lib/trading/portfolioHistory';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  const uids = await getAllAccountUids();
  let saved = 0;
  let failed = 0;
  for (const uid of uids) {
    try {
      await recordPortfolioSnapshot(uid);
      saved++;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'unknown_error';
      console.error(`Failed to record portfolio snapshot for uid ${uid}: ${message}`);
      failed++;
    }
  }
  return res.status(200).json({ users: uids.length, saved, failed });
}
