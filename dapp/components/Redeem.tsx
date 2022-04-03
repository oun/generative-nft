import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { ContractInterface, ContractTransaction } from "ethers";
import { useWhitelist } from "../hooks/useWhitelist";
import Mint from "./Mint";

type Props = {
  balance: number;
  maxMintPerAccount: number;
  mintPrice: number;
  contractAddress: string;
  contractInterface: ContractInterface;
  maxSupply: number;
  onSubmit: (
    quantity: number,
    signature: string
  ) => Promise<ContractTransaction>;
};

const Redeem = ({
  balance,
  contractAddress,
  contractInterface,
  maxMintPerAccount,
  mintPrice,
  maxSupply,
  onSubmit,
}: Props) => {
  const { account } = useWeb3React<Web3Provider>();
  const [signature, error] = useWhitelist(account);

  if (!signature) {
    return (
      <div className="outline rounded-md p-4 text-lg text-white">
        You are not in whitelist
      </div>
    );
  }

  return (
    <Mint
      balance={balance}
      contractAddress={contractAddress}
      contractInterface={contractInterface}
      maxMintPerAccount={maxMintPerAccount}
      mintPrice={mintPrice}
      maxSupply={maxSupply}
      onSubmit={(quantity) => onSubmit(quantity, signature)}
    />
  );
};

export default Redeem;
