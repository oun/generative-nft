# NFT Smart Contract

## Requirements

- NodeJS 14
- Yarn

## Setup

Get the Alchemy API key and private key [Alchemy](https://alchemy.com/?r=23f4e0b210cffd7b) and [Etherscan](https://etherscan.io/) API key.

Create .env file and add variables:

```
ALCHEMY_KEY=<alchemy-key>
ACCOUNT_PRIVATE_KEY=<alchemy-private-key>
ETHERSCAN_API_KEY=<etherscan-api-key>
```

Run `yarn install`

## Usage
### Deploy Contract

To deploy contract to the Rinkeby test network:

```bash
npx hardhat deploy --network rinkeby
```

This will deploy proxy admin, proxy and implementation contracts (more details on Openzeppelin upgradeable plugins).
When deployment is done, take note the proxy and implementation address.

Update .env file with the proxy address: `NFT_CONTRACT_ADDRESS=<proxy-address>`

### Upgrade Contract

To upgrade implementation contract:

```bash
npx hardhat upgrade --network rinkeby
```

### Verify Contract

To verify contract on Etherscan, run belows command with implementation address.
Note that the proxy contract is already verified.

```bash
npx hardhat verify <implementation-address> --network rinkeby
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