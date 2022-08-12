import { NextApiRequest, NextApiResponse } from "next";

interface ThirdwebAuthOptions {
  domain: string;
}

export async function ThirdwebAuth(
  ...args:
    | [ThirdwebAuthOptions]
    | [NextApiRequest, NextApiResponse, ThirdwebAuthOptions]
) {
  return;
}
