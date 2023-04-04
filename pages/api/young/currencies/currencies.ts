import type { NextApiRequest, NextApiResponse } from "next";
import { Currency } from "./types";

export default async function handler(req: NextApiRequest, res: NextApiResponse<{error: string} | Currency[]>) {

  if (req.method !== 'POST') {
    return res.status(400).send({ error: "Method not allowed"});
  }

  if(req.headers.authorization !== `Bearer ${process.env.API_SECRET_KEY}`) {
    return res.status(401).send({error: "Unauthorized"});
  }

  let result: Currency[] = [];
  try {
    const response = await fetch("https://api.youngplatform.com/api/v3/currencies", {
      method: "GET",
    });
    result = await response.json() as Currency[];
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
  return res.status(200).json(result);

}
