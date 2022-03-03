import { task } from "hardhat/config";
import { getContract } from "./helpers";

task("mint", "Mints from the NFT contract")
  .addParam("address", "The address to receive a token")
  .addParam("quantity", "Number of tokens")
  .addParam("price", "Mint price per token")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract("NFT", hre);
    const transactionResponse = await contract.mintTo(
      taskArguments.address,
      taskArguments.quantity,
      {
        gasLimit: 500_000,
        value: hre.ethers.utils.parseEther(taskArguments.price).mul(taskArguments.quantity),
      }
    );
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });

task("redeem", "Redeems from the NFT contract")
  .addParam("address", "The address to receive a token")
  .addParam("quantity", "Number of tokens")
  .addParam("price", "Mint price per token")
  .addParam("signature", "Signed address")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract("NFT", hre);
    const transactionResponse = await contract.redeemTo(
      taskArguments.address,
      taskArguments.quantity,
      taskArguments.signature,
      {
        gasLimit: 500_000,
        value: hre.ethers.utils.parseEther(taskArguments.price).mul(taskArguments.quantity),
      }
    );
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });

