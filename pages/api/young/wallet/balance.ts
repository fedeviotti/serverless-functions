import type { NextApiRequest, NextApiResponse } from "next";
import HmacSHA512 from "crypto-js/hmac-sha512";
import Hex from "crypto-js/enc-hex";

const alphabeticalSort = (a: string, b: string) => a.localeCompare(b);

// hmac header is the value returned by this function
// "data" param is JSON body sent as request object
const getHmacFromObject = (data: Record<string, any>) => {
  let queryString = "";
  const keys = Object.keys(data).sort(alphabeticalSort);
  for (let i = 0; i < keys.length; i += 1) {
    queryString += `${keys[i]}=${data[keys[i]]}`;
    if (i < keys.length - 1) {
      queryString += "&";
    }
  }
  const hash = HmacSHA512(queryString, process.env.YOUNG_API_PRIVATE_KEY || "");
  const hashString = hash.toString(Hex).toUpperCase();
  return hashString;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
  const result = await response.json();
  res.status(200).json(result);
}
