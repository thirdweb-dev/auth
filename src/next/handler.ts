import { login } from "./routes/login";
import { logout } from "./routes/logout";
import { NextApiRequest, NextApiResponse } from "next";

type ThirdwebAuthAction = "login" | "logout";

export type ThirdwebAuthOptions = {
  domain: string;
  privateKey: string;
};

async function ThirdwebAuthHandler(
  req: NextApiRequest,
  res: NextApiResponse,
  options: ThirdwebAuthOptions
) {
  // Catch-all route must be named with [...thirdweb]
  const { thirdweb } = req.query;
  const action = thirdweb?.[0] as ThirdwebAuthAction;

  switch (action) {
    case "login":
      await login(req, res);
      break;
    case "logout":
      await logout(req, res);
      break;
  }
}

export default async function ThirdwebAuth(
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
