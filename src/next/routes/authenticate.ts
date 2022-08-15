import { ThirdwebAuthContext } from "../types";
import { NextApiRequest, NextApiResponse } from "next";

export async function authenticate(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: ThirdwebAuthContext
) {
  const token = req.cookies.thirdweb_auth_token;
  if (!token) {
    return res.status(401).json({
      message: "Not authorized.",
    });
  }

  const { sdk, domain } = ctx;

  try {
    await sdk.auth.authenticate(domain, token);
  } catch {
    return res.status(401).json({
      message: "Not authorized.",
    });
  }

  return res.status(200).json(true);
}
