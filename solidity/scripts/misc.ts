import { task } from "hardhat/config";
import { getContract } from "./helpers";
import fetch from "node-fetch";
import { formatEther } from "ethers/lib/utils";
import fs from "fs/promises";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

task("check-balance", "Prints out the token balance of address")
  .addPositionalParam("address", "The account to check balance")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(hre);
    const balance = await contract.balanceOf(taskArguments.address);
    console.log(`Account balance for ${taskArguments.address}: ${balance}`);
  });

task("check-owner", "Prints out the owner address of token id")
  .addPositionalParam("tokenId", "The token id to check owner")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(hre);
    const owner = await contract.ownerOf(taskArguments.tokenId);
    console.log(`Token owner for ${taskArguments.tokenId}: ${owner}`);
  });

task(
  "set-base-token-uri",
  "Sets the base token URI for the deployed smart contract"
)
  .addPositionalParam("baseUrl", "The base of the tokenURI endpoint to set")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(hre);
    const transactionResponse = await contract.setBaseTokenURI(
      taskArguments.baseUrl,
      {
        gasPrice: hre.ethers.provider.getGasPrice(),
        gasLimit: 500_000,
      }
    );
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });

task("token-uri", "Fetches the token metadata for the given token ID")
  .addPositionalParam("tokenId", "The tokenID to fetch metadata for")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(hre);
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
    const contract = await getContract(hre);
    const transactionResponse = await contract.setSignerAddress(
      taskArguments.address,
      {
        gasPrice: hre.ethers.provider.getGasPrice(),
        gasLimit: 500_000,
      }
    );
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });

task("signer-address", "Get the signer address").setAction(async function (
  taskArguments,
  hre
) {
  const contract = await getContract(hre);
  const address = await contract.signerAddress();
  console.log(`Signer address: ${address}`);
});

task("set-sale-configuration", "Sets the sale configuration")
  .addParam("publicSaleStartTime", "Public sale start timestamp (seconds)")
  .addParam(
    "whitelistSaleStartTime",
    "Whitelist sale start timestamp (seconds)"
  )
  .addParam("publicMintPrice", "Public mint price")
  .addParam("presaleMintPrice", "Presale mint price")
  .setAction(async function (taskArguments, hre) {
    const contract = await getContract(hre);
    const transactionResponse = await contract.setSaleConfiguration(
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
      {
        gasPrice: hre.ethers.provider.getGasPrice(),
        gasLimit: 500_000,
      }
    );
    console.log(`Transaction Hash: ${transactionResponse.hash}`);
  });

task("sale-configuration", "Get sale configuration").setAction(async function (
  taskArguments,
  hre
) {
  const contract = await getContract(hre);
  const saleConfiguration = await contract.saleConfiguration();
  console.log(
    `Public sale start time: ${new Date(
      saleConfiguration.publicSaleStartTime * 1000
    )}`
  );
  console.log(
    `Presale sale start time: ${new Date(
      saleConfiguration.whitelistSaleStartTime * 1000
    )}`
  );
  console.log(
    `Public mint price: ${formatEther(saleConfiguration.publicMintPrice)}`
  );
  console.log(
    `Presale mint price: ${formatEther(saleConfiguration.presaleMintPrice)}`
  );
});

task("sign", "Create signatures for whitelist")
  .addParam(
    "input",
    "The input file path contains recipient addresses and quantity"
  )
  .addParam("output", "The output CSV file path")
  .addParam("privateKey", "Private key used for signing message")
  .addParam("saleType", "The sale type e.g. 1 for presale, 2 for free mint")
  .setAction(async function (taskArguments, hre) {
    const { privateKey, input, output, saleType } = taskArguments;
    console.log(`Reading addresses from: ${input}`);
    const wallet = new hre.ethers.Wallet(privateKey);
    const signatures = [];
    const data = await fs.readFile(input);
    for (const [account, quantity] of parse(data)) {
      const hash = Buffer.from(
        hre.ethers.utils
          .solidityKeccak256(
            ["address", "uint8", "uint8"],
            [account, saleType, +quantity]
          )
          .slice(2),
        "hex"
      );
      const signature = await wallet.signMessage(hash);
      signatures.push({
        account,
        saleType: +saleType,
        quantity: +quantity,
        signature,
      });
    }
    console.log(`Writing signatures to: ${output}`);
    await fs.writeFile(output, stringify(signatures, { header: true }));
  });
