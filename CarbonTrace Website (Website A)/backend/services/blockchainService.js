'use strict';
const { ethers } = require('ethers');
const path = require('path');

const ARTIFACTS = path.join(__dirname, '../../contracts/artifacts/contracts');

let LandRegistryABI = null;
let CarbonCreditManagerABI = null;

try {
  LandRegistryABI = require(
    path.join(ARTIFACTS, 'LandRegistry.sol/LandRegistry.json')
  ).abi;
  CarbonCreditManagerABI = require(
    path.join(ARTIFACTS, 'CarbonCreditManager.sol/CarbonCreditManager.json')
  ).abi;
  console.log('[BLOCKCHAIN] ABIs loaded ✓');
} catch (err) {
  console.error('[BLOCKCHAIN] Failed to load ABIs:', err.message);
  console.error('[BLOCKCHAIN] Run: cd contracts && npx hardhat compile');
}

let _provider = null;
let _wallet = null;
let _landRegistry = null;
let _creditManager = null;
let _initialized = false;

function init() {
  if (_initialized) return true;
  try {
    if (!LandRegistryABI || !CarbonCreditManagerABI) throw new Error('ABIs not loaded');
    if (!process.env.SEPOLIA_RPC_URL) throw new Error('SEPOLIA_RPC_URL missing');
    if (!process.env.DEPLOYER_PRIVATE_KEY) throw new Error('DEPLOYER_PRIVATE_KEY missing');
    if (!process.env.LAND_REGISTRY_ADDRESS) throw new Error('LAND_REGISTRY_ADDRESS missing');
    if (!process.env.CARBON_CREDIT_MANAGER_ADDRESS) throw new Error('CARBON_CREDIT_MANAGER_ADDRESS missing');

    _provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    _wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, _provider);
    _landRegistry = new ethers.Contract(
      process.env.LAND_REGISTRY_ADDRESS, LandRegistryABI, _wallet
    );
    _creditManager = new ethers.Contract(
      process.env.CARBON_CREDIT_MANAGER_ADDRESS, CarbonCreditManagerABI, _wallet
    );

    _initialized = true;
    console.log('[BLOCKCHAIN] Initialized — wallet:', _wallet.address);
    return true;
  } catch (err) {
    console.error('[BLOCKCHAIN] Init failed:', err.message);
    return false;
  }
}

function getReadProvider() {
  return new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
}

async function registerLandOnChain(landIdGov, ipfsCid, polygon) {
  if (!init()) return { success: false, error: 'Blockchain not initialized' };
  try {
    const cid = ipfsCid || 'QmPending';
    const polygonStr = typeof polygon === 'object'
      ? JSON.stringify(polygon) : String(polygon);
    const polygonHash = polygonStr.substring(0, 64);

    console.log(`[BLOCKCHAIN] registerLand → ${landIdGov}`);
    const tx = await _landRegistry.registerLand(landIdGov, cid, polygonHash);
    console.log(`[BLOCKCHAIN] tx sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`[BLOCKCHAIN] confirmed block ${receipt.blockNumber}`);

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
    };
  } catch (err) {
    if (err.message?.includes('already registered')) {
      return { success: false, error: 'already_registered' };
    }
    console.error('[BLOCKCHAIN] registerLand error:', err.message);
    return { success: false, error: err.message };
  }
}

async function issueCreditsOnChain(landIdGov, amount) {
  if (!init()) return { success: false, error: 'Blockchain not initialized' };
  try {
    const amountWei = ethers.parseUnits(String(Math.max(1, Math.floor(amount))), 18);

    console.log(`[BLOCKCHAIN] issueCredits → ${landIdGov}: ${amount} CC`);
    const tx = await _creditManager.issueCredits(landIdGov, amountWei);
    console.log(`[BLOCKCHAIN] tx sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`[BLOCKCHAIN] confirmed block ${receipt.blockNumber}`);

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
    };
  } catch (err) {
    console.error('[BLOCKCHAIN] issueCredits error:', err.message);
    return { success: false, error: err.message };
  }
}

async function transferCreditsOnChain(landIdGov, companyId, amount) {
  if (!init()) return { success: false, error: 'Blockchain not initialized' };
  try {
    const amountWei = ethers.parseUnits(String(Math.max(1, Math.floor(amount))), 18);

    console.log(`[BLOCKCHAIN] transferToCompany → ${landIdGov} → ${companyId}: ${amount} CC`);
    const tx = await _creditManager.transferToCompany(
      landIdGov, String(companyId), amountWei
    );
    console.log(`[BLOCKCHAIN] tx sent: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`[BLOCKCHAIN] confirmed block ${receipt.blockNumber}`);

    return {
      success: true,
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
    };
  } catch (err) {
    console.error('[BLOCKCHAIN] transferToCompany error:', err.message);
    return { success: false, error: err.message };
  }
}

async function verifyLandOnChain(landIdGov) {
  if (!init()) return { success: false, exists: false };
  try {
    const result = await _landRegistry.getLand(landIdGov);
    return {
      success: true,
      exists: true,
      ipfsCid: result[0],
      registeredBy: result[1],
      timestamp: Number(result[2]),
      timestampISO: new Date(Number(result[2]) * 1000).toISOString(),
    };
  } catch {
    return { success: false, exists: false };
  }
}

async function getOnChainBalance(entityId) {
  if (!init()) return { success: false, balance: '0' };
  try {
    const raw = await _creditManager.getBalance(entityId);
    return {
      success: true,
      balance: ethers.formatUnits(raw, 18),
      raw: raw.toString(),
    };
  } catch (err) {
    return { success: false, error: err.message, balance: '0' };
  }
}

async function fetchOnChainEvents(fromBlock = null) {
  if (!LandRegistryABI || !CarbonCreditManagerABI) {
    return { success: false, events: [], error: 'ABIs not loaded' };
  }
  try {
    const readProvider = getReadProvider();
    const current = await readProvider.getBlockNumber();
    const start = fromBlock || Math.max(0, current - 2000);

    const roLand = new ethers.Contract(
      process.env.LAND_REGISTRY_ADDRESS, LandRegistryABI, readProvider
    );
    const roCredit = new ethers.Contract(
      process.env.CARBON_CREDIT_MANAGER_ADDRESS, CarbonCreditManagerABI, readProvider
    );

    const [landEvts, issuedEvts, transferEvts] = await Promise.all([
      roLand.queryFilter(roLand.filters.LandRegistered(), start),
      roCredit.queryFilter(roCredit.filters.CreditsIssued(), start),
      roCredit.queryFilter(roCredit.filters.CreditsTransferred(), start),
    ]);

    const events = [
      ...landEvts.map(e => ({
        type: 'LandRegistered',
        landId: e.args[0],
        ipfsCid: e.args[1],
        timestamp: Number(e.args[2]),
        txHash: e.transactionHash,
        blockNumber: e.blockNumber,
        explorerUrl: `https://sepolia.etherscan.io/tx/${e.transactionHash}`,
      })),
      ...issuedEvts.map(e => ({
        type: 'CreditsIssued',
        landId: e.args[0],
        amount: ethers.formatUnits(e.args[1], 18),
        timestamp: Number(e.args[2]),
        txHash: e.transactionHash,
        blockNumber: e.blockNumber,
        explorerUrl: `https://sepolia.etherscan.io/tx/${e.transactionHash}`,
      })),
      ...transferEvts.map(e => ({
        type: 'CreditsTransferred',
        from: e.args[0],
        to: e.args[1],
        amount: ethers.formatUnits(e.args[2], 18),
        txHash: e.transactionHash,
        blockNumber: e.blockNumber,
        explorerUrl: `https://sepolia.etherscan.io/tx/${e.transactionHash}`,
      })),
    ].sort((a, b) => b.blockNumber - a.blockNumber);

    return { success: true, events, currentBlock: current };
  } catch (err) {
    console.error('[BLOCKCHAIN] fetchEvents error:', err.message);
    return { success: false, events: [], error: err.message };
  }
}

module.exports = {
  init,
  registerLandOnChain,
  issueCreditsOnChain,
  transferCreditsOnChain,
  verifyLandOnChain,
  getOnChainBalance,
  fetchOnChainEvents,
};
