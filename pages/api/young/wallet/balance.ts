import type { NextApiRequest, NextApiResponse } from "next";
import { getHmacFromObject } from "utils/getHmacFromObject";
import { Currency } from "./types";

export default async function handler(req: NextApiRequest, res: NextApiResponse< { error: string } | Currency[]>) {

  if (req.method !== 'POST') {
    return res.status(400).send({ error:"Method not allowed" });
  }

  if(req.headers.authorization !== `Bearer ${process.env.API_SECRET_KEY}`) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  const body = {
    timestamp: Math.floor(Date.now() / 1000),
    recvWindow: 100000,
  };
  let result: Currency[];
  try {
    const response = await fetch("https://api.youngplatform.com/api/v3/balances", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        apiKey: process.env.YOUNG_API_PUBLIC_KEY || "",
        hmac: getHmacFromObject(body),
      },
    });
    result = await response.json() as Currency[];
  } catch (error: any) {
    return res.status(500).json({ error: `An error occurred: ${error.message}` });
  }
  return res.status(200).json(result);
}
