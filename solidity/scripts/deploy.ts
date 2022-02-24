import fs from "fs/promises";
import { task } from "hardhat/config";
import { getAccount } from "./helpers";

task("check-balance", "Prints out the balance of your account").setAction(
  async function (taskArguments, hre) {
    const account = getAccount();
    console.log(
      `Account balance for ${account.address}: ${await account.getBalance()}`
    );
  }
);

task("deploy", "Deploys the NFT contract")
  .addParam(
    "payees",
    "Path to JSON file contains list of payee and share to split payment"
  )
  .setAction(async function (taskArguments, hre) {
    const content = await fs.readFile(taskArguments.payees);
    const payees: Array<any> = JSON.parse(content.toString());

    const nft = await hre.ethers.getContractFactory("NFT", getAccount());
    const instance = await nft.deploy();
    console.log(`Contract deployed to address: ${instance.address}`);
  });
