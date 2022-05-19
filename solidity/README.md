# NFT Smart Contract

## Features

- [x] Support presales, public and free mint
- [x] Allow to update mint price and sales date
- [x] Reduces gas fee for minting multiple tokens in a single transaction
- [x] Support Openzeppelin payment splitter to withdraw fund
- [x] Whitelist mint using ECDSA
- [x] Support pausing mint and transfer
- [x] Airdrop tokens to multiple addresses
- [ ] Opensea whitelisting

## Requirements

- NodeJS 14
- Yarn

## Setup

Sign up for the [Alchemy](https://alchemy.com/?r=23f4e0b210cffd7b) API key 
and the [Etherscan](https://etherscan.io/) API key.
Get the account private key that will be used to deploy the contract.

Create .env file by copying from `.env.sample` and set all values appropriately.
You can ignore NFT_CONTRACT_ADDRESS until deploy the contract.

```
ALCHEMY_KEY=<alchemy-api-key>
ACCOUNT_PRIVATE_KEY=<account-private-key>
ETHERSCAN_API_KEY=<etherscan-api-key>
COIN_MARKET_CAP_KEY=<coinmarketcap-api-key>
```

Run `yarn install`

## Usage

### Set up smart contract
- Deploy contract
- Verify contract on Etherscan

### Pre-mint
- Update base token URI to pre-reveal image
- Create whitelist signature
- Update sale configuration if neccessary

### Mint
- Free mint
- Airdrop
- Presale mint
- Public mint

### Post-mint
- Update base token URI to reveal image

## References

### Deploy Contract

```bash
npx hardhat deploy \
--signer-address <signer-public-key> \
--public-sale-start-time <timestamp> \
--whitelist-sale-start-time <timestamp> \
--public-mint-price <price> \
--presale-mint-price <price> \
--payments <file-path> \
--network <network>
```

Parameters:

- `signer-address` is the account address that is used to generate sinature for whitelisting.
- `public-sale-start-time` is when to allow public sale minting (seconds).
- `whitelist-sale-start-time` is when to allow presale and free minting (seconds).
- `public-mint-price` is mint price for public sales.
- `presale-mint-price` is mint price for presales.
- `payments` is path to CSV file contains list of payee and percent share for split payment.
- `network` to deployed the contract e.g. localhost, rinkeby, ethereum.

To deploy the contract on localhost network, run `npx hardhat node` to start node in local machine.
The payments file contains array of json contains payee address and share percentage:

Example: The first account will get 60 percent share and The second account will get 40 percent.
```
"0xe7908....3755",60
"0x61b47...1F9a",40
```

When deployment is done, take note the contract address.

Update .env file with the contract address: `NFT_CONTRACT_ADDRESS=<contract-address>`

### Verify Contract

To verify contract on Etherscan, run belows command with contract address and parameters same as when you deployed the contract.

```bash
npx hardhat verify \
--signer-address <signer-public-key> \
--public-sale-start-time <timestamp> \
--whitelist-sale-start-time <timestamp> \
--public-mint-price <price> \
--presale-mint-price <price> \
--payees <file-path> \
--network <network> \
<contract-address>
```

Parameters:
- `contract-address` is the deployed contract address.

### Mint Token in Public Sales

To mint token(s) in public sales.

```bash
npx hardhat mint-public \
--address <account> \
--quantity <quantity> \
--price <price> \
--network <network>
```

Parameters:

- `address` is account address to receive token
- `quantity` is number of token to mint
- `price` is mint price per token
- `network` to deployed the contract e.g. localhost, rinkeby, ethereum

### Mint Token in PreSales

To mint token(s) in presales.

```bash
npx hardhat mint-presale \
--address <account> \
--quantity <quantity> \
--reserved-quantity <quantity> \
--signature <signature> \
--price <price> \
--network <network>
```

Parameters:

- `address` is account address to receive token
- `quantity` is number of token to mint
- `reserved` quantity is number of eligible token that can be minted by this account
- `signature` is message signed by the signer address for checking whitelist
- `price` is mint price per token
- `network` to deployed the contract e.g. localhost, rinkeby, ethereum

### Redeem Token

To redeem token(s) for free mint.

```bash
npx hardhat redeem \
--address <account> \
--quantity <quantity> \
--reserved-quantity <quantity> \
--signature <signature> \
--network <network>
```

Parameters:

- `address` is account address to receive token
- `quantity` is number of token to mint
- `reserved` quantity is number of eligible token that can be minted by this account
- `signature` is message signed by the signer address for checking whitelist
- `network` to deployed the contract e.g. localhost, rinkeby, ethereum

### Airdrop

Airdrop NFTs to multiple recipients.

```bash
npx hardhat airdrop \
--file <file-path>
```

Parameters:

- `file-path` The CSV file contains recipient addresses and quantity

Example file contains recipient address and number of token to mint:
```
0xf39f...2266,1
0x7099...79c8,2
```

### Set Base Token URI

To set base URI of token metadata.

```bash
npx hardhat set-base-token-uri <base-url> --network <network>
```

Parameters:

- `base-url` is base token uri. The value must ends with slash.
- `network` to deployed the contract e.g. localhost, rinkeby, ethereum

### Get Token URI

Get and print token metadata by token id.

```bash
npx hardhat token-uri <id> --network <network>
```

Parameters:

- `id` is the token id to get metadata
- `network` to deployed the contract e.g. localhost, rinkeby, ethereum

### Set Signer Address

To set signer address for signature verfication.

```bash
npx hardhat set-signer-address <address> --network <network>
```

Parameters:

- `address` is signer account used to generate signature
- `network` to deployed the contract e.g. localhost, rinkeby, ethereum

### Set Sale Configuration

To set sale configuration.

```bash
npx hardhat set-sale-configuration \
--public-sale-start-time <timestamp> \
--whitelist-sale-start-time <timestamp> \
--public-mint-price <price> \
--presale-mint-price <price> \
--network <network>
```

Parameters:

- `public-sale-start-time` is when to allow public sale minting (seconds).
- `whitelist-sale-start-time` is when to allow presale and free minting (seconds).
- `public-mint-price` is mint price for public sales.
- `presale-mint-price` is mint price for presales.
- `network to deployed` the contract e.g. localhost, rinkeby, ethereum

### Sign

Create signature for whitelisting.

```bash
npx hardhat sign \
--input <file>
--output <file>
--private-key <key>
--sale-type <type>
```

Parameters:

- `input` the input csv file path contains recipient addresses and quantity
- `output` output CSV file that contain account, saleType, quantity and signature
- `private-key` the key used for signing message
- `sale-type` 1 for presale, 2 for free mint

Example input csv containing account and number of token allow to mint:
```
"0xe790...555","10"
"0xe790...123","5"
```

## Test

To run test with hardhat test network:

```bash
npx hardhat test
```

## Command Reference

Run `npx hardhat` to show available commands:

```
Hardhat version 2.8.3

Usage: hardhat [GLOBAL OPTIONS] <TASK> [TASK OPTIONS]

GLOBAL OPTIONS:

  --config           	A Hardhat config file.
  --emoji            	Use emoji in messages.
  --help             	Shows this message, or a task's help if its name is provided
  --max-memory       	The maximum amount of memory that Hardhat can use.
  --network          	The network to connect to.
  --show-stack-traces	Show stack traces.
  --tsconfig         	A TypeScript config file.
  --verbose          	Enables Hardhat verbose logging
  --version          	Shows hardhat's version.


AVAILABLE TASKS:

  airdrop               	Airdrop NFTs to multiple recipients
  check                 	Check whatever you need
  check-balance         	Prints out the token balance of address
  check-owner           	Prints out the owner address of token id
  clean                 	Clears the cache and deletes all artifacts
  compile               	Compiles the entire project, building all artifacts
  console               	Opens a hardhat console
  deploy                	Deploys the NFT contract
  flatten               	Flattens and prints contracts and their dependencies
  gas-reporter:merge
  help                  	Prints this message
  mint-presale          	Mint presale from the NFT contract
  mint-public           	Mint public sales from the NFT contract
  node                  	Starts a JSON-RPC server on top of Hardhat Network
  redeem                	Redeem free mint from the NFT contract
  run                   	Runs a user-defined script after compiling the project
  sale-configuration    	Get sale configuration
  set-base-token-uri    	Sets the base token URI for the deployed smart contract
  set-sale-configuration	Sets the sale configuration
  set-signer-address    	Sets the signer address for verifying signature
  sign                  	Create signatures for whitelist
  signer-address        	Get the signer address
  test                  	Runs mocha tests
  token-uri             	Fetches the token metadata for the given token ID
  verify                	Verify the NFT contract

To get help for a specific task run: npx hardhat help [task]
```
