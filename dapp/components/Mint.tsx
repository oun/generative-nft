import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { ContractInterface, ContractTransaction } from "ethers";
import { useState } from "react";
import { useTotalSupply } from "../hooks/useContract";
import NumberInput from "./NumberInput";

type Props = {
  balance: number;
  maxMintPerAccount: number;
  mintPrice: number;
  contractAddress: string;
  contractInterface: ContractInterface;
  maxSupply: number;
  onSubmit: (quantity: number) => Promise<ContractTransaction>;
};

const Mint = ({
  balance,
  maxMintPerAccount,
  mintPrice,
  contractAddress,
  contractInterface,
  maxSupply,
  onSubmit
}: Props) => {
  const { active, account } = useWeb3React<Web3Provider>();
  const [totalSupply] = useTotalSupply(contractAddress, contractInterface);
  const [quantity, setQuantity] = useState(1);

  const allowMint = balance < maxMintPerAccount;

  const onButtonClicked = async () => {
    const tx = await onSubmit(quantity);
    const receipt = await tx.wait();
    // const event = receipt.events[0];
    // const value = event.args[2];
    // const tokenId = value.toNumber();
    console.log(`Transaction hash: ${tx.hash}`);
  };

  if (!active) {
    return (
      <div className="outline rounded-md p-4 text-lg text-white">
        Connect wallet to mint
      </div>
    );
  }

  return (
    <div className="grid gap-2 grid-rows-2 grid-cols-2 outline p-12 outline-white">
      <div className="text-xl text-white">
        Remaining Supply: {totalSupply ?? "-"}/{maxSupply} (
        {balance ?? 0}/{maxMintPerAccount})
      </div>
      <div className="text-right text-xl text-white">
        Price: {quantity * mintPrice} ETH
      </div>
      <NumberInput
        min={1}
        max={maxMintPerAccount - balance}
        value={quantity}
        disabled={!allowMint}
        onChange={setQuantity}
      />
      <button
        className="text-xl bg-white py-4 px-20"
        onClick={onButtonClicked}
        disabled={!allowMint}
      >
        MINT
      </button>
    </div>
  );
};

export default Mint;
