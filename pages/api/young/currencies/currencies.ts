import type { NextApiRequest, NextApiResponse } from "next";
import { Currency } from "./types";

export default async function handler(req: NextApiRequest, res: NextApiResponse<string | Currency[]>) {

  if (req.method !== 'POST') {
    return res.status(400).send("Method not allowed");
  }

  if(req.headers.authorization !== `Bearer ${process.env.API_SECRET_KEY}`) {
    return res.status(401).send("Unauthorized");
  }

  const response = await fetch("https://api.youngplatform.com/api/v3/currencies", {
    method: "GET",
  });
  const result = await response.json() as Currency[];
  res.status(200).json(result);

}
