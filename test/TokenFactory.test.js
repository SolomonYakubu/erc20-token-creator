const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenFactory and CustomToken", function () {
  let TokenFactory, CustomToken, tokenFactory, owner, addr1, addr2;
  let tokenName,
    tokenSymbol,
    decimals,
    initialSupply,
    maxTxAmount,
    maxWalletSize,
    taxInfo;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    TokenFactory = await ethers.getContractFactory("TokenFactory");
    CustomToken = await ethers.getContractFactory("CustomToken");

    tokenFactory = await TokenFactory.deploy();
    await tokenFactory.waitForDeployment();

    tokenName = "Test Token";
    tokenSymbol = "TST";
    decimals = 18;
    initialSupply = ethers.parseUnits("1000000", decimals); // 1 million tokens
    maxTxAmount = ethers.parseUnits("10000", decimals); // 10,000 tokens
    maxWalletSize = ethers.parseUnits("50000", decimals); // 50,000 tokens
    taxInfo = {
      initialBuyTax: 500, // 5%
      finalBuyTax: 100, // 1%
      initialSellTax: 500, // 5%
      finalSellTax: 100, // 1%
      reduceBuyTaxAt: 1000, // blocks
      preventSwapBefore: 100, // blocks
      taxSwapThreshold: ethers.parseUnits("1000", decimals),
      maxTaxSwap: ethers.parseUnits("5000", decimals),
    };
  });

  describe("TokenFactory", function () {
    it("Should deploy TokenFactory", async function () {
      expect(await tokenFactory.getAddress()).to.be.properAddress;
    });

    it("Should create a new token", async function () {
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
      const event = receipt.logs.find(
        (log) => log.fragment.name === "TokenCreated"
      );
      expect(event).to.not.be.undefined;

      const newTokenAddress = event.args.tokenAddress;
      const newToken = CustomToken.attach(newTokenAddress);

      expect(await newToken.name()).to.equal(tokenName);
      expect(await newToken.symbol()).to.equal(tokenSymbol);
      expect(await newToken.decimals()).to.equal(decimals);
      expect(await newToken.totalSupply()).to.equal(initialSupply);
    });
  });

  describe("CustomToken", function () {
    let newToken;

    beforeEach(async function () {
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
      const event = receipt.logs.find(
        (log) => log.fragment.name === "TokenCreated"
      );
      const newTokenAddress = event.args.tokenAddress;
      newToken = CustomToken.attach(newTokenAddress);
    });

    it("Should have correct initial parameters", async function () {
      const tokenTaxInfo = await newToken.taxInfo();
      expect(tokenTaxInfo.initialBuyTax).to.equal(taxInfo.initialBuyTax);
      expect(tokenTaxInfo.finalBuyTax).to.equal(taxInfo.finalBuyTax);
      expect(tokenTaxInfo.initialSellTax).to.equal(taxInfo.initialSellTax);
      expect(tokenTaxInfo.finalSellTax).to.equal(taxInfo.finalSellTax);
      expect(tokenTaxInfo.reduceBuyTaxAt).to.equal(taxInfo.reduceBuyTaxAt);
      expect(tokenTaxInfo.preventSwapBefore).to.equal(
        taxInfo.preventSwapBefore
      );
      expect(tokenTaxInfo.taxSwapThreshold).to.equal(taxInfo.taxSwapThreshold);
      expect(tokenTaxInfo.maxTaxSwap).to.equal(taxInfo.maxTaxSwap);
    });

    it("Should enforce max transaction amount", async function () {
      await expect(
        newToken.transfer(addr1.address, maxTxAmount.add(1))
      ).to.be.revertedWith("Transfer amount exceeds the maxTxAmount.");

      await expect(newToken.transfer(addr1.address, maxTxAmount)).to.not.be
        .reverted;
    });

    it("Should enforce max wallet size", async function () {
      await newToken.transfer(addr1.address, maxWalletSize);
      await expect(newToken.transfer(addr1.address, 1)).to.be.revertedWith(
        "Transfer would exceed maxWalletSize for recipient."
      );

      await expect(newToken.transfer(addr2.address, 1)).to.not.be.reverted;
    });

    it("Should allow owner to update parameters", async function () {
      const newMaxTxAmount = ethers.parseUnits("20000", decimals);
      const newMaxWalletSize = ethers.parseUnits("100000", decimals);
      const newTaxInfo = {
        initialBuyTax: 600,
        finalBuyTax: 200,
        initialSellTax: 600,
        finalSellTax: 200,
        reduceBuyTaxAt: 2000,
        preventSwapBefore: 200,
        taxSwapThreshold: ethers.parseUnits("2000", decimals),
        maxTaxSwap: ethers.parseUnits("10000", decimals),
      };

      await newToken.setMaxTxAmount(newMaxTxAmount);
      await newToken.setMaxWalletSize(newMaxWalletSize);
      await newToken.setTaxInfo(newTaxInfo);

      const updatedTaxInfo = await newToken.taxInfo();
      expect(updatedTaxInfo.initialBuyTax).to.equal(newTaxInfo.initialBuyTax);
      expect(updatedTaxInfo.finalBuyTax).to.equal(newTaxInfo.finalBuyTax);
      expect(updatedTaxInfo.initialSellTax).to.equal(newTaxInfo.initialSellTax);
      expect(updatedTaxInfo.finalSellTax).to.equal(newTaxInfo.finalSellTax);
      expect(updatedTaxInfo.reduceBuyTaxAt).to.equal(newTaxInfo.reduceBuyTaxAt);
      expect(updatedTaxInfo.preventSwapBefore).to.equal(
        newTaxInfo.preventSwapBefore
      );
      expect(updatedTaxInfo.taxSwapThreshold).to.equal(
        newTaxInfo.taxSwapThreshold
      );
      expect(updatedTaxInfo.maxTaxSwap).to.equal(newTaxInfo.maxTaxSwap);

      // Test new max transaction amount
      await expect(
        newToken.transfer(addr1.address, newMaxTxAmount.add(1))
      ).to.be.revertedWith("Transfer amount exceeds the maxTxAmount.");

      await expect(newToken.transfer(addr1.address, newMaxTxAmount)).to.not.be
        .reverted;
    });

    it("Should only allow owner to update parameters", async function () {
      await expect(
        newToken
          .connect(addr1)
          .setMaxTxAmount(ethers.parseUnits("20000", decimals))
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        newToken
          .connect(addr1)
          .setMaxWalletSize(ethers.parseUnits("100000", decimals))
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        newToken.connect(addr1).setTaxInfo({
          initialBuyTax: 600,
          finalBuyTax: 200,
          initialSellTax: 600,
          finalSellTax: 200,
          reduceBuyTaxAt: 2000,
          preventSwapBefore: 200,
          taxSwapThreshold: ethers.parseUnits("2000", decimals),
          maxTaxSwap: ethers.parseUnits("10000", decimals),
        })
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow minting by owner", async function () {
      const mintAmount = ethers.parseUnits("1000", decimals);
      await newToken.mint(addr1.address, mintAmount);
      expect(await newToken.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should allow burning by token holders", async function () {
      const initialBalance = await newToken.balanceOf(owner.address);
      const burnAmount = ethers.parseUnits("1000", decimals);
      await newToken.burn(burnAmount);
      expect(await newToken.balanceOf(owner.address)).to.equal(
        initialBalance - burnAmount
      );
    });
  });
});
