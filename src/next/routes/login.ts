import { getSDK } from "../helpers";
import { ThirdwebAuthOptions } from "../types";
import { LoginPayload } from "@thirdweb-dev/sdk/dist/src/schema";
import { serialize } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

function redirectWithError(
  req: NextApiRequest,
  res: NextApiResponse,
  error: string
) {
  const encodedError = encodeURIComponent(error);
  return res.redirect(`${req.headers.referer as string}?error=${encodedError}`);
}

export async function login(
  req: NextApiRequest,
  res: NextApiResponse,
  options: ThirdwebAuthOptions
) {
  if (req.method !== "GET") {
    return redirectWithError(req, res, "INVALID_METHOD");
  }

  let sdk;
  try {
    sdk = getSDK(options.privateKey);
  } catch (err) {
    console.error(err);
    return redirectWithError(req, res, "INVALID_PRIVATE_KEY");
  }

  // Get signed login payload from the frontend
  const payload = JSON.parse(req.query.payload as string) as LoginPayload;
  if (!payload) {
    redirectWithError(req, res, "INVALID_LOGIN_PAYLOAD");
  }

  // Generate an access token with the SDK using the signed payload
  const domain = "thirdweb.com";
  const token = await sdk.auth.generateAuthToken(domain, payload);

  // Securely set httpOnly cookie on request to prevent XSS on frontend
  // And set path to / to enable thirdweb_auth_token usage on all endpoints
  res.setHeader(
    "Set-Cookie",
    serialize("thirdweb_auth_token", token, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    })
  );

  return res.status(301).redirect(req.query.redirectTo as string);
}
