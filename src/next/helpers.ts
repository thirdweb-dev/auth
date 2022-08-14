import {
  NextApiRequestWithAddress,
  ThirdwebAuthOptions,
  ThirdwebMiddlewareOptions,
} from "./types";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { NextApiRequest, NextApiResponse } from "next";

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
 * @internal
 */
function redirect(res: NextApiResponse, authUrl: string, target: string) {
  const _authUrl = authUrl.replace(/\/$/, "");
  return res.redirect(`${_authUrl}/${target}`);
}

/**
 * @internal
 */
async function getUserAddress(
  req: NextApiRequest,
  options: ThirdwebAuthOptions
) {
  const token = req.cookies.thirdweb_auth_token;
  if (!token) {
    return null;
  }

  try {
    const sdk = getSDK(options.privateKey);
    const address = await sdk.auth.authenticate(options.domain, token);
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
 * @param options - the options to use when authenticating including the domain and private key
 * @param requireUser - if true, the route will return a 401 if the user is not authenticated, otherwise
 * it will allow the route to be accessed without authentication. if false, the req.userAddress value will be
 * null if there is no authenticated user.
 *
 * @public
 */
export async function withThirdwebAuth(
  handler:
    | ((req: NextApiRequest, res: NextApiResponse) => any)
    | ((req: NextApiRequestWithAddress, res: NextApiResponse) => any),
  options: ThirdwebMiddlewareOptions,
  requireUser = true
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const userAddress = await getUserAddress(req, options);

    if (requireUser && !userAddress) {
      return redirect(res, options.authUrl, "unauthorized");
    }

    // Set userAddress value on the request object
    const reqWithAddress = {
      ...req,
      userAddress,
    };
    return (handler as any)(reqWithAddress, res);
  };
}
