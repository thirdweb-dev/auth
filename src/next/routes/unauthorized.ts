import { NextApiRequest, NextApiResponse } from "next";

export async function unauthorized(_: NextApiRequest, res: NextApiResponse) {
  return res.status(401).json({ message: "Not authenticated." });
}
