import { ThirdwebAuthContext } from "../types";
import { LoginPayload } from "@thirdweb-dev/sdk/dist/src/schema";
import { serialize } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

function redirectWithError(
  req: NextApiRequest,
  res: NextApiResponse,
  error: string
) {
  const encodedError = encodeURIComponent(error);
  const url = new URL(req.headers.referer as string);
  url.searchParams.set("error", encodedError);
  return res.redirect(url.toString());
}

export async function login(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: ThirdwebAuthContext
) {
  if (req.method !== "GET") {
    return redirectWithError(req, res, "INVALID_METHOD");
  }

  const { sdk, domain } = ctx;

  // Get signed login payload from the frontend
  const payload = JSON.parse(req.query.payload as string) as LoginPayload;
  if (!payload) {
    redirectWithError(req, res, "MISSING_LOGIN_PAYLOAD");
  }

  let token;
  try {
    // Generate an access token with the SDK using the signed payload
    token = await sdk.auth.generateAuthToken(domain, payload);
  } catch {
    return redirectWithError(req, res, "INVALID_LOGIN_PAYLOAD");
  }

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
