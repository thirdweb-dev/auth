import { NextApiRequest } from "next";

export type ThirdwebAuthRoute =
  | "login"
  | "logout"
  | "authenticate"
  | "unauthorized";

export type NextApiRequestWithAddress = NextApiRequest & {
  userAddress: string | null;
};
