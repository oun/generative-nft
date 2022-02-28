// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "./ERC721E.sol";

contract NFT is ERC721E, Ownable, PaymentSplitter {
    string private baseTokenURI;

    // Constants
    uint256 private constant TOTAL_SUPPLY = 8_888;
    uint256 private constant MINT_PRICE = 0.02 ether;
    uint256 private constant MAX_MINT_PER_ADDRESS = 5;

    constructor(string memory name, string memory symbol, address[] memory payees, uint256[] memory shares) ERC721E(name, symbol) PaymentSplitter(payees, shares) {
        baseTokenURI = "";
    }
    
    function mintTo(address recipient, uint8 quantity) public payable {
        require(totalSupply() + quantity <= TOTAL_SUPPLY, "Max supply reached");
        require(_mintAmountOf(msg.sender) + quantity <= MAX_MINT_PER_ADDRESS, "Exceed mint limit per address");
        require(msg.value == MINT_PRICE * quantity, "Transaction value did not equal the mint price");

        _safeMint(recipient, quantity);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseTokenURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }
}