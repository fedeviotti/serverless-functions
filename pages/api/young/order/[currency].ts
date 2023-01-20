import type { NextApiRequest, NextApiResponse } from "next";
import { getHmacFromObject } from "utils/getHmacFromObject";
import { OrderRequest, OrderResponse } from "./types";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse<{ error: string} | OrderResponse>) {
  if (req.method !== 'POST') {
    return res.status(400).send({ error: "Method not allowed" });
  }

  if(req.headers.authorization !== `Bearer ${process.env.API_SECRET_KEY}`) {
    return res.status(401).send({ error: "Unauthorized" });
  }

  const { currency, volume } = req.query;

  const body: OrderRequest = {
    timestamp: Math.floor(Date.now() / 1000),
    recvWindow: 100000,
    trade: currency as string,
    market: "EUR",
    side: "BUY",
    type: "MARKET",
    volume: Number(volume),
  };
  let result: OrderResponse;
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
    result = await response.json() as OrderResponse;
  } catch (error: any) {
    res.status(500).json({ error: `An error occurred: ${error.message}` });
    return;
  }
  res.status(200).json(result);

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const bodyHtml = `<h1>Recurring order</h1> \n
  <ul>
    <li>Order placed for ${result.volume} ${result.baseCurrency}.</li>
    <li>Euro spent ${result.amount}.</li>
    <li>Fees spent ${result.amount}.</li>
    <li>Brokerage spent ${result.brokerage}.</li>
  </ul> \n`;

  await transporter.sendMail({
    from: `"Recurring Service" ${process.env.EMAIL}`,
    to: process.env.EMAIL,
    subject: `Recurring order`,
    text: `Order placed for ${result.volume} ${result.baseCurrency}.`,
    html: bodyHtml,
  });
}

