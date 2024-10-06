// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./CustomToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract TokenFactory is Ownable {
    event TokenCreated(address indexed tokenAddress, string name, string symbol);

    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply,
        uint256 maxTxAmount,
        uint256 maxWalletSize,
        CustomToken.TaxInfo memory taxInfo
    ) public returns (address) {
        CustomToken newToken = new CustomToken(
            name,
            symbol,
            decimals,
            initialSupply,
            msg.sender,
            maxTxAmount,
            maxWalletSize,
            taxInfo
        );
        console.log("New token created at address:", address(newToken));
        emit TokenCreated(address(newToken), name, symbol);
        console.log("TokenCreated event emitted");
        return address(newToken);
    }
}