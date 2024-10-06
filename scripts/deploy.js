const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const TokenFactory = await hre.ethers.getContractFactory("TokenFactory");
  const tokenFactory = await TokenFactory.deploy();

  await tokenFactory.deploymentTransaction().wait();

  console.log("TokenFactory deployed to:", tokenFactory.target);

  // Deploy a sample token using the factory
  const tokenName = "Sample Token";
  const tokenSymbol = "SMPL";
  const decimals = 18;
  const initialSupply = hre.ethers.parseUnits("1000000", decimals); // 1 million tokens
  const maxTxAmount = hre.ethers.parseUnits("10000", decimals); // 10,000 tokens
  const maxWalletSize = hre.ethers.parseUnits("50000", decimals); // 50,000 tokens

  const taxInfo = {
    initialBuyTax: 500, // 5%
    finalBuyTax: 100, // 1%
    initialSellTax: 500, // 5%
    finalSellTax: 100, // 1%
    reduceBuyTaxAt: 1000, // blocks
    preventSwapBefore: 100, // blocks
    taxSwapThreshold: hre.ethers.parseUnits("1000", decimals),
    maxTaxSwap: hre.ethers.parseUnits("5000", decimals),
  };

  console.log("Creating a sample token...");

  const tx = await tokenFactory.createToken(
    tokenName,
    tokenSymbol,
    decimals,
    initialSupply,
    maxTxAmount,
    maxWalletSize,
    taxInfo
  );

  const receipt = await tx.wait();

  const event = receipt.logs.find((log) => log.eventName === "TokenCreated");
  const newTokenAddress = event.args.tokenAddress;

  console.log("Sample token created at:", newTokenAddress);

  // Verify contracts on Etherscan (if deploying to a supported network)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Verifying contracts on Etherscan...");

    await hre.run("verify:verify", {
      address: tokenFactory.target,
      constructorArguments: [],
    });

    console.log("TokenFactory verified on Etherscan");

    // Note: CustomToken verification might fail due to complex constructor arguments
    // You may need to verify it manually on Etherscan
    try {
      await hre.run("verify:verify", {
        address: newTokenAddress,
        constructorArguments: [
          tokenName,
          tokenSymbol,
          decimals,
          initialSupply,
          deployer.address,
          maxTxAmount,
          maxWalletSize,
          taxInfo,
        ],
      });
      console.log("Sample token verified on Etherscan");
    } catch (error) {
      console.error("Error verifying sample token:", error);
      console.log(
        "You may need to verify the sample token manually on Etherscan"
      );
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
