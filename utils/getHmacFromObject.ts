import { alphabeticalSort } from "utils/alphabeticalSort";
import HmacSHA512 from "crypto-js/hmac-sha512";
import Hex from "crypto-js/enc-hex";

// hmac header is the value returned by this function
// "data" param is JSON body sent as request object
export const getHmacFromObject = (data: Record<string, any>) => {
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
