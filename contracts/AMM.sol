// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// importing necessary files, Token is local
import "hardhat/console.sol";
import "./Token.sol";

// setting up AMM contract.
contract AMM {
    // state variables.
    Token public token1;
    Token public token2;

    uint256 public token1Balance;
    uint256 public token2Balance;
    uint256 public K;

    uint256 public totalShares;
    mapping(address => uint256) public shares;
    uint256 constant PRECISION = 10**18;

    constructor(Token _token1, Token _token2){
        token1 = _token1;
        token2 = _token2;
    }

    function addLiquidity(uint256 _token1Amount, uint256 _token2Amount) external {
        // Deposit Tokens
        require(
            token1.transferFrom(msg.sender, address(this), _token1Amount), "Failed to transfer token1"
        );
        require(
            token2.transferFrom(msg.sender, address(this), _token2Amount), "Failed to transfer token2"
        );

        uint256 share;
        // Issue Shares
        if (totalShares == 0) {
            share = 100 * PRECISION;
        } else {
            uint256 share1 = (totalShares * _token1Amount) / token1Balance;
            uint256 share2 = (totalShares * _token2Amount) / token2Balance;
            require(
                (share1/10**3) == (share2/10**3), "Must provide equal token amounts"
            );
            share = share1;
        }

        // Manage Pool
        token1Balance += _token1Amount;
        token2Balance += _token2Amount;
        K = token1Balance * token2Balance;

        // Update Shares
        totalShares += share;
        shares[msg.sender] += share;

    }

    // Determine how many token2 tokens must be deposited when depositing liquidity token1
    function calculateToken2Deposit(uint256 _token1Amount) public view returns (uint256 token2Amount){
        token2Amount = (token2Balance * _token1Amount) / token1Balance;
    }

    // Determine how many token1 tokens must be deposited when depositing liquidity for token2
    function calculateToken1Deposit(uint256 _token2Amount) public view returns (uint256 token1Amount){
        token1Amount = (token1Balance * _token2Amount) / token2Balance;
    }
}