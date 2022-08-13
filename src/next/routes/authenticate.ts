import { getSDK } from "../helpers";
import { ThirdwebAuthOptions } from "../types";
import { NextApiRequest, NextApiResponse } from "next";

function unauthorized(req: NextApiRequest, res: NextApiResponse) {
  return res.redirect(`${req.headers.origin as string}/unauthorized`);
}

export async function authenticate(
  req: NextApiRequest,
  res: NextApiResponse,
  options: ThirdwebAuthOptions
) {
  const token = req.cookies.thirdweb_auth_token;
  if (!token) {
    return unauthorized(req, res);
  }

  let sdk;
  try {
    sdk = getSDK(options.privateKey);
  } catch (err) {
    console.error(err);
    return unauthorized(req, res);
  }

  try {
    await sdk.auth.authenticate(options.domain, token);
  } catch {
    return unauthorized(req, res);
  }

  return res.status(200).json(true);
}
