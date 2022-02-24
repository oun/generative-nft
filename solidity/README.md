# NFT Smart Contract

## Requirements

- NodeJS 14
- Yarn

## Setup

Get the [Alchemy](https://alchemy.com/?r=23f4e0b210cffd7b) API key and [Etherscan](https://etherscan.io/) API key.
Export the private key of account used to deploy contract. [Metamask](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key)

Create .env file and add variables:
```
ALCHEMY_KEY=<alchemy-key>
ACCOUNT_PRIVATE_KEY=<account-private-key>
ETHERSCAN_API_KEY=<etherscan-api-key>
COIN_MARKET_CAP_KEY=<coinmarketcap-api-key>
```

Run `yarn install`

## Usage
### Deploy Contract

To deploy contract to the Rinkeby test network:

```bash
npx hardhat deploy --network rinkeby --payees <json-file>
```

Where payees is path to JSON file contains list of payee and share to split payment.
Example:
```
[
    {
        "payee": "0x...",
        "share": 60
    },
    {
        "payee": "0x...",
        "share": 40
    }
]
```

When deployment is done, take note the contract address.

Update .env file with the contract address: `NFT_CONTRACT_ADDRESS=<contract-address>`

### Verify Contract

To verify contract on Etherscan, run belows command with contract address.

```bash
npx hardhat verify <contract-address> --network rinkeby
```

### Mint Token

To mint token(s) to an address.

```bash
npx hardhat mint --address <account-address> --quantity <number-of-tokens> --network rinkeby
```

### Set Base Token URI

To set base URI of token metadata. The base-url must ends with slash.

```bash
npx hardhat set-base-token-uri --base-url <base-url>
```

### Get Token URI

Get and print token metadata by token id.

```bash
npx hardhat token-uri --token-id <id>
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

  check             	Check whatever you need
  check-balance     	Prints out the balance of your account
  clean             	Clears the cache and deletes all artifacts
  compile           	Compiles the entire project, building all artifacts
  console           	Opens a hardhat console
  deploy            	Deploys the NFT contract
  flatten           	Flattens and prints contracts and their dependencies
  help              	Prints this message
  mint              	Mints from the NFT contract
  node              	Starts a JSON-RPC server on top of Hardhat Network
  run               	Runs a user-defined script after compiling the project
  set-base-token-uri	Sets the base token URI for the deployed smart contract
  test              	Runs mocha tests
  token-uri         	Fetches the token metadata for the given token ID
  upgrade           	Upgrades the NFT contract
  verify            	Verifies contract on Etherscan

To get help for a specific task run: npx hardhat help [task]
```