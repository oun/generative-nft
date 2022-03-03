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
  .addParam("name", "Token name")
  .addParam("symbol", "Token symbol")
  .addParam(
    "payees",
    "Path to JSON file contains list of payee and share to split payment"
  )
  .setAction(async function (taskArguments, hre) {
    const content = await fs.readFile(taskArguments.payees);
    const payees: Array<any> = JSON.parse(content.toString());

    const nft = await hre.ethers.getContractFactory("NFT", getAccount());
    const instance = await nft.deploy(
      taskArguments.name,
      taskArguments.symbol,
      payees.map((o) => o.payee),
      payees.map((o) => o.share)
    );
    console.log(`Contract deployed to address: ${instance.address}`);
  });

task("verify", "Verify the NFT contract")
  .addOptionalParam("name", "Token name")
  .addOptionalParam("symbol", "Token symbol")
  .addOptionalParam(
    "payees",
    "Path to JSON file contains list of payee and share to split payment"
  )
  .setAction(async function (taskArguments, hre) {
    const content = await fs.readFile(taskArguments.payees);
    const payees: Array<any> = JSON.parse(content.toString());

    await hre.run("verify:verify", {
      address: taskArguments.address,
      constructorArguments: [
        taskArguments.name,
        taskArguments.symbol,
        payees.map((o) => o.payee),
        payees.map((o) => o.share),
      ],
    });
  });
