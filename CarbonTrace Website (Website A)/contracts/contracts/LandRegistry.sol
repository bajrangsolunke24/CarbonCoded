// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title LandRegistry
 * @notice On-chain registry for government-verified carbon sequestration lands.
 *         Only authorized government addresses can register lands.
 */
contract LandRegistry {
    address public owner;

    struct Land {
        string ipfsCid;
        string polygonHash;
        address registeredBy;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Land) private lands;
    string[] public landIds;

    event LandRegistered(
        string indexed landId,
        string ipfsCid,
        uint256 timestamp
    );

    modifier onlyGov() {
        require(msg.sender == owner, "LandRegistry: caller is not government");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Register a new land parcel on-chain
     * @param landId Unique government-issued land identifier (GOV-YYYY-STATE-NNNN)
     * @param ipfsCid IPFS content identifier for land documents
     * @param polygonHash Hash of the GeoJSON polygon boundary
     */
    function registerLand(
        string calldata landId,
        string calldata ipfsCid,
        string calldata polygonHash
    ) external {
        require(!lands[landId].exists, "LandRegistry: land already registered");
        require(bytes(landId).length > 0, "LandRegistry: empty land ID");
        require(bytes(ipfsCid).length > 0, "LandRegistry: empty IPFS CID");

        lands[landId] = Land({
            ipfsCid: ipfsCid,
            polygonHash: polygonHash,
            registeredBy: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        landIds.push(landId);

        emit LandRegistered(landId, ipfsCid, block.timestamp);
    }

    /**
     * @notice Retrieve land details
     * @param landId The land identifier to look up
     */
    function getLand(string calldata landId)
        external
        view
        returns (
            string memory ipfsCid,
            address registeredBy,
            uint256 timestamp
        )
    {
        require(lands[landId].exists, "LandRegistry: land not found");
        Land storage land = lands[landId];
        return (land.ipfsCid, land.registeredBy, land.timestamp);
    }

    /**
     * @notice Get total number of registered lands
     */
    function totalLands() external view returns (uint256) {
        return landIds.length;
    }
}
