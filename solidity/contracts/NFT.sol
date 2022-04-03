// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./ERC721E.sol";

contract NFT is ERC721E, Ownable, Pausable, PaymentSplitter {
    string private _baseTokenURI;
    address private _signerAddress;
    uint256 private _saleStartTime;

    // Constants
    uint256 private constant MAX_SUPPLY = 8_888;
    uint256 private constant MINT_PRICE = 0.02 ether;
    uint256 private constant REDEEM_PRICE = 0.01 ether;
    uint256 private constant MAX_MINT_PER_ADDRESS = 5;

    constructor(
        string memory name, 
        string memory symbol, 
        uint256 publicSaleStartTime, 
        address[] memory payees, 
        uint256[] memory shares
    ) ERC721E(name, symbol) PaymentSplitter(payees, shares) {
        _baseTokenURI = "";
        _saleStartTime = publicSaleStartTime;
    }
    
    function mintTo(address recipient, uint8 quantity) external payable {
        require(block.timestamp >= _saleStartTime, "Sale has not started");
        require(msg.value == MINT_PRICE * quantity, "Transaction value did not equal the mint price");

        _mintTo(recipient, quantity);
    }

    function redeemTo(address recipient, uint8 quantity, bytes calldata signature) external payable {
        require(_verify(_hash(msg.sender), signature), "Signature invalid");
        require(msg.value == REDEEM_PRICE * quantity, "Transaction value did not equal the mint price");

        _mintTo(recipient, quantity);
    }

    function _mintTo(address recipient, uint8 quantity) internal virtual {
        require(totalSupply() + quantity <= MAX_SUPPLY, "Max supply reached");
        require(_mintAmountOf(msg.sender) + quantity <= MAX_MINT_PER_ADDRESS, "Exceed mint limit per address");

        _safeMint(recipient, quantity);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 startTokenId,
        uint256 quantity
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, startTokenId, quantity);

        require(!paused(), "Token transfer while paused");
    }

    function _hash(address account) internal pure returns (bytes32) {
        return ECDSA.toEthSignedMessageHash(keccak256(abi.encodePacked(account)));
    }

    function _verify(bytes32 digest, bytes memory signature) internal view returns (bool) {
        return _signerAddress == ECDSA.recover(digest, signature);
    }

    function release(address payable account) public virtual override onlyOwner {
        super.release(account);
    }

    function release(IERC20 token, address account) public virtual override onlyOwner {
        super.release(token, account);
    }

    function setSignerAddress(address account) external onlyOwner {
        _signerAddress = account;
    }

    function setBaseTokenURI(string memory baseTokenURI) external onlyOwner {
        _baseTokenURI = baseTokenURI;
    }

    function setSaleStartTime(uint256 startTime) external onlyOwner {
        _saleStartTime = startTime;
    }

    function pause() external virtual onlyOwner {
        super._pause();
    }

    function unpause() external virtual onlyOwner {
        super._unpause();
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function signerAddress() public view returns (address) {
        return _signerAddress;
    }

    function saleStartTime() public view returns (uint256) {
        return _saleStartTime;
    }
}