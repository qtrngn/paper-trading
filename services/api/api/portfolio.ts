import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireMethod } from './_lib/http/requireMethod';
import { requireUid } from './_lib/auth/requireUid';
import { getPortfolio } from './_lib/trading/portfolio';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!requireMethod(req, res, 'GET')) return;
  let uid: string;
  try {
    uid = await requireUid(req);
  } catch {
    return res.status(401).json({ error: 'unauthorized' });
  }
  try {
    const portfolio = await getPortfolio(uid);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(portfolio);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown_error';
    return res.status(500).json({ error: 'failed_to_load_portfolio', message });
  }
}
