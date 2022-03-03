import { task } from "hardhat/config";
import { getContract, getProvider } from "./helpers";
import fetch from "node-fetch";

task(
  "set-base-token-uri",
  "Sets the base token URI for the deployed smart contract"
)
  .addPositionalParam("baseUrl", "The base of the tokenURI endpoint to set")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract("NFT", hre);
    const transactionResponse = await contract.setBaseTokenURI(
      taskArguments.baseUrl,
      {
        gasLimit: 500_000,
      }
    );
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });

task("token-uri", "Fetches the token metadata for the given token ID")
  .addPositionalParam("tokenId", "The tokenID to fetch metadata for")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract("NFT", hre);
    const response = await contract.tokenURI(taskArguments.tokenId);

    const metadata_url = response;
    console.log(`Metadata URL: ${metadata_url}`);

    const res = await fetch(metadata_url);
    const metadata = await res.json();
    console.log(
      `Metadata fetch response: ${JSON.stringify(metadata, null, 2)}`
    );
  });

task("set-signer-address", "Sets the signer address for verifying signature")
  .addPositionalParam("address", "The signer address")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract("NFT", hre);
    const transactionResponse = await contract.setSignerAddress(
      taskArguments.address,
      {
        gasPrice: getProvider().getGasPrice(),
        gasLimit: 500_000,
      }
    );
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });

task("signer-address", "Get the signer address").setAction(async function (
  taskArguments,
  hre
) {
  const contract = await getContract("NFT", hre);
  const address = await contract.signerAddress();
  console.log(`Signer address: ${address}`);
});
