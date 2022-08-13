export type ThirdwebAuthRoute = "login" | "logout" | "unauthorized";

export type ThirdwebAuthOptions = {
  domain: string;
  privateKey: string;
};

export type ThirdwebMiddlewareOptions = ThirdwebAuthOptions & {
  authUrl: string;
};
