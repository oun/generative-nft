// SPDX-License-Identifier: MIT
// This mock just provide public functions for testing purposes

pragma solidity ^0.8.4;

import "../ERC721E.sol";

contract ERC721EMock is ERC721E {
    constructor(string memory name, string memory symbol) ERC721E(name, symbol) {}

    function mintAmountOf(address owner) public view returns (uint256) {
        return _mintAmountOf(owner);
    }

    function baseURI() public view returns (string memory) {
        return _baseURI();
    }

    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    function mint(address to, uint256 quantity) public {
        _mint(to, quantity);
    }

    function safeMint(address to, uint256 quantity) public {
        _safeMint(to, quantity);
    }

    function burn(uint256 tokenId) public {
        _burn(tokenId);
    }

    function transfer(address from, address to, uint256 tokenId) public {
        _transfer(from, to, tokenId);
    }
}