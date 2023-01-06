import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { currency, volume } = req.query;
  res.status(200).json({ currency, volume });
}
