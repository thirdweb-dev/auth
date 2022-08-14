import { NextApiRequest } from "next";

export type ThirdwebAuthRoute = "login" | "logout" | "unauthorized";

export type ThirdwebAuthOptions = {
  domain: string;
  privateKey: string;
};

export type ThirdwebMiddlewareOptions = ThirdwebAuthOptions & {
  authUrl: string;
};

export type NextApiRequestWithAddress = NextApiRequest & {
  userAddress: string | null;
};
