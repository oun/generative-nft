import fs from "fs/promises";
import { parse } from "csv-parse/sync";
import { task } from "hardhat/config";

task("deploy", "Deploys the NFT contract")
  .addParam("signerAddress", "Signer address")
  .addParam("publicSaleStartTime", "Public sale start timestamp (seconds)")
  .addParam(
    "whitelistSaleStartTime",
    "Whitelist sale start timestamp (seconds)"
  )
  .addParam("publicMintPrice", "Public mint price")
  .addParam("presaleMintPrice", "Presale mint price")
  .addParam(
    "payments",
    "Path to CSV file contains list of payees and percent share for split payment"
  )
  .setAction(async function (taskArguments, hre) {
    const content = await fs.readFile(taskArguments.payments);
    const payees: string[][] = parse(content);

    const nft = await hre.ethers.getContractFactory("NFT");
    const instance = await nft.deploy(
      taskArguments.signerAddress,
      {
        publicSaleStartTime: taskArguments.publicSaleStartTime,
        whitelistSaleStartTime: taskArguments.whitelistSaleStartTime,
        publicMintPrice: hre.ethers.utils.parseEther(
          taskArguments.publicMintPrice
        ),
        presaleMintPrice: hre.ethers.utils.parseEther(
          taskArguments.presaleMintPrice
        ),
      },
      payees.map((o) => o[0]),
      payees.map((o) => +o[1])
    );
    console.log(`Contract deployed to address: ${instance.address}`);
  });

task("verify", "Verify the NFT contract")
  .addOptionalParam("signerAddress", "Signer address")
  .addOptionalParam(
    "publicSaleStartTime",
    "Public sale start timestamp (seconds)"
  )
  .addOptionalParam(
    "whitelistSaleStartTime",
    "Whitelist sale start timestamp (seconds)"
  )
  .addOptionalParam("publicMintPrice", "Public mint price")
  .addOptionalParam("presaleMintPrice", "Presale mint price")
  .addOptionalParam(
    "payments",
    "Path to CSV file contains list of payees and percent share for split payment"
  )
  .setAction(async function (taskArguments, hre) {
    const content = await fs.readFile(taskArguments.payments);
    const payees: string[][] = parse(content);

    await hre.run("verify:verify", {
      address: taskArguments.address,
      constructorArguments: [
        taskArguments.signerAddress,
        {
          publicSaleStartTime: taskArguments.publicSaleStartTime,
          whitelistSaleStartTime: taskArguments.whitelistSaleStartTime,
          publicMintPrice: hre.ethers.utils.parseEther(
            taskArguments.publicMintPrice
          ),
          presaleMintPrice: hre.ethers.utils.parseEther(
            taskArguments.presaleMintPrice
          ),
        },
        payees.map((o) => o[0]),
        payees.map((o) => +o[1]),
      ],
    });
  });
