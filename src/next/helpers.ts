import { NextApiRequestWithAddress } from "./types";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { NextApiRequest, NextApiResponse } from "next";

/**
 * @internal
 */
export function getConfig() {
  if (!process.env.THIRDWEB_AUTH_PRIVATE_KEY) {
    throw new Error(
      "Please set the THIRDWEB_AUTH_PRIVATE_KEY environment variable."
    );
  }

  if (!process.env.THIRDWEB_AUTH_DOMAIN) {
    throw new Error(
      "Please set the THIRDWEB_AUTH_DOMAIN environment variable."
    );
  }

  const sdk = ThirdwebSDK.fromPrivateKey(
    process.env.THIRDWEB_AUTH_PRIVATE_KEY,
    "mainnet"
  );
  const domain = process.env.THIRDWEB_AUTH_DOMAIN;
  const authUrl =
    process.env.THIRDWEB_AUTH_URL?.replace(/\/$/, "") || "/api/auth";

  return { sdk, domain, authUrl };
}

/**
 * Get the address of the authenticated user sending the request.
 * Will throw an error if there is no authenticated user.
 *
 * @param req - The Next request object to check
 * @returns The address of the authenticated wallet
 *
 * @public
 */
export async function getUserAddress(req: NextApiRequest) {
  const token = req.cookies.thirdweb_auth_token;
  if (!token) {
    return null;
  }

  try {
    const { sdk, domain } = getConfig();
    const address = await sdk.auth.authenticate(domain, token);
    return address;
  } catch {
    return null;
  }
}

/**
 * Wrap an API route with thirdweb authentication middleware. This will add the authenticated user address
 * to the request object.
 *
 * @param handler - the Next API route handler to wrap with authentication
 * @param requireUser - if true, the route will return a 401 if the user is not authenticated, otherwise
 * it will allow the route to be accessed without authentication. if false, the req.userAddress value will be
 * null if there is no authenticated user.
 *
 * @public
 */
export function withThirdwebAuth(
  handler:
    | ((req: NextApiRequest, res: NextApiResponse) => any)
    | ((req: NextApiRequestWithAddress, res: NextApiResponse) => any),
  requireUser = true
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const userAddress = await getUserAddress(req);
    const { authUrl } = getConfig();

    if (requireUser && !userAddress) {
      return res.redirect(`${authUrl}/unauthorized`);
    }

    // Set userAddress value on the request object
    const reqWithAddress = {
      ...req,
      userAddress,
    };
    return (handler as any)(reqWithAddress, res);
  };
}
