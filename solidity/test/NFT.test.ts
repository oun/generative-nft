import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("NFT", () => {
  const PUBLIC_MINT_PRICE = "0.03";
  const PRESALE_MINT_PRICE = "0.01";
  const MAX_MINT_PER_ADDRESS = 10;

  enum SaleType {
    Public,
    Presale,
    Free,
  }

  let contract: Contract;
  let [owner, acct]: SignerWithAddress[] = [];

  beforeEach(async () => {
    [owner, acct] = await ethers.getSigners();
    const factory = await ethers.getContractFactory("NFT");
    contract = await factory.deploy(
      owner.address,
      {
        publicSaleStartTime: Math.round(
          Date.parse("2022-05-05T09:00:00") / 1000
        ),
        whitelistSaleStartTime: Math.round(
          Date.parse("2022-05-05T09:00:00") / 1000
        ),
        publicMintPrice: ethers.utils.parseEther(PUBLIC_MINT_PRICE),
        presaleMintPrice: ethers.utils.parseEther(PRESALE_MINT_PRICE),
      },
      [owner.address, acct.address],
      [50, 50]
    );
    await contract.deployed();
  });

  describe("mintPublic", () => {
    context("single token", () => {
      it("should mint a token to address", async () => {
        await expect(
          contract.mintPublic(acct.address, 1, {
            value: ethers.utils.parseEther(PUBLIC_MINT_PRICE),
          })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "1");

        expect(await contract.balanceOf(acct.address)).to.eq(1);
      });

      it("should revert when transaction value less than mint price", async () => {
        await expect(
          contract.mintPublic(acct.address, 1, {
            value: ethers.utils.parseEther("0.01"),
          })
        ).to.be.revertedWith("Transaction value did not equal the mint price");
      });
    });

    context("multiple tokens", () => {
      it("should mint multiple tokens to address", async () => {
        await expect(
          contract.mintPublic(acct.address, 3, {
            value: ethers.utils.parseEther(PUBLIC_MINT_PRICE).mul(3),
          })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "3");

        expect(await contract.balanceOf(acct.address)).to.eq(3);
      });

      it("should revert when transaction value less than mint price", async () => {
        await expect(
          contract.mintPublic(acct.address, 3, {
            value: ethers.utils.parseEther("0.01"),
          })
        ).to.be.revertedWith("Transaction value did not equal the mint price");
      });

      it("should revert more than max mint per address", async () => {
        const quantity = MAX_MINT_PER_ADDRESS + 1;
        await expect(
          contract.mintPublic(acct.address, quantity, {
            value: ethers.utils.parseEther(PUBLIC_MINT_PRICE).mul(quantity),
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
          contract.mintPublic(acct.address, 1, {
            value: ethers.utils.parseEther(PUBLIC_MINT_PRICE),
          })
        ).to.be.revertedWith("Token transfer while paused");
      });
    });

    context("when public sale is tomorrow", () => {
      beforeEach(async () => {
        contract.setSaleConfiguration({
          publicSaleStartTime: Math.round(Date.now() / 1000) + 24 * 3600,
          whitelistSaleStartTime: Math.round(Date.now() / 1000),
          publicMintPrice: ethers.utils.parseEther(PUBLIC_MINT_PRICE),
          presaleMintPrice: ethers.utils.parseEther(PRESALE_MINT_PRICE),
        });
      });

      it("should revert while public sales has not started", async () => {
        await expect(
          contract.mintPublic(acct.address, 1, {
            value: ethers.utils.parseEther(PUBLIC_MINT_PRICE),
          })
        ).to.be.revertedWith("Public sales has not started");
      });
    });
  });

  describe("mintPresale", () => {
    let signature: string;

    beforeEach(async () => {
      await contract.setSignerAddress(owner.address);
    });

    context("single token", () => {
      beforeEach(async () => {
        signature = await signAccount(acct.address, SaleType.Presale, 1);
      });

      it("should mint a token to address", async () => {
        await expect(
          contract.connect(acct).mintPresale(acct.address, 1, 1, signature, {
            value: ethers.utils.parseEther(PRESALE_MINT_PRICE),
          })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "1");

        expect(await contract.balanceOf(acct.address)).to.eq(1);
      });

      it("should revert when transaction value less than mint price", async () => {
        await expect(
          contract.connect(acct).mintPresale(acct.address, 1, 1, signature, {
            value: ethers.utils.parseEther("0.00001"),
          })
        ).to.be.revertedWith("Transaction value did not equal the mint price");
      });

      it("should revert when incorrect recipient address", async () => {
        const signature = await signAccount(owner.address, SaleType.Presale, 1);
        await expect(
          contract.connect(acct).mintPresale(acct.address, 1, 1, signature, {
            value: ethers.utils.parseEther(PRESALE_MINT_PRICE),
          })
        ).to.be.revertedWith("Signature invalid");
      });

      it("should revert when incorrect reserved quantity", async () => {
        const signature = await signAccount(owner.address, SaleType.Presale, 1);
        await expect(
          contract.connect(acct).mintPresale(acct.address, 2, 2, signature, {
            value: ethers.utils.parseEther(PRESALE_MINT_PRICE),
          })
        ).to.be.revertedWith("Signature invalid");
      });

      it("should revert when incorrect sale type", async () => {
        const signature = await signAccount(owner.address, SaleType.Free, 1);
        await expect(
          contract.connect(acct).mintPresale(acct.address, 1, 1, signature, {
            value: ethers.utils.parseEther(PRESALE_MINT_PRICE),
          })
        ).to.be.revertedWith("Signature invalid");
      });

      it("should revert when mint more than eligible quantity", async () => {
        const eligibleQuantity = 2;
        const signature = await signAccount(
          acct.address,
          SaleType.Presale,
          eligibleQuantity
        );

        await expect(
          contract
            .connect(acct)
            .mintPresale(acct.address, 1, eligibleQuantity, signature, {
              value: ethers.utils.parseEther(PRESALE_MINT_PRICE),
            })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "1");

        await expect(
          contract
            .connect(acct)
            .mintPresale(acct.address, 1, eligibleQuantity, signature, {
              value: ethers.utils.parseEther(PRESALE_MINT_PRICE),
            })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "2");

        await expect(
          contract
            .connect(acct)
            .mintPresale(acct.address, 1, eligibleQuantity, signature, {
              value: ethers.utils.parseEther(PRESALE_MINT_PRICE),
            })
        ).to.be.revertedWith("Exceed eligible presale mint");

        expect(await contract.balanceOf(acct.address)).to.eq(2);
      });
    });

    context("multiple tokens", () => {
      beforeEach(async () => {
        signature = await signAccount(acct.address, SaleType.Presale, 5);
      });

      it("should mint tokens to address", async () => {
        await expect(
          contract.connect(acct).mintPresale(acct.address, 5, 5, signature, {
            value: ethers.utils.parseEther(PRESALE_MINT_PRICE).mul(5),
          })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "5");

        expect(await contract.balanceOf(acct.address)).to.eq(5);
      });

      it("should revert when transaction value less than mint price", async () => {
        await expect(
          contract.connect(acct).mintPresale(acct.address, 5, 5, signature, {
            value: ethers.utils.parseEther("0.00001"),
          })
        ).to.be.revertedWith("Transaction value did not equal the mint price");
      });

      it("should revert when account does not match", async () => {
        const signature = await signAccount(owner.address, SaleType.Free, 5);
        await expect(
          contract.connect(acct).mintPresale(acct.address, 5, 5, signature, {
            value: ethers.utils.parseEther(PRESALE_MINT_PRICE).mul(5),
          })
        ).to.be.revertedWith("Signature invalid");
      });

      it("should revert when quantity does not match", async () => {
        const signature = await signAccount(owner.address, SaleType.Presale, 1);
        await expect(
          contract.connect(acct).mintPresale(acct.address, 5, 5, signature, {
            value: ethers.utils.parseEther(PRESALE_MINT_PRICE).mul(5),
          })
        ).to.be.revertedWith("Signature invalid");
      });

      it("should revert more than max mint per address", async () => {
        const quantity = MAX_MINT_PER_ADDRESS + 1;
        const signature = await signAccount(acct.address, 1, quantity);
        await expect(
          contract
            .connect(acct)
            .mintPresale(acct.address, quantity, quantity, signature, {
              value: ethers.utils.parseEther(PRESALE_MINT_PRICE).mul(quantity),
            })
        ).to.be.revertedWith("Exceed mint limit per address");
      });

      it("should revert when mint more than eligible quantity", async () => {
        const eligibleQuantity = 5;
        const signature = await signAccount(
          acct.address,
          SaleType.Presale,
          eligibleQuantity
        );

        await expect(
          contract
            .connect(acct)
            .mintPresale(acct.address, 2, eligibleQuantity, signature, {
              value: ethers.utils.parseEther(PRESALE_MINT_PRICE).mul(2),
            })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "1");

        await expect(
          contract
            .connect(acct)
            .mintPresale(acct.address, 2, eligibleQuantity, signature, {
              value: ethers.utils.parseEther(PRESALE_MINT_PRICE).mul(2),
            })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "3");

        await expect(
          contract
            .connect(acct)
            .mintPresale(acct.address, 2, eligibleQuantity, signature, {
              value: ethers.utils.parseEther(PRESALE_MINT_PRICE).mul(2),
            })
        ).to.be.revertedWith("Exceed eligible presale mint");

        expect(await contract.balanceOf(acct.address)).to.eq(4);
      });
    });

    context("when public sale start time is tomorrow", () => {
      beforeEach(() => {
        contract.setSaleConfiguration({
          publicSaleStartTime: Math.round(Date.now() / 1000) + 24 * 3600,
          whitelistSaleStartTime: Math.round(Date.now() / 1000),
          publicMintPrice: ethers.utils.parseEther(PUBLIC_MINT_PRICE),
          presaleMintPrice: ethers.utils.parseEther(PRESALE_MINT_PRICE),
        });
      });
      it("should mint a token to address", async () => {
        const signature = await signAccount(acct.address, 1, 1);
        await expect(
          contract.connect(acct).mintPresale(acct.address, 1, 1, signature, {
            value: ethers.utils.parseEther(PRESALE_MINT_PRICE),
          })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "1");

        expect(await contract.balanceOf(acct.address)).to.eq(1);
      });
    });

    context("when whitelist sale start time is tomorrow", () => {
      beforeEach(() => {
        contract.setSaleConfiguration({
          publicSaleStartTime: Math.round(Date.now() / 1000),
          whitelistSaleStartTime: Math.round(Date.now() / 1000) + 24 * 3600,
          publicMintPrice: ethers.utils.parseEther(PUBLIC_MINT_PRICE),
          presaleMintPrice: ethers.utils.parseEther(PRESALE_MINT_PRICE),
        });
      });

      it("should revert with whitelist sales has not started error", async () => {
        const signature = await signAccount(acct.address, SaleType.Presale, 1);
        await expect(
          contract.connect(acct).mintPresale(acct.address, 1, 1, signature, {
            value: ethers.utils.parseEther(PRESALE_MINT_PRICE),
          })
        ).to.be.revertedWith("Whitelist sales has not started");
      });
    });

    context("when paused", () => {
      beforeEach(() => {
        contract.pause();
      });

      it("should revert while paused", async () => {
        const signature = await signAccount(acct.address, 1, 1);
        await expect(
          contract.connect(acct).mintPresale(acct.address, 1, 1, signature, {
            value: ethers.utils.parseEther(PRESALE_MINT_PRICE),
          })
        ).to.be.revertedWith("Token transfer while paused");
      });
    });
  });

  describe("redeem", () => {
    let signature: string;

    beforeEach(async () => {
      await contract.setSignerAddress(owner.address);
    });

    context("single token", () => {
      beforeEach(async () => {
        signature = await signAccount(acct.address, SaleType.Free, 1);
      });

      it("should mint a token to address", async () => {
        await expect(
          contract.connect(acct).redeem(acct.address, 1, 1, signature, {
            value: 0,
          })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "1");

        expect(await contract.balanceOf(acct.address)).to.eq(1);
      });

      it("should revert when recipient address does not match", async () => {
        const signature = await signAccount(owner.address, SaleType.Free, 1);
        await expect(
          contract.connect(acct).redeem(acct.address, 1, 1, signature, {
            value: 0,
          })
        ).to.be.revertedWith("Signature invalid");
      });

      it("should revert when reserved quantity does not match", async () => {
        const signature = await signAccount(owner.address, SaleType.Free, 1);
        await expect(
          contract.connect(acct).redeem(acct.address, 2, 2, signature, {
            value: 0,
          })
        ).to.be.revertedWith("Signature invalid");
      });

      it("should revert when sale type is not free", async () => {
        const signature = await signAccount(owner.address, SaleType.Presale, 1);
        await expect(
          contract.connect(acct).redeem(acct.address, 1, 1, signature, {
            value: 0,
          })
        ).to.be.revertedWith("Signature invalid");
      });

      it("should revert when redeem more than eligible quantity", async () => {
        const eligibleQuantity = 2;
        const signature = await signAccount(
          acct.address,
          SaleType.Free,
          eligibleQuantity
        );

        await expect(
          contract
            .connect(acct)
            .redeem(acct.address, 1, eligibleQuantity, signature, {
              value: 0,
            })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "1");

        await expect(
          contract
            .connect(acct)
            .redeem(acct.address, 1, eligibleQuantity, signature, {
              value: 0,
            })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "2");

        await expect(
          contract
            .connect(acct)
            .redeem(acct.address, 1, eligibleQuantity, signature, {
              value: 0,
            })
        ).to.be.revertedWith("Exceed eligible free mint");

        expect(await contract.balanceOf(acct.address)).to.eq(2);
      });
    });

    context("multiple tokens", () => {
      beforeEach(async () => {
        signature = await signAccount(acct.address, SaleType.Free, 5);
      });

      it("should mint tokens to address", async () => {
        await expect(
          contract.connect(acct).redeem(acct.address, 5, 5, signature, {
            value: 0,
          })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "5");

        expect(await contract.balanceOf(acct.address)).to.eq(5);
      });

      it("should revert when account does not match", async () => {
        const signature = await signAccount(owner.address, SaleType.Free, 5);
        await expect(
          contract.connect(acct).redeem(acct.address, 5, 5, signature, {
            value: 0,
          })
        ).to.be.revertedWith("Signature invalid");
      });

      it("should revert when quantity does not match", async () => {
        const signature = await signAccount(owner.address, SaleType.Free, 1);
        await expect(
          contract.connect(acct).redeem(acct.address, 5, 5, signature, {
            value: 0,
          })
        ).to.be.revertedWith("Signature invalid");
      });

      it("should revert more than max mint per address", async () => {
        const quantity = MAX_MINT_PER_ADDRESS + 1;
        const signature = await signAccount(
          acct.address,
          SaleType.Free,
          quantity
        );
        await expect(
          contract
            .connect(acct)
            .redeem(acct.address, quantity, quantity, signature, {
              value: 0,
            })
        ).to.be.revertedWith("Exceed mint limit per address");
      });
    });

    context("when public sale start time is tomorrow", () => {
      beforeEach(() => {
        contract.setSaleConfiguration({
          publicSaleStartTime: Math.round(Date.now() / 1000) + 24 * 3600,
          whitelistSaleStartTime: Math.round(Date.now() / 1000),
          publicMintPrice: ethers.utils.parseEther(PUBLIC_MINT_PRICE),
          presaleMintPrice: ethers.utils.parseEther(PRESALE_MINT_PRICE),
        });
      });

      it("should redeem a token to address", async () => {
        const signature = await signAccount(acct.address, SaleType.Free, 1);
        await expect(
          contract.connect(acct).redeem(acct.address, 1, 1, signature, {
            value: 0,
          })
        )
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acct.address, "1");

        expect(await contract.balanceOf(acct.address)).to.eq(1);
      });
    });

    context("when whitelist sale start time is tomorrow", () => {
      beforeEach(() => {
        contract.setSaleConfiguration({
          publicSaleStartTime: Math.round(Date.now() / 1000),
          whitelistSaleStartTime: Math.round(Date.now() / 1000) + 24 * 3600,
          publicMintPrice: ethers.utils.parseEther(PUBLIC_MINT_PRICE),
          presaleMintPrice: ethers.utils.parseEther(PRESALE_MINT_PRICE),
        });
      });

      it("should revert with whitelist sales has not started error", async () => {
        const signature = await signAccount(acct.address, SaleType.Free, 1);
        await expect(
          contract.connect(acct).redeem(acct.address, 1, 1, signature, {
            value: 0,
          })
        ).to.be.revertedWith("Whitelist sales has not started");
      });
    });

    context("when paused", () => {
      beforeEach(() => {
        contract.pause();
      });

      it("should revert while paused", async () => {
        const signature = await signAccount(acct.address, SaleType.Free, 1);
        await expect(
          contract.connect(acct).redeem(acct.address, 1, 1, signature, {
            value: 0,
          })
        ).to.be.revertedWith("Token transfer while paused");
      });
    });
  });

  describe("airdrop", () => {
    it("should mint to a recipient", async () => {
      await expect(contract.airdrop([acct.address], [2]))
        .to.emit(contract, "Transfer")
        .withArgs(ethers.constants.AddressZero, acct.address, "1");

      expect(await contract.balanceOf(acct.address)).to.eq(2);
    });

    it("should mint to multiple recipients", async () => {
      await expect(contract.airdrop([owner.address, acct.address], [1, 2]))
        .to.emit(contract, "Transfer")
        .withArgs(ethers.constants.AddressZero, owner.address, "1")
        .and.to.emit(contract, "Transfer")
        .withArgs(ethers.constants.AddressZero, acct.address, "2");

      expect(await contract.balanceOf(owner.address)).to.eq(1);
      expect(await contract.balanceOf(acct.address)).to.eq(2);
    });

    it("should revert with number of recipient did not equal to quantity error", async () => {
      await expect(
        contract.airdrop([owner.address, acct.address], [2])
      ).to.be.revertedWith(
        "Number of recipients did not equal to quantity length"
      );
    });

    it("should revert with caller is not the owner error", async () => {
      await expect(
        contract.connect(acct).airdrop([owner.address], [2])
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("transferFrom", () => {
    beforeEach(async () => {
      await contract.mintPublic(acct.address, 1, {
        value: ethers.utils.parseEther(PUBLIC_MINT_PRICE),
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
      await expect(contract.connect(acct).pause()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
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
      await contract.mintPublic(acct.address, 1, {
        value: ethers.utils.parseEther(PUBLIC_MINT_PRICE),
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

  describe("setSaleConfiguration", () => {
    const saleConfiguration = {
      publicSaleStartTime: Math.round(Date.parse("2022-06-01T09:00:00") / 1000),
      whitelistSaleStartTime: Math.round(
        Date.parse("2022-06-01T09:00:00") / 1000
      ),
      publicMintPrice: ethers.utils.parseEther("0.05"),
      presaleMintPrice: ethers.utils.parseEther("0.02"),
    };

    it("should set sale configuration", async () => {
      await contract.setSaleConfiguration(saleConfiguration);
      const config = await contract.saleConfiguration();
      expect(config.publicSaleStartTime.toNumber()).to.eq(
        saleConfiguration.publicSaleStartTime
      );
      expect(config.whitelistSaleStartTime.toNumber()).to.eq(
        saleConfiguration.whitelistSaleStartTime
      );
      expect(config.publicMintPrice).to.eq(saleConfiguration.publicMintPrice);
      expect(config.publicMintPrice).to.eq(saleConfiguration.publicMintPrice);
    });

    it("should revert when caller is not the owner", async () => {
      await expect(
        contract.connect(acct).setSaleConfiguration(saleConfiguration)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  const signAccount = async (
    address: string,
    saleType: number,
    quantity: number
  ) => {
    const hash = Buffer.from(
      ethers.utils
        .solidityKeccak256(
          ["address", "uint8", "uint8"],
          [address, saleType, quantity]
        )
        .slice(2),
      "hex"
    );
    return await owner.signMessage(hash);
  };
});
