import { task } from "hardhat/config";
import fs from "fs/promises";
import { getContract } from "./helpers";
import { parse } from "csv-parse/sync";

task("mint-public", "Mint public sales from the NFT contract")
  .addParam("address", "The address to receive a token")
  .addParam("quantity", "Number of tokens")
  .addParam("price", "Mint price per token")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(hre);
    const transactionResponse = await contract.mintPublic(
      taskArguments.address,
      taskArguments.quantity,
      {
        gasPrice: hre.ethers.provider.getGasPrice(),
        gasLimit: 500_000,
        value: hre.ethers.utils
          .parseEther(taskArguments.price)
          .mul(taskArguments.quantity),
      }
    );
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });

task("mint-presale", "Mint presale from the NFT contract")
  .addParam("address", "The address to receive a token")
  .addParam("quantity", "Number of tokens")
  .addParam("reservedQuantity", "Number of reserved quantity")
  .addParam("price", "Mint price per token")
  .addParam("signature", "Signed address")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(hre);
    const transactionResponse = await contract.mintPresale(
      taskArguments.address,
      taskArguments.quantity,
      taskArguments.reservedQuantity,
      taskArguments.signature,
      {
        gasPrice: hre.ethers.provider.getGasPrice(),
        gasLimit: 500_000,
        value: hre.ethers.utils
          .parseEther(taskArguments.price)
          .mul(taskArguments.quantity),
      }
    );
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });

task("redeem", "Redeem free mint from the NFT contract")
  .addParam("address", "The address to receive a token")
  .addParam("quantity", "Number of tokens")
  .addParam("reservedQuantity", "Number of reserved quantity")
  .addParam("signature", "Signed address")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(hre);
    const transactionResponse = await contract.redeem(
      taskArguments.address,
      taskArguments.quantity,
      taskArguments.reservedQuantity,
      taskArguments.signature,
      {
        gasPrice: hre.ethers.provider.getGasPrice(),
        gasLimit: 500_000,
        value: 0,
      }
    );
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });

task("airdrop", "Airdrop NFTs to multiple recipients")
  .addParam("file", "The file path contains recipient addresses and quantity")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(hre);
    const data = await fs.readFile(taskArguments.file);
    const records = parse(data);
    const transactionResponse = await contract.airdrop(
      records.map((e: string[]) => e[0]),
      records.map((e: string[]) => +e[1]),
      {
        gasPrice: hre.ethers.provider.getGasPrice(),
        gasLimit: 500_000,
        value: 0,
      }
    );
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });
