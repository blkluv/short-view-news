import type { NextApiRequest, NextApiResponse } from 'next';
import { getSheetData } from '@/utils/sheets';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const start = Number(req.query.start) || 0;
    const count = Number(req.query.count) || 20;

    const data = await getSheetData(start, count);
    res.status(200).json(data);
  } else {
    console.log('Unsupported method');
  }
}
