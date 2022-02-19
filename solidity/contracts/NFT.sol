// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/PullPayment.sol";

contract NFT is ERC721, PullPayment, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private currentTokenId;

    string public baseTokenURI;

    // Constants
    uint256 private constant TOTAL_SUPPLY = 10_000;
    uint256 private constant MINT_PRICE = 0.02 ether;

    constructor() ERC721("NFT Collectible", "NFC") {
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