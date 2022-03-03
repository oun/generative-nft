// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./ERC721E.sol";

contract NFT is ERC721E, Ownable, PaymentSplitter {
    string private _baseTokenURI;
    address private _signerAddress;

    // Constants
    uint256 private constant TOTAL_SUPPLY = 8_888;
    uint256 private constant MINT_PRICE = 0.02 ether;
    uint256 private constant REDEEM_PRICE = 0.01 ether;
    uint256 private constant MAX_MINT_PER_ADDRESS = 5;

    constructor(string memory name, string memory symbol, address[] memory payees, uint256[] memory shares) ERC721E(name, symbol) PaymentSplitter(payees, shares) {
        _baseTokenURI = "";
    }
    
    function mintTo(address recipient, uint8 quantity) public payable {
        require(msg.value == MINT_PRICE * quantity, "Transaction value did not equal the mint price");

        _mintTo(recipient, quantity);
    }

    function redeemTo(address recipient, uint8 quantity, bytes calldata signature) public payable {
        require(_verify(_hash(msg.sender), signature), "Signature invalid");
        require(msg.value == REDEEM_PRICE * quantity, "Transaction value did not equal the mint price");

        _mintTo(recipient, quantity);
    }

    function _mintTo(address recipient, uint8 quantity) internal virtual {
        require(totalSupply() + quantity <= TOTAL_SUPPLY, "Max supply reached");
        require(_mintAmountOf(msg.sender) + quantity <= MAX_MINT_PER_ADDRESS, "Exceed mint limit per address");

        _safeMint(recipient, quantity);
    }

    function _hash(address account) internal pure returns (bytes32) {
        return ECDSA.toEthSignedMessageHash(keccak256(abi.encodePacked(account)));
    }

    function _verify(bytes32 digest, bytes memory signature) internal view returns (bool) {
        return _signerAddress == ECDSA.recover(digest, signature);
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseTokenURI(string memory baseTokenURI) public onlyOwner {
        _baseTokenURI = baseTokenURI;
    }

    function setSignerAddress(address account) public onlyOwner {
        _signerAddress = account;
    }

    function signerAddress() public view returns (address) {
        return _signerAddress;
    }
}