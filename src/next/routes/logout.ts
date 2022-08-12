import { NextApiRequest, NextApiResponse } from "next";

export async function logout(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(400).json({
      error: "Invalid method. Only GET supported.",
    });
  }

  return;
}
