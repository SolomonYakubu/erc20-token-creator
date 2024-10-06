require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const ETHERSCAN_API = process.env.ETHERSCAN_API;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API,
    },
  },
  sourcify: {
    enabled: true,
  },
};
