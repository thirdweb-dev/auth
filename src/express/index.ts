import loginHandler from "./routes/login";
import logoutHandler from "./routes/logout";
import userHandler from "./routes/user";
import { ThirdwebAuthConfig, ThirdwebAuthRoute } from "./types";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { Express, NextFunction, Request, Response } from "express";

export * from "./types";

export function withThirdwebAuth(app: Express, cfg: ThirdwebAuthConfig) {
  const ctx = {
    ...cfg,
    sdk: ThirdwebSDK.fromPrivateKey(cfg.privateKey, "mainnet"),
  };

  const authUrl = cfg.authUrl?.replace(/\/$/, "") || "/auth";

  app.use(async (req: Request, _: Response, next: NextFunction) => {
    const { sdk, domain } = ctx;
    let user = null;
    const token = req.cookies?.thirdweb_auth_token;

    if (token) {
      try {
        const address = await sdk.auth.authenticate(domain, token);
        user = { address };
      } catch {
        // No-op
      }
    }

    req.user = user;
    next();
  });

  app.get(`${authUrl}/:route`, (req: Request, res: Response) => {
    const action = req.params.route as ThirdwebAuthRoute;

    console.log("Caught: ", action);

    switch (action) {
      case "login":
        return loginHandler(req, res, ctx);
      case "user":
        return userHandler(req, res, ctx);
      case "logout":
        return logoutHandler(req, res);
      default:
        return res.status(400).json({
          message: "Invalid route for authentication.",
        });
    }
  });
}
