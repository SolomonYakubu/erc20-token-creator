// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CustomToken is ERC20, Ownable {
    uint8 private _decimals;
    uint256 private _maxTxAmount;
    uint256 private _maxWalletSize;

    struct TaxInfo {
        uint256 initialBuyTax;
        uint256 finalBuyTax;
        uint256 initialSellTax;
        uint256 finalSellTax;
        uint256 reduceBuyTaxAt;
        uint256 preventSwapBefore;
        uint256 taxSwapThreshold;
        uint256 maxTaxSwap;
    }

    TaxInfo public taxInfo;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        uint256 initialSupply,
        address tokenOwner,
        uint256 maxTxAmount_,
        uint256 maxWalletSize_,
        TaxInfo memory _taxInfo
    ) ERC20(name, symbol) {
        _decimals = decimals_;
        _mint(tokenOwner, initialSupply * 10**decimals_);
        transferOwnership(tokenOwner);

        _maxTxAmount = maxTxAmount_;
        _maxWalletSize = maxWalletSize_;
        taxInfo = _taxInfo;
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal virtual override {
        require(amount <= _maxTxAmount, "Transfer amount exceeds the maxTxAmount.");
        require(
            balanceOf(recipient) + amount <= _maxWalletSize,
            "Transfer would exceed maxWalletSize for recipient."
        );

        super._transfer(sender, recipient, amount);
    }

    function setMaxTxAmount(uint256 amount) public onlyOwner {
        _maxTxAmount = amount;
    }

    function setMaxWalletSize(uint256 amount) public onlyOwner {
        _maxWalletSize = amount;
    }

    function setTaxInfo(TaxInfo memory _taxInfo) public onlyOwner {
        taxInfo = _taxInfo;
    }
}