import { getSDK } from "./helpers";
import { ThirdwebMiddlewareOptions } from "./types";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

function unauthorized(req: NextApiRequest, options: ThirdwebMiddlewareOptions) {
  const authUrl = options.authUrl?.replace(/\/$/, "");
  return NextResponse.redirect(
    new URL(`${authUrl}/unauthorized`, req.headers.origin)
  );
}

async function middleware(
  req: NextApiRequest,
  options: ThirdwebMiddlewareOptions
) {
  const token = req.cookies.thirdweb_auth_token;
  if (!token) {
    return unauthorized(req, options);
  }

  let sdk;
  try {
    sdk = getSDK(options.privateKey);
  } catch (err) {
    console.error(err);
    return unauthorized(req, options);
  }

  try {
    await sdk.auth.authenticate(options.domain, token);
  } catch {
    return unauthorized(req, options);
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
