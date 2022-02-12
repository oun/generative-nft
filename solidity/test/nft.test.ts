import { Contract } from "ethers";
import { expect, use } from "chai";
import { ethers } from "hardhat";

describe("NFT", () => {
  let contract: Contract;

  beforeEach(async () => {
    const factory = await ethers.getContractFactory("NFT");
    contract = await factory.deploy();
    await contract.deployed();
  });

  it("should mint to address", async () => {
    const [owner, acct] = await ethers.getSigners();
    expect(
      contract.mintTo(acct.address, {
        value: ethers.utils.parseEther("0.02"),
      })
    )
      .to.emit(contract, "Transfer")
      .withArgs(ethers.constants.AddressZero, acct.address, "1");

    expect(await contract.balanceOf(acct.address)).to.eq("1");
  });

  it("should return new token id", async () => {
    const [owner, acct] = await ethers.getSigners();
    expect(
      await contract.callStatic.mintTo(acct.address, {
        value: ethers.utils.parseEther("0.02"),
      })
    ).to.eq(1);
  });

  it("should not mint given value less than mint price", async () => {
    const [owner, acct] = await ethers.getSigners();
    expect(
      contract.callStatic.mintTo(acct.address, {
        value: ethers.utils.parseEther("0.01"),
      })
    ).to.be.revertedWith("Transaction value did not equal the mint price");
  });
});
