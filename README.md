# Token Factory

This project implements a flexible Token Factory and Custom Token system using Solidity smart contracts. It allows for easy creation and deployment of customizable ERC20 tokens with advanced features such as transaction limits, wallet size restrictions, and dynamic tax mechanisms.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Testing](#testing)
- [Usage](#usage)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

## Overview

The Token Factory is a Solidity smart contract that enables the creation of customizable ERC20 tokens. Each token created through this factory can have its own name, symbol, initial supply, and various other parameters including transaction limits and tax structures.

## Features

- Create custom ERC20 tokens with configurable parameters
- Set maximum transaction amounts and wallet sizes
- Implement dynamic buy and sell taxes
- Mint and burn functionality
- Ownership controls for critical functions
- Comprehensive test suite
- Deployment scripts for easy contract deployment

## Project Structure

```
token-factory/
│
├── contracts/
│   ├── TokenFactory.sol
│   └── CustomToken.sol
│
├── scripts/
│   └── deploy.js
│
├── test/
│   └── TokenFactory.test.js
│
├── .env
├── hardhat.config.js
├── package.json
└── README.md
```

## Prerequisites

- Node.js (v12.0.0 or later)
- npm (usually comes with Node.js)
- An Infura account for deployment to Ethereum networks
- An Etherscan API key for contract verification

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/token-factory.git
   cd token-factory
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Configuration

1. Create a `.env` file in the root directory with the following contents:

   ```
   INFURA_PROJECT_ID=your_infura_project_id
   PRIVATE_KEY=your_ethereum_private_key
   ETHERSCAN_API=your_etherscan_api_key
   ```

2. Replace the placeholders with your actual Infura Project ID, Ethereum private key, and Etherscan API key.

## Deployment

To deploy the contracts to the Sepolia testnet:

```
npx hardhat run scripts/deploy.js --network sepolia
```

This script will:

1. Deploy the TokenFactory contract
2. Create a sample token using the factory
3. Verify the contracts on Etherscan (if on a supported network)

## Testing

Run the test suite with:

```
npx hardhat test
```

## Usage

After deployment, you can interact with the TokenFactory contract to create new tokens. Here's a basic example using ethers.js:

```javascript
const TokenFactory = await ethers.getContractFactory("TokenFactory");
const tokenFactory = TokenFactory.attach("DEPLOYED_FACTORY_ADDRESS");

const tx = await tokenFactory.createToken(
  "My Token",
  "MTK",
  18,
  ethers.utils.parseUnits("1000000", 18),
  ethers.utils.parseUnits("10000", 18),
  ethers.utils.parseUnits("50000", 18),
  {
    initialBuyTax: 500,
    finalBuyTax: 100,
    initialSellTax: 500,
    finalSellTax: 100,
    reduceBuyTaxAt: 1000,
    preventSwapBefore: 100,
    taxSwapThreshold: ethers.utils.parseUnits("1000", 18),
    maxTaxSwap: ethers.utils.parseUnits("5000", 18),
  }
);

const receipt = await tx.wait();
const event = receipt.events.find((e) => e.event === "TokenCreated");
const newTokenAddress = event.args.tokenAddress;

console.log("New token created at:", newTokenAddress);
```

## Security Considerations

- The contracts use OpenZeppelin's libraries for standard implementations and security best practices.
- Ensure that only trusted addresses have owner privileges on deployed tokens.
- The tax mechanism and transaction limits should be carefully configured to prevent potential exploits.
- Consider having the contracts audited by a professional security firm before using them in a production environment.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
