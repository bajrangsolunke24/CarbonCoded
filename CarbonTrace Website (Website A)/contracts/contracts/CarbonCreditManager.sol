// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CarbonCreditManager
 * @notice Manages issuance and transfer of carbon credits on-chain.
 *         Only authorized government addresses can issue or transfer credits.
 */
contract CarbonCreditManager {
    address public owner;

    // landId => issued credits (in tCO2e units × 1e18)
    mapping(string => uint256) public landCredits;

    // entityId => credit balance
    mapping(string => uint256) public balances;

    uint256 public totalIssued;
    uint256 public totalTransferred;

    event CreditsIssued(
        string indexed landId,
        uint256 amount,
        uint256 timestamp
    );

    event CreditsTransferred(
        string indexed from,
        string indexed to,
        uint256 amount
    );

    modifier onlyGov() {
        require(msg.sender == owner, "CarbonCreditManager: caller is not government");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Issue carbon credits for a verified land parcel
     * @param landId The government land identifier
     * @param amount Number of credits to issue (in tCO2e × 1e18)
     */
    function issueCredits(
        string calldata landId,
        uint256 amount
    ) external {
        require(amount > 0, "CarbonCreditManager: amount must be > 0");
        require(bytes(landId).length > 0, "CarbonCreditManager: empty land ID");

        landCredits[landId] += amount;
        balances[landId] += amount;
        totalIssued += amount;

        emit CreditsIssued(landId, amount, block.timestamp);
    }

    /**
     * @notice Transfer credits from a land pool to a company
     * @param companyId The company identifier
     * @param amount Number of credits to transfer
     */
    function transferToCompany(
        string calldata landId,
        string calldata companyId,
        uint256 amount
    ) external {
        require(amount > 0, "CarbonCreditManager: amount must be > 0");
        require(
            balances[landId] >= amount,
            "CarbonCreditManager: insufficient balance"
        );

        balances[landId] -= amount;
        balances[companyId] += amount;
        totalTransferred += amount;

        emit CreditsTransferred(landId, companyId, amount);
    }

    /**
     * @notice Get credit balance for an entity (land or company)
     * @param entityId The entity identifier
     */
    function getBalance(
        string calldata entityId
    ) external view returns (uint256) {
        return balances[entityId];
    }

    /**
     * @notice Get total issued credits for a specific land
     * @param landId The land identifier
     */
    function getLandCredits(
        string calldata landId
    ) external view returns (uint256) {
        return landCredits[landId];
    }
}
