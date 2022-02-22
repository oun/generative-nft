// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/CountersUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PullPaymentUpgradeable.sol";

contract NFT is Initializable, ERC721Upgradeable, PullPaymentUpgradeable, OwnableUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    CountersUpgradeable.Counter private currentTokenId;

    string private baseTokenURI;

    // Constants
    uint256 private constant TOTAL_SUPPLY = 10_000;
    uint256 private constant MINT_PRICE = 0.03 ether;

    function initialize(string memory name, string memory symbol) public initializer {
        __ERC721_init(name, symbol);
        baseTokenURI = "";
    }
    
    function mintTo(address recipient, uint8 quantity)
        public payable 
    {
        uint256 tokenId = currentTokenId.current();
        require(tokenId + quantity <= TOTAL_SUPPLY, "Max supply reached");
        require(msg.value == MINT_PRICE * quantity, "Transaction value did not equal the mint price");

        for (uint8 i = 0; i < quantity; i++) {
            currentTokenId.increment();
            uint256 newItemId = currentTokenId.current();
            _safeMint(recipient, newItemId);
        }
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    function setBaseTokenURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    function withdrawPayments(address payable payee) public override onlyOwner virtual {
        super.withdrawPayments(payee);
    }
}