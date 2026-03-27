// dotenv path: ../  = backend/  (one level up from backend/scripts/)
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { ethers } = require('ethers');
const path = require('path');

const ARTIFACTS = path.join(__dirname, '../../contracts/artifacts/contracts');

async function test() {
  console.log('=== CarbonTrace Blockchain Verification ===\n');

  let LandABI, CreditABI;
  try {
    LandABI = require(path.join(ARTIFACTS, 'LandRegistry.sol/LandRegistry.json')).abi;
    CreditABI = require(path.join(ARTIFACTS, 'CarbonCreditManager.sol/CarbonCreditManager.json')).abi;
    console.log('✓ ABIs loaded');
  } catch (e) {
    console.error('✗ ABI load failed:', e.message);
    process.exit(1);
  }

  let provider;
  try {
    provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const block = await provider.getBlockNumber();
    console.log('✓ Connected to Sepolia — block:', block);
  } catch (e) {
    console.error('✗ RPC connection failed:', e.message);
    process.exit(1);
  }

  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  console.log('✓ Wallet:', wallet.address);

  const balance = await provider.getBalance(wallet.address);
  const eth = parseFloat(ethers.formatEther(balance));
  console.log(`✓ Balance: ${eth} ETH`);
  if (eth < 0.001) {
    console.warn('⚠  LOW — get Sepolia ETH from https://sepoliafaucet.com');
  }

  const land = new ethers.Contract(process.env.LAND_REGISTRY_ADDRESS, LandABI, provider);
  const credit = new ethers.Contract(process.env.CARBON_CREDIT_MANAGER_ADDRESS, CreditABI, provider);

  try {
    const total = await land.totalLands();
    console.log('✓ LandRegistry.totalLands():', total.toString());
  } catch (e) {
    console.error('✗ LandRegistry read failed:', e.message);
  }

  try {
    const issued = await credit.totalIssued();
    console.log('✓ CarbonCreditManager.totalIssued():', ethers.formatUnits(issued, 18), 'CC');
  } catch (e) {
    console.error('✗ CarbonCreditManager read failed:', e.message);
  }

  try {
    await land.getLand('GOV-2024-MH-0001');
    console.log('✓ GOV-2024-MH-0001 is on-chain');
  } catch {
    console.log('ℹ  GOV-2024-MH-0001 not on-chain yet (expected for seeded data)');
  }

  try {
    const current = await provider.getBlockNumber();
    const [le, ce, te] = await Promise.all([
      land.queryFilter(land.filters.LandRegistered(), current - 1000),
      credit.queryFilter(credit.filters.CreditsIssued(), current - 1000),
      credit.queryFilter(credit.filters.CreditsTransferred(), current - 1000),
    ]);
    console.log(`✓ Events (last 1000 blocks): LandRegistered=${le.length} CreditsIssued=${ce.length} CreditsTransferred=${te.length}`);
  } catch (e) {
    console.error('✗ Event query failed:', e.message);
  }

  console.log('\n' + (eth >= 0.001
    ? '✅ READY — run: node server.js'
    : '⚠  Get Sepolia ETH first then run: node server.js'));
}

test().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
