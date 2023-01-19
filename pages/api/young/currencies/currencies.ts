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

  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: "fedeviotti@gmail.com, koine.eirene@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
}
