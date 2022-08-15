import { getConfig } from "../helpers";
import { NextApiRequest, NextApiResponse } from "next";

export async function authenticate(req: NextApiRequest, res: NextApiResponse) {
  const { authUrl } = getConfig();
  const token = req.cookies.thirdweb_auth_token;
  if (!token) {
    return res.redirect(`${authUrl}/unauthorized`);
  }

  let sdk, domain;
  try {
    ({ sdk, domain } = getConfig());
  } catch (err) {
    console.error(err);
    return res.redirect(`${authUrl}/unauthorized`);
  }

  try {
    await sdk.auth.authenticate(domain, token);
  } catch {
    return res.redirect(`${authUrl}/unauthorized`);
  }

  return res.status(200).json(true);
}
