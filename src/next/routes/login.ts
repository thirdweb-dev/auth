import { ThirdwebAuthOptions } from "../types";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { LoginPayload } from "@thirdweb-dev/sdk/dist/src/schema";
import { serialize } from "cookie";
import { NextApiRequest, NextApiResponse } from "next";

export async function login(
  req: NextApiRequest,
  res: NextApiResponse,
  options: ThirdwebAuthOptions
) {
  if (req.method !== "GET") {
    return res.status(400).json({
      error: "Invalid method. Only GET supported.",
    });
  }

  const { privateKey } = options;
  if (!privateKey) {
    console.error("Missing ADMIN_PRIVATE_KEY environment variable");
    return res.status(500).json({
      error: "Admin private key not set",
    });
  }

  const sdk = ThirdwebSDK.fromPrivateKey(
    process.env.ADMIN_PRIVATE_KEY as string,
    "mainnet"
  );

  // Get signed login payload from the frontend
  const payload = req.body.payload as LoginPayload;
  if (!payload) {
    return res.status(400).json({
      error: "Must provide a login payload to generate a token",
    });
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

  return res.status(200).json("Successfully logged in.");
}
