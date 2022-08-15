import { authenticate } from "./routes/authenticate";
import { login } from "./routes/login";
import { logout } from "./routes/logout";
import {
  ThirdwebAuthConfig,
  ThirdwebAuthContext,
  ThirdwebAuthRoute,
  NextApiRequestWithUser,
} from "./types";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { NextApiRequest, NextApiResponse } from "next/types";

export * from "./types";

async function ThirdwebAuthRouter(
  req: NextApiRequest,
  res: NextApiResponse,
  ctx: ThirdwebAuthContext
) {
  // Catch-all route must be named with [...thirdweb]
  const { thirdweb } = req.query;
  const action = thirdweb?.[0] as ThirdwebAuthRoute;

  switch (action) {
    case "login":
      return await login(req, res, ctx);
    case "authenticate":
      return await authenticate(req, res, ctx);
    case "logout":
      return await logout(req, res);
    default:
      return res.status(400).json({
        error: "Invalid route for authentication.",
      });
  }
}

export function ThirdwebAuth(cfg: ThirdwebAuthConfig) {
  const ctx = {
    ...cfg,
    sdk: ThirdwebSDK.fromPrivateKey(cfg.privateKey, "mainnet"),
  };

  function ThirdwebAuthHandler(
    ...args: [] | [NextApiRequest, NextApiResponse]
  ) {
    if (args.length === 0) {
      return async (req: NextApiRequest, res: NextApiResponse) =>
        await ThirdwebAuthRouter(req, res, ctx);
    }

    return ThirdwebAuthRouter(args[0], args[1], ctx);
  }

  function withThirdwebAuth(
    handler:
      | ((req: NextApiRequest, res: NextApiResponse) => any)
      | ((req: NextApiRequestWithUser, res: NextApiResponse) => any)
  ) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      const { sdk, domain } = ctx;
      let user: NextApiRequestWithUser["user"] = null;
      const token = req.cookies.thirdweb_auth_token;

      if (token) {
        try {
          const address = await sdk.auth.authenticate(domain, token);
          user = { address };
        } catch {
          // No-op
        }
      }

      // Add user object to the request
      const reqWithUser = {
        ...req,
        user,
      };
      return (handler as any)(reqWithUser, res);
    };
  }

  return { ThirdwebAuthHandler, withThirdwebAuth };
}
