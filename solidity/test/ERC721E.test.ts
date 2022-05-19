import { Contract } from "ethers";
import { expect, use } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TransactionResponse } from "@ethersproject/abstract-provider";

describe("ERC721E", () => {
  let contract: Contract;
  let [owner, acc1, acc2, acc3]: SignerWithAddress[] = [];

  beforeEach(async () => {
    [owner, acc1, acc2, acc3] = await ethers.getSigners();
    const ERC721EMock = await ethers.getContractFactory("ERC721EMock");
    contract = await ERC721EMock.deploy("Mock ERC721E", "MCK");
    await contract.deployed();
    await contract.mint(acc1.address, 1);
    await contract.mint(acc2.address, 2);
  });

  describe("metadata", () => {
    it("returns symbol", async () => {
      expect(await contract.symbol()).to.eq("MCK");
    });

    it("returns name", async () => {
      expect(await contract.name()).to.eq("Mock ERC721E");
    });
  });

  describe("totalSupply", () => {
    it("returns total token supply", async () => {
      expect(await contract.totalSupply()).to.eq(3);
    });
  });

  describe("balanceOf", () => {
    it("returns balance of an address", async () => {
      expect(await contract.balanceOf(acc1.address)).to.eq(1);
      expect(await contract.balanceOf(acc2.address)).to.eq(2);
      expect(await contract.balanceOf(acc3.address)).to.eq(0);
    });

    it("reverts when zero address", async () => {
      await expect(
        contract.balanceOf(ethers.constants.AddressZero)
      ).to.be.revertedWith("ERC721: balance query for the zero address");
    });
  });

  describe("_mintAmountOf", () => {
    it("returns minted tokens of an address", async () => {
      expect(await contract.mintAmountOf(acc1.address)).to.eq(1);
      expect(await contract.mintAmountOf(acc2.address)).to.eq(2);
      expect(await contract.mintAmountOf(acc3.address)).to.eq(0);
    });
  });

  describe("ownerOf", () => {
    it("returns owner of token", async () => {
      expect(await contract.ownerOf(1)).to.eq(acc1.address);
      expect(await contract.ownerOf(2)).to.eq(acc2.address);
      expect(await contract.ownerOf(3)).to.eq(acc2.address);
    });

    it("reverts when invalid token", async () => {
      await expect(contract.ownerOf(99)).to.be.revertedWith(
        "ERC721: owner query for nonexistent token"
      );
    });
  });

  describe("exists", () => {
    it("returns true when valid token", async () => {
      expect(await contract.exists(1)).to.eq(true);
    });

    it("returns false when invalid token", async () => {
      expect(await contract.exists(99)).to.eq(false);
    });
  });

  describe("_mint", () => {
    context("single token", () => {
      let tx: TransactionResponse;
      beforeEach(() => {
        tx = contract.mint(acc1.address, 1);
      });

      it("emit Transfer event", async () => {
        await expect(tx)
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, acc1.address, "4");
      });

      it("owner has token", async () => {
        expect(await contract.balanceOf(acc1.address)).to.eq(2);
        expect(await contract.mintAmountOf(acc1.address)).to.eq(2);
        expect(await contract.ownerOf(4)).to.eq(acc1.address);
      });
    });

    context("multiple tokens", () => {
      let tx: TransactionResponse;
      beforeEach(() => {
        tx = contract.mint(acc1.address, 5);
      });

      it("emit Transfer events", async () => {
        const startTokenId = 4;
        for (let id = startTokenId; id < startTokenId + 5; id++) {
          await expect(tx)
            .to.emit(contract, "Transfer")
            .withArgs(ethers.constants.AddressZero, acc1.address, id);
        }
      });

      it("owner has tokens", async () => {
        const startTokenId = 4;
        expect(await contract.balanceOf(acc1.address)).to.eq(6);
        expect(await contract.mintAmountOf(acc1.address)).to.eq(6);
        for (let id = startTokenId; id < startTokenId + 5; id++) {
          expect(await contract.ownerOf(id)).to.eq(acc1.address);
        }
      });
    });

    it("reverts when mint to zero address", async () => {
      await expect(
        contract.mint(ethers.constants.AddressZero, 1)
      ).to.be.revertedWith("ERC721: mint to the zero address");
    });

    it("reverts when mint zero quantity", async () => {
      await expect(contract.mint(acc3.address, 0)).to.be.revertedWith(
        "ERC721: mint quantity is zero"
      );
    });
  });

  describe("safeMint", () => {
    let receiver: Contract;
    const receiverMagicValue = "0x150b7a02";
    beforeEach(async () => {
      const ERC721ReceiverMock = await ethers.getContractFactory(
        "ERC721ReceiverMock"
      );
      receiver = await ERC721ReceiverMock.deploy("0x150b7a02");
      await receiver.deployed();
    });

    context("single token", () => {
      let tx: TransactionResponse;
      beforeEach(() => {
        tx = contract.safeMint(receiver.address, 1);
      });

      it("emit Transfer event", async () => {
        await expect(tx)
          .to.emit(contract, "Transfer")
          .withArgs(ethers.constants.AddressZero, receiver.address, "4");
      });

      it("emit Received event", async () => {
        await expect(tx)
          .to.emit(receiver, "Received")
          .withArgs(
            owner.address,
            ethers.constants.AddressZero,
            4,
            "0x",
            20000
          );
      });

      it("owner has token", async () => {
        expect(await contract.balanceOf(receiver.address)).to.eq(1);
        expect(await contract.mintAmountOf(receiver.address)).to.eq(1);
        expect(await contract.ownerOf(4)).to.eq(receiver.address);
      });
    });

    context("multiple tokens", () => {
      let tx: TransactionResponse;
      beforeEach(() => {
        tx = contract.safeMint(receiver.address, 5);
      });

      it("emit Transfer events", async () => {
        const startTokenId = 4;
        for (let id = startTokenId; id < startTokenId + 5; id++) {
          await expect(tx)
            .to.emit(contract, "Transfer")
            .withArgs(ethers.constants.AddressZero, receiver.address, id);
        }
      });

      it("emit Received event", async () => {
        await expect(tx)
          .to.emit(receiver, "Received")
          .withArgs(
            owner.address,
            ethers.constants.AddressZero,
            8,
            "0x",
            20000
          );
      });

      it("owner has tokens", async () => {
        const startTokenId = 4;
        expect(await contract.balanceOf(receiver.address)).to.eq(5);
        expect(await contract.mintAmountOf(receiver.address)).to.eq(5);
        for (let id = startTokenId; id < startTokenId + 5; id++) {
          expect(await contract.ownerOf(id)).to.eq(receiver.address);
        }
      });
    });
  });

  describe("_burn", () => {
    let tx: TransactionResponse;
    const tokenId = 1;
    beforeEach(() => {
      tx = contract.burn(tokenId);
    });

    it("remove token from owner", async () => {
      await expect(contract.ownerOf(tokenId)).to.be.revertedWith(
        "ERC721: owner query for nonexistent token"
      );
      expect(await contract.balanceOf(acc1.address)).to.eq(0);
    });

    it("reduces total token supply", async () => {
      expect(await contract.totalSupply()).to.eq(2);
    });

    it("emit Transfer event", async () => {
      await expect(tx)
        .to.emit(contract, "Transfer")
        .withArgs(acc1.address, ethers.constants.AddressZero, tokenId);
    });

    it("emit Approval event", async () => {
      await expect(tx)
        .to.emit(contract, "Approval")
        .withArgs(acc1.address, ethers.constants.AddressZero, tokenId);
    });

    it("reverts when invalid token", async () => {
      await expect(contract.burn(99)).to.be.revertedWith(
        "ERC721: owner query for nonexistent token"
      );
    });
  });

  describe("_transfer", () => {
    let tx: TransactionResponse;
    let from: string;
    let to: string;
    const tokenId = 1;
    beforeEach(() => {
      from = acc1.address;
      to = acc3.address;
      tx = contract.transfer(from, to, tokenId);
    });

    it("clears token approval", async () => {
      expect(await contract.getApproved(tokenId)).to.eq(
        ethers.constants.AddressZero
      );
    });

    it("adjusts sender balance", async () => {
      expect(await contract.balanceOf(from)).to.eq(0);
    });

    it("adjusts receiver balance", async () => {
      expect(await contract.balanceOf(to)).to.eq(1);
    });

    it("transfers token ownership to receiver", async () => {
      expect(await contract.ownerOf(tokenId)).to.eq(to);
    });

    it("emit Approval event", async () => {
      await expect(tx)
        .to.emit(contract, "Approval")
        .withArgs(from, ethers.constants.AddressZero, tokenId);
    });

    it("emit Transfer event", async () => {
      await expect(tx)
        .to.emit(contract, "Transfer")
        .withArgs(from, to, tokenId);
    });

    it("reverts when token not belongs to sender", async () => {
      await expect(
        contract.transfer(acc2.address, to, tokenId)
      ).to.be.revertedWith("ERC721: transfer from incorrect owner");
    });

    it("reverts when invalid token", async () => {
      await expect(contract.transfer(from, to, 99)).to.be.revertedWith(
        "ERC721: owner query for nonexistent token"
      );
    });

    it("reverts when transfer to zero address", async () => {
      await expect(
        contract.transfer(acc3.address, ethers.constants.AddressZero, tokenId)
      ).to.be.revertedWith("ERC721: transfer to the zero address");
    });
  });
});
