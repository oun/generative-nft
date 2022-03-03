import { Contract } from "ethers";
import { expect, use } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("NFT", () => {
  const MINT_PRICE = "0.02";
  const REDEEM_PRICE = "0.01";

  let contract: Contract;
  let [owner, acct]: SignerWithAddress[] = []

  beforeEach(async () => {
    [owner, acct] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("NFT");
    contract = await factory.deploy(
      "NFT Collectibles",
      "NFC",
      [owner.address, acct.address],
      [50, 50]
    );
    await contract.deployed();
  });

  describe("mintTo", () => {
    context("single token", () => {
      it("should mint a token to address", async () => {
        expect(
          contract.mintTo(acct.address, 1, {
            value: ethers.utils.parseEther(MINT_PRICE),
          })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "1");

        expect(await contract.balanceOf(acct.address)).to.eq(1);
      });

      it("should not mint a token given value less than mint price", async () => {
        expect(
          contract.callStatic.mintTo(acct.address, 1, {
            value: ethers.utils.parseEther("0.01"),
          })
        ).to.be.revertedWith("Transaction value did not equal the mint price");
      });
    });

    context("multiple tokens", () => {
      it("should mint multiple tokens to address", async () => {
        expect(
          contract.mintTo(acct.address, 3, {
            value: ethers.utils.parseEther(MINT_PRICE).mul(3),
          })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "3");

        expect(await contract.balanceOf(acct.address)).to.eq(3);
      });

      it("should revert when transaction value less than mint price", async () => {
        expect(
          contract.callStatic.mintTo(acct.address, 3, {
            value: ethers.utils.parseEther("0.01"),
          })
        ).to.be.revertedWith("Transaction value did not equal the mint price");
      });

      it("should revert more than max mint per address", async () => {
        expect(
          contract.callStatic.mintTo(acct.address, 6, {
            value: ethers.utils.parseEther(MINT_PRICE).mul(6),
          })
        ).to.be.revertedWith("Exceed mint limit per address");
      });
    });
  });

  describe("redeemTo", () => {
    let signature: string;
    beforeEach(async () => {
      const hash = Buffer.from(
        ethers.utils.solidityKeccak256(["address"], [acct.address]).slice(2),
        "hex"
      );
      signature = await owner.signMessage(hash);
      await contract.setSignerAddress(owner.address);
    });
    context("single token", () => {
      it("should mint a token to address", async () => {
        await expect(
          contract.connect(acct).redeemTo(acct.address, 1, signature, {
            value: ethers.utils.parseEther(REDEEM_PRICE),
          })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "1");

        expect(await contract.balanceOf(acct.address)).to.eq(1);
      });

      it("should revert when transaction value less than mint price", async () => {
        expect(
          contract.connect(acct).redeemTo(acct.address, 1, signature, {
            value: ethers.utils.parseEther("0.00001"),
          })
        ).to.be.revertedWith("Transaction value did not equal the mint price");
      });

      it("should revert when invalid signature", async () => {
        const signature = await owner.signMessage(
          Buffer.from(
            ethers.utils
              .solidityKeccak256(["address"], [owner.address])
              .slice(2),
            "hex"
          )
        );
        await expect(
          contract.connect(acct).redeemTo(acct.address, 1, signature, {
            value: ethers.utils.parseEther(REDEEM_PRICE),
          })
        )
          .to.be.revertedWith("Signature invalid");
      });

      it("should revert more than max mint per address", async () => {
        expect(
          contract.connect(acct).redeemTo(acct.address, 6, signature, {
            value: ethers.utils.parseEther(REDEEM_PRICE).mul(6),
          })
        ).to.be.revertedWith("Exceed mint limit per address");
      });
    });
  });

  describe("setBaseTokenURI", () => {
    it("should set base token uri", async () => {
      contract.mintTo(acct.address, 1, {
        value: ethers.utils.parseEther(MINT_PRICE),
      });
      contract.setBaseTokenURI("ipfs://new-token-uri/");

      expect(await contract.tokenURI(1)).to.eq("ipfs://new-token-uri/1");
    });
  });

  describe("setSignerAddress", () => {
    it("should set signer address", async () => {
      await contract.setSignerAddress(acct.address);
      expect(await contract.signerAddress()).to.eq(acct.address);
    });
  });
});
