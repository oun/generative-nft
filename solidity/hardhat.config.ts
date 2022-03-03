/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import "dotenv/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import "./scripts/deploy";
import "./scripts/mint";
import "./scripts/misc";

const {
  ALCHEMY_KEY,
  ACCOUNT_PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  COIN_MARKET_CAP_KEY,
} = process.env;

export default {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {},
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    ethereum: {
      chainId: 1,
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: false,
    coinmarketcap: `${COIN_MARKET_CAP_KEY}`,
    currency: "USD",
  },
};
