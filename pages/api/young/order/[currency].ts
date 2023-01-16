import type { NextApiRequest, NextApiResponse } from "next";
import { getHmacFromObject } from "utils/getHmacFromObject";
import { OrderResponse } from "./types";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(400).send("Method not allowed");
  }

  if(req.headers.authorization !== `Bearer ${process.env.API_SECRET_KEY}`) {
    return res.status(401).send("Unauthorized");
  }

  const { currency, volume } = req.query;

  const body = {
    timestamp: Math.floor(Date.now() / 1000),
    recvWindow: 100000,
    trade: currency,
    market: "EUR",
    side: "BUY",
    type: "MARKET",
    volume
  };
  try {
    const response = await fetch("https://api.youngplatform.com/api/v3/placeOrder", {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
        apiKey: process.env.YOUNG_API_PUBLIC_KEY || "",
        hmac: getHmacFromObject(body),
      },
    });
    const result = await response.json() as OrderResponse;
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: `An error occurred: ${error.message}` })
  }
}

