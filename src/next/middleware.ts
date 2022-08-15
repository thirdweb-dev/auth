import { getConfig } from "./helpers";
import { NextRequest, NextResponse } from "next/server";

async function middleware(req: NextRequest) {
  const { authUrl } = getConfig();
  const token = req.cookies.get("thirdweb_auth_token");
  if (!token) {
    return NextResponse.redirect(new URL(`${authUrl}/unauthorized`, req.url));
  }

  let sdk, domain;
  try {
    ({ sdk, domain } = getConfig());
  } catch (err) {
    console.error(err);
    return NextResponse.redirect(new URL(`${authUrl}/unauthorized`, req.url));
  }

  try {
    await sdk.auth.authenticate(domain, token);
  } catch {
    return NextResponse.redirect(new URL(`${authUrl}/unauthorized`, req.url));
  }

  return NextResponse.next();
}

export function ThirdwebMiddleware(...args: [] | [NextRequest]) {
  if (args.length === 0) {
    return async (req: NextRequest) => await middleware(req);
  }

  return middleware(args[0]);
}
