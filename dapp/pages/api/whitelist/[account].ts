import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const account = req.query.account.toString();
    const whitelist = await prisma.whitelist.findFirst({
      where: { account },
    });
    if (whitelist) {
      const { signature } = whitelist;
      res.status(200).json({ account, signature });
    } else {
      res
        .status(404)
        .json({ message: `Account ${account} is not in whitelist` });
    }
  } catch (error) {
    console.log("Error fetching whitelist", error);
    res.status(500).json({ error: "Error while fetching whitelist" });
  }
}
