import { Contract } from "ethers";
import { expect, use } from "chai";
import { ethers } from "hardhat";

describe("NFT", () => {
  let contract: Contract;

  beforeEach(async () => {
    const [owner, acct] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("NFT");
    contract = await factory.deploy(
      "NFT Collectibles",
      "NFC",
      [owner.address, acct.address],
      [50, 50]
    );
    await contract.deployed();
  });

  it("should mint a token to address", async () => {
    const [owner, acct] = await ethers.getSigners();
    expect(
      contract.mintTo(acct.address, 1, {
        value: ethers.utils.parseEther("0.02"),
      })
    )
      .to.emit(contract, "Transfer")
      .withArgs(ethers.constants.AddressZero, acct.address, "1");

    expect(await contract.balanceOf(acct.address)).to.eq("1");
  });

  it("should mint multiple tokens to address", async () => {
    const [owner, acct] = await ethers.getSigners();
    expect(
      contract.mintTo(acct.address, 3, {
        value: ethers.utils.parseEther("0.06"),
      })
    )
      .to.emit(contract, "Transfer")
      .withArgs(ethers.constants.AddressZero, acct.address, "3");

    expect(await contract.balanceOf(acct.address)).to.eq("3");
  });

  it("should not mint a token given value less than mint price", async () => {
    const [owner, acct] = await ethers.getSigners();
    expect(
      contract.callStatic.mintTo(acct.address, 1, {
        value: ethers.utils.parseEther("0.01"),
      })
    ).to.be.revertedWith("Transaction value did not equal the mint price");
  });

  it("should not mint multiple tokens given value less than mint price", async () => {
    const [owner, acct] = await ethers.getSigners();
    expect(
      contract.callStatic.mintTo(acct.address, 3, {
        value: ethers.utils.parseEther("0.01"),
      })
    ).to.be.revertedWith("Transaction value did not equal the mint price");
  });

  it("should set base token uri", async () => {
    const [owner, acct] = await ethers.getSigners();
    contract.mintTo(acct.address, 1, {
      value: ethers.utils.parseEther("0.02"),
    });
    contract.setBaseTokenURI("ipfs://new-token-uri/");

    expect(await contract.tokenURI(1)).to.eq("ipfs://new-token-uri/1");
  });
});
