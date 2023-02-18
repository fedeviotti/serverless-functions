import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
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
    res.status(500).json({ error: `An error occurred: ${error.message}` });
    return;
  }
  res.status(200).json(result);

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    greetingTimeout: 60000,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const currenciesRowsHtml = result
    .filter((currency) => currency.balance > 0)
    .map((currency) => {
    return `
    <tr>
      <td>${currency.symbol}</td>
      <td>${currency.balance}</td>
      <td>${currency.balanceInTrade}</td>
    </tr>`;
  }).join("");

  const bodyHtml = `<h1>Balance</h1> \n
  <table>
    <tr>
      <th>Symbol</th>
      <th>Balance</th>
      <th>Balance in trade</th>
    </tr>
    ${currenciesRowsHtml}
  </table>`;

  await transporter.sendMail({
    from: `"Balance Service" ${process.env.EMAIL}`,
    to: process.env.EMAIL,
    subject: "Balance",
    text: "Balance",
    html: bodyHtml,
  });

}
