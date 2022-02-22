import { task } from "hardhat/config";
import fs from "fs/promises";
import { getAccount, getEnvVariable } from "./helpers";

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
    const proxy = await hre.upgrades.deployProxy(nft, [
      "NFT Collectible",
      "NFC",
      payees.map((o) => o.payee),
      payees.map((o) => o.share),
    ]);
    await proxy.deployed();
    const impAddress = await hre.upgrades.erc1967.getImplementationAddress(
      proxy.address
    );
    console.log(`Proxy deployed to address: ${proxy.address}`);
    console.log(`Implementation deployed to address: ${impAddress}`);
  });

task("upgrade", "Upgrades the NFT contract").setAction(async function (
  taskArguments,
  hre
) {
  const proxyAddress = getEnvVariable("NFT_CONTRACT_ADDRESS");
  const nft = await hre.ethers.getContractFactory("NFT", getAccount());
  await hre.upgrades.upgradeProxy(proxyAddress, nft);
  const impAddress = await hre.upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );
  console.log(
    `Contract was upgraded. Implementation deployed to address: ${impAddress}`
  );
});
