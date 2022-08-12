import { NextApiRequest, NextApiResponse } from "next";

export async function login(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(400).json({
      error: "Invalid method. Only GET supported.",
    });
  }

  return;
}
