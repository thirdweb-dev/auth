import { ThirdwebAuthContext } from "../types";
import { Request, Response } from "express";

export default async function handler(
  req: Request,
  res: Response,
  ctx: ThirdwebAuthContext
) {
  const { sdk, domain } = ctx;
  let user = null;
  const token = req.cookies.thirdweb_auth_token;

  if (token) {
    try {
      const address = await sdk.auth.authenticate(domain, token);
      user = { address };
    } catch {
      // No-op
    }
  }

  return res.status(200).json(user);
}
