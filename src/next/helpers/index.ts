import { ThirdwebAuthOptions, ThirdwebMiddlewareOptions } from "../types";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

/**
 * @internal
 */
export function getSDK(privateKey: string) {
  if (!privateKey) {
    throw new Error("Please pass a valid private key to the SDK");
  }

  return ThirdwebSDK.fromPrivateKey(
    process.env.ADMIN_PRIVATE_KEY as string,
    "mainnet"
  );
}

/**
 * Get the address of the authenticated user sending the request.
 * Will throw an error if there is no authenticated user.
 *
 * @param req - The Next request object to check
 * @param options - The options to use when authenticating including the domain and private key
 * @returns The address of the authenticated wallet
 *
 * @public
 */
export async function getAuthenticatedWallet(
  req: NextApiRequest,
  options: ThirdwebAuthOptions
) {
  const token = req.cookies.thirdweb_auth_token;
  if (!token) {
    throw new Error("thirdweb_auth_token cookie not set");
  }

  const sdk = getSDK(options.privateKey);
  const address = await sdk.auth.authenticate(options.domain, token);

  return address;
}
