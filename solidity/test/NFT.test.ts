import { Contract } from "ethers";
import { expect, use } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("NFT", () => {
  const MINT_PRICE = "0.02";
  const REDEEM_PRICE = "0.01";

  let contract: Contract;
  let [owner, acct]: SignerWithAddress[] = [];

  beforeEach(async () => {
    [owner, acct] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("NFT");
    contract = await factory.deploy(
      "NFT Collectibles",
      "NFC",
      Math.round(Date.now() / 1000),
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

      it("should revert when transaction value less than mint price", async () => {
        expect(
          contract.mintTo(acct.address, 1, {
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
          contract.mintTo(acct.address, 3, {
            value: ethers.utils.parseEther("0.01"),
          })
        ).to.be.revertedWith("Transaction value did not equal the mint price");
      });

      it("should revert more than max mint per address", async () => {
        expect(
          contract.mintTo(acct.address, 6, {
            value: ethers.utils.parseEther(MINT_PRICE).mul(6),
          })
        ).to.be.revertedWith("Exceed mint limit per address");
      });
    });

    context("when paused", () => {
      beforeEach(() => {
        contract.pause();
      });

      it("should revert while paused", async () => {
        await expect(
          contract.mintTo(acct.address, 1, {
            value: ethers.utils.parseEther(MINT_PRICE),
          })
        ).to.be.revertedWith("Token transfer while paused");
      });
    });

    context("when public sale is tomorrow", () => {
      beforeEach(async () => {
        const factory = await ethers.getContractFactory("NFT");
        contract = await factory.deploy(
          "NFT Collectibles",
          "NFC",
          Math.round(Date.now() / 1000) + 24 * 3600,
          [owner.address, acct.address],
          [50, 50]
        );
        await contract.deployed();
      });

      it("should revert while sale has not started", async () => {
        await expect(
          contract.mintTo(acct.address, 1, {
            value: ethers.utils.parseEther(MINT_PRICE),
          })
        ).to.be.revertedWith("Sale has not started");
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
        ).to.be.revertedWith("Signature invalid");
      });
    });

    context("multiple tokens", () => {
      it("should redeem tokens to address", async () => {
        await expect(
          contract.connect(acct).redeemTo(acct.address, 5, signature, {
            value: ethers.utils.parseEther(REDEEM_PRICE).mul(5),
          })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "5");

        expect(await contract.balanceOf(acct.address)).to.eq(5);
      });

      it("should revert when transaction value less than mint price", async () => {
        expect(
          contract.connect(acct).redeemTo(acct.address, 5, signature, {
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
          contract.connect(acct).redeemTo(acct.address, 5, signature, {
            value: ethers.utils.parseEther(REDEEM_PRICE).mul(5),
          })
        ).to.be.revertedWith("Signature invalid");
      });

      it("should revert more than max mint per address", async () => {
        expect(
          contract.connect(acct).redeemTo(acct.address, 6, signature, {
            value: ethers.utils.parseEther(REDEEM_PRICE).mul(6),
          })
        ).to.be.revertedWith("Exceed mint limit per address");
      });
    });

    context("when sale start time is tomorrow", () => {
      beforeEach(() => {
        contract.setSaleStartTime(Math.round(Date.now() / 1000) + 24 * 3600);
      });
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
    })

    context("when paused", () => {
      beforeEach(() => {
        contract.pause();
      });

      it("should revert while paused", async () => {
        await expect(
          contract.connect(acct).redeemTo(acct.address, 1, signature, {
            value: ethers.utils.parseEther(REDEEM_PRICE),
          })
        ).to.be.revertedWith("Token transfer while paused");
      });
    });
  });

  describe("transferFrom", () => {
    beforeEach(async () => {
      await contract.mintTo(acct.address, 1, {
        value: ethers.utils.parseEther(MINT_PRICE),
      });
    });

    it("should transfer token to address", async () => {
      await expect(
        contract.connect(acct).transferFrom(acct.address, owner.address, 1)
      )
        .to.emit(contract, "Transfer")
        .withArgs(acct.address, owner.address, "1");

      expect(await contract.balanceOf(acct.address)).to.eq(0);
      expect(await contract.balanceOf(owner.address)).to.eq(1);
    });

    it("should revert while paused", async () => {
      await contract.pause();
      await expect(
        contract.connect(acct).transferFrom(acct.address, owner.address, 1)
      ).to.be.revertedWith("Token transfer while paused");
    });
  });

  describe("pause", () => {
    it("should pause", async () => {
      await contract.pause();

      expect(await contract.paused()).to.eq(true);
    });

    it("should revert while paused", async () => {
      await contract.pause();
      await expect(contract.pause()).to.be.revertedWith("Pausable: paused");
    });

    it("should revert when caller is not the owner", async () => {
      await expect(
        contract.connect(acct).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("unpause", () => {
    beforeEach(async () => {
      await contract.pause();
    });

    it("should unpause", async () => {
      await contract.unpause();

      expect(await contract.paused()).to.eq(false);
    });

    it("should revert while unpaused", async () => {
      await contract.unpause();
      await expect(contract.unpause()).to.be.revertedWith(
        "Pausable: not paused"
      );
    });

    it("should revert when caller is not the owner", async () => {
      await expect(contract.connect(acct).unpause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });

  describe("setBaseTokenURI", () => {
    beforeEach(async () => {
      await contract.mintTo(acct.address, 1, {
        value: ethers.utils.parseEther(MINT_PRICE),
      });
    });
    it("should set base token uri", async () => {
      contract.setBaseTokenURI("ipfs://new-token-uri/");

      expect(await contract.tokenURI(1)).to.eq("ipfs://new-token-uri/1");
    });

    it("should revert when caller is not the owner", async () => {
      await expect(
        contract.connect(acct).setBaseTokenURI("ipfs://new-token-uri/")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("setSignerAddress", () => {
    it("should set signer address", async () => {
      await contract.setSignerAddress(acct.address);
      expect(await contract.signerAddress()).to.eq(acct.address);
    });

    it("should revert when caller is not the owner", async () => {
      await expect(
        contract.connect(acct).setSignerAddress(acct.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("setSaleStartTime", () => {
    const saleStartTime = 1666832400;

    it("should set sale start time", async () => {
      await contract.setSaleStartTime(saleStartTime);
      expect(await contract.saleStartTime()).to.eq(saleStartTime);
    });

    it("should revert when caller is not the owner", async () => {
      await expect(
        contract.connect(acct).setSaleStartTime(saleStartTime)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
