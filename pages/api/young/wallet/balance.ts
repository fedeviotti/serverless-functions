import type { NextApiRequest, NextApiResponse } from "next";
import { getHmacFromObject } from "utils/getHmacFromObject";
import { Currency } from "./types";

export default async function handler(req: NextApiRequest, res: NextApiResponse<string | Currency[]>) {

  if (req.method !== 'POST') {
    return res.status(400).send("Method not allowed");
  }

  if(req.headers.authorization !== `Bearer ${process.env.API_SECRET_KEY}`) {
    return res.status(401).send("Unauthorized");
  }

  const body = {
    timestamp: Math.floor(Date.now() / 1000),
    recvWindow: 100000,
  };
  const response = await fetch("https://api.youngplatform.com/api/v3/balances", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      apiKey: process.env.YOUNG_API_PUBLIC_KEY || "",
      hmac: getHmacFromObject(body),
    },
  });
  const result = await response.json() as Currency[];
  res.status(200).json(result);

}
