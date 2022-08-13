import { getSDK } from "./helpers";
import { ThirdwebMiddlewareOptions } from "./types";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

async function middleware(
  req: NextApiRequest,
  options: ThirdwebMiddlewareOptions
) {
  const token = req.cookies.thirdweb_auth_token;
  if (!token) {
    return NextResponse.redirect(
      new URL(`${options.authUrl}/unauthorized`, req.url)
    );
  }

  const sdk = getSDK(options.privateKey);

  try {
    await sdk.auth.authenticate(options.domain, token);
  } catch {
    return NextResponse.redirect(
      new URL(`${options.authUrl}/unauthorized`, req.url)
    );
  }

  return NextResponse.next();
}

export function ThirdwebMiddleware(
  ...args:
    | [ThirdwebMiddlewareOptions]
    | [NextApiRequest, ThirdwebMiddlewareOptions]
) {
  if (args.length === 1) {
    return async (req: NextApiRequest) => await middleware(req, args[0]);
  }

  return middleware(args[0], args[1]);
}
