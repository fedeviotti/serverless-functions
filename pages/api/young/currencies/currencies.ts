import nodemailer from "nodemailer";
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
    res.status(500).json({ error: error.message });
    return;
  }
  res.status(200).json(result);

  const currenciesRowsHtml = result.map((currency) => {
    return `
    <tr>
      <td>${currency.name}</td>
      <td>${currency.symbol}</td>
      <td>${currency.price}</td>
    </tr>`;
  }).join("");

  const bodyHtml = `<h1>Currencies</h1> \n 
    <table>
      <tr>
        <th>Name</th>
        <th>Symbol</th>
        <th>Price</th>
      </tr>
      ${currenciesRowsHtml}
    </table>`;

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Currencies Service" ${process.env.EMAIL}`,
    to: process.env.EMAIL,
    subject: "Currencies list",
    text: "Currencies list",
    html: bodyHtml,
  });

}
