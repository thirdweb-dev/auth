import { login } from "./routes/login";
import { logout } from "./routes/logout";
import { unauthorized } from "./routes/unauthorized";
import { ThirdwebAuthRoute, ThirdwebAuthOptions } from "./types";
import { NextApiRequest, NextApiResponse } from "next";

async function ThirdwebAuthHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  options: ThirdwebAuthOptions
) {
  // Catch-all route must be named with [...thirdweb]
  const { thirdweb } = req.query;
  const action = thirdweb?.[0] as ThirdwebAuthRoute;

  switch (action) {
    case "login":
      return await login(req, res, options);
    case "logout":
      return await logout(req, res);
    case "unauthorized":
      return await unauthorized(req, res);
    default:
      return res.status(400).json({
        error: "Invalid route for authentication.",
      });
  }
}

export function ThirdwebAuth(
  ...args:
    | [ThirdwebAuthOptions]
    | [NextApiRequest, NextApiResponse, ThirdwebAuthOptions]
) {
  if (args.length === 1) {
    return async (req: NextApiRequest, res: NextApiResponse) =>
      await ThirdwebAuthHandler(req, res, args[0]);
  }

  return ThirdwebAuthHandler(args[0], args[1], args[2]);
}
