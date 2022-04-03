import { Web3Provider } from "@ethersproject/providers";
import { useWeb3React } from "@web3-react/core";
import { ContractInterface, ethers } from "ethers";
import { useMemo } from "react";
import useSWR from "swr";

export const useContract = (
  contractAddress: string,
  contractInterface: ContractInterface
): ethers.Contract => {
  const { library } = useWeb3React<Web3Provider>();
  return useMemo(() => {
    return new ethers.Contract(
      contractAddress,
      contractInterface,
      library?.getSigner()
    );
  }, [contractAddress, contractInterface, library?.getSigner()]);
};

export const useTokenBalance = (
  contractAddress: string,
  contractInterface: ContractInterface
) => {
  const { account } = useWeb3React<Web3Provider>();
  const contract = useContract(contractAddress, contractInterface);

  const mint = async (quantity: number, price: number) => {
    return await contract.mintTo(account, quantity, {
      value: ethers.utils.parseEther(price.toString()).mul(quantity),
    });
  };

  const redeem = async (quantity: number, price: number, signature: string) => {
    return await contract.redeemTo(account, quantity, signature, {
      value: ethers.utils.parseEther(price.toString()).mul(quantity),
    });
  };

  const { data: balance } = useSWR(
    ["balanceOf", account],
    readContract(contract)
  );

  return [balance?.toNumber(), mint, redeem];
};

export const useTotalSupply = (
  contractAddress: string,
  contractInterface: ContractInterface
) => {
  const contract = useContract(contractAddress, contractInterface);

  const { data: totalSupply } = useSWR(["totalSupply"], readContract(contract));

  return [totalSupply?.toNumber()];
};

const readContract =
  (contract: ethers.Contract) =>
  (...args: any[]) => {
    const [method, ...params] = args;
    return contract[method](...params);
  };
