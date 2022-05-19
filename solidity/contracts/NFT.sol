// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/finance/PaymentSplitter.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./ERC721E.sol";

contract NFT is ERC721E, Ownable, Pausable, PaymentSplitter {
    // Base token URI
    string private _baseTokenURI;

    // Signer public key
    address private _signerAddress;

    struct SaleConfiguration {
        // Sales start time in seconds since Epoch for public mint
        uint64 publicSaleStartTime;

        // Sales start time in seconds since Epoch for whitelist mint
        uint64 whitelistSaleStartTime;

        // Mint price for public sale
        uint64 publicMintPrice;

        // Mint price for presale
        uint64 presaleMintPrice;
    }

    SaleConfiguration private _saleConfiguration;

    // Mapping for addresses to number of presales minted tokens
    mapping(address => uint8) private _presaleTokens;

    // Mapping for addresses to number of free minted tokens
    mapping(address => uint8) private _redeemTokens;

    // Constants
    uint256 private constant MAX_SUPPLY = 5_555;
    // uint256 private constant PUBLIC_MINT_PRICE = 0.03 ether;
    // uint256 private constant WHITELIST_MINT_PRICE = 0.01 ether;
    uint256 private constant MAX_MINT_PER_ADDRESS = 10;

    enum SaleType {
        Public,
        Presale,
        Free
    }

    constructor(
        address signer,
        SaleConfiguration memory saleConfig,
        address[] memory payees, 
        uint256[] memory shares
    ) ERC721E("NFT", "My NFT") PaymentSplitter(payees, shares) {
        _baseTokenURI = "";
        _signerAddress = signer;
        _saleConfiguration = saleConfig;
    }
    
    function mintPublic(address recipient, uint8 quantity) external payable {
        require(_isPublicSaleStarted(), "Public sales has not started");
        require(msg.value == uint256(_saleConfiguration.publicMintPrice) * quantity, "Transaction value did not equal the mint price");

        _mintTo(recipient, quantity);
    }

    function mintPresale(address recipient, uint8 quantity, uint8 reservedQuantity, bytes calldata signature) external payable {
        require(_isWhitelistSaleStarted(), "Whitelist sales has not started");
        require(_isValidSignature(reservedQuantity, SaleType.Presale, signature), "Signature invalid");
        require(_presaleTokens[msg.sender] + quantity <= reservedQuantity, "Exceed eligible presale mint");
        require(msg.value == uint256(_saleConfiguration.presaleMintPrice) * quantity, "Transaction value did not equal the mint price");

        _mintTo(recipient, quantity);

        _presaleTokens[msg.sender] += quantity;
    }

    function redeem(address recipient, uint8 quantity, uint8 reservedQuantity, bytes calldata signature) external payable {
        require(_isWhitelistSaleStarted(), "Whitelist sales has not started");
        require(_isValidSignature(reservedQuantity, SaleType.Free, signature), "Signature invalid");
        require(_redeemTokens[msg.sender] + quantity <= reservedQuantity, "Exceed eligible free mint");

        _mintTo(recipient, quantity);

        _redeemTokens[msg.sender] += quantity;
    }

    function airdrop(address[] memory recipients, uint8[] memory quantity) external onlyOwner {
        require(recipients.length == quantity.length, "Number of recipients did not equal to quantity length");

        for (uint i = 0; i < recipients.length; i++) {
            _mintTo(recipients[i], quantity[i]);
        }
    }

    function _mintTo(address recipient, uint8 quantity) internal virtual {
        require(totalSupply() + quantity <= MAX_SUPPLY, "Max supply reached");
        require(_mintAmountOf(msg.sender) + quantity <= MAX_MINT_PER_ADDRESS, "Exceed mint limit per address");

        _safeMint(recipient, quantity);
    }

    function _isPublicSaleStarted() internal view returns (bool) {
        return _saleConfiguration.publicSaleStartTime != 0 && block.timestamp >= uint256(_saleConfiguration.publicSaleStartTime);
    }

    function _isWhitelistSaleStarted() internal view returns (bool) {
        return _saleConfiguration.whitelistSaleStartTime != 0 && block.timestamp >= uint256(_saleConfiguration.whitelistSaleStartTime);
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

    function _hash(address account, SaleType saleType, uint8 quantity) internal pure returns (bytes32) {
        return ECDSA.toEthSignedMessageHash(keccak256(abi.encodePacked(account, saleType, quantity)));
    }

    function _isValidSignature(uint8 quantity, SaleType saleType, bytes memory signature) internal view returns (bool) {
        bytes32 digest = _hash(msg.sender, saleType, quantity);
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

    function setSaleConfiguration(SaleConfiguration memory saleConfig) external onlyOwner {
        _saleConfiguration = saleConfig;
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

    function saleConfiguration() public view returns (SaleConfiguration memory) {
        return _saleConfiguration;
    }
}