const hre = require('hardhat');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deployer:', deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('Balance:', hre.ethers.formatEther(balance), 'ETH');

  // Deploy LandRegistry
  console.log('\n[1/2] Deploying LandRegistry...');
  const LandRegistry = await hre.ethers.getContractFactory('LandRegistry');
  const lr = await LandRegistry.deploy();
  console.log('Tx sent:', lr.deploymentTransaction().hash);
  await lr.waitForDeployment();
  const lrAddr = await lr.getAddress();
  console.log('LandRegistry:', lrAddr);

  // Deploy CarbonCreditManager  
  console.log('\n[2/2] Deploying CarbonCreditManager...');
  const CCM = await hre.ethers.getContractFactory('CarbonCreditManager');
  const ccm = await CCM.deploy();
  console.log('Tx sent:', ccm.deploymentTransaction().hash);
  await ccm.waitForDeployment();
  const ccmAddr = await ccm.getAddress();
  console.log('CarbonCreditManager:', ccmAddr);

  // Summary
  console.log('\n════════════════════════════════════════');
  console.log('DEPLOYMENT COMPLETE');
  console.log('════════════════════════════════════════');
  console.log(`LAND_REGISTRY_ADDRESS=${lrAddr}`);
  console.log(`CARBON_CREDIT_MANAGER_ADDRESS=${ccmAddr}`);
  console.log('════════════════════════════════════════');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deploy failed:', error.message);
    process.exit(1);
  });
