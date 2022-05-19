import { HardhatRuntimeEnvironment } from "hardhat/types";

// Helper method for fetching environment variables from .env
function getEnvVariable(key: string, defaultValue?: string): string {
  if (process.env[key]) {
    return process.env[key] as string;
  }
  if (!defaultValue) {
    throw `${key} is not defined and no default value was provided`;
  }
  return defaultValue;
}

// Helper method for fetching a contract instance at a given address
function getContract(hre: HardhatRuntimeEnvironment) {
  return hre.ethers.getContractAt(
    "NFT",
    getEnvVariable("NFT_CONTRACT_ADDRESS")
  );
}

export { getEnvVariable, getContract };
