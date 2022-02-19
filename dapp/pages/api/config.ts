import type { NextApiRequest, NextApiResponse } from "next";
import contract from "../../contracts/NFT.json";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  res.status(200).json({
    contract: {
      abi: contract.abi,
      address: process.env.NFT_CONTRACT_ADDRESS,
    },
  });
}
