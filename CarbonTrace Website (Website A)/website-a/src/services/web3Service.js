import { ethers } from 'ethers';

const LAND_REGISTRY_ADDRESS = '0x6C45a120d2DBFe85aa510298095492e3D39BeEBc';
const CARBON_CREDIT_MANAGER_ADDRESS = '0x217196d30309105b98E4B3F4f1D48c6ffAc28314';

const LAND_REGISTRY_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'landId', type: 'string' },
      { internalType: 'string', name: 'ipfsCid', type: 'string' },
      { internalType: 'string', name: 'polygonHash', type: 'string' },
    ],
    name: 'registerLand',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

const CARBON_CREDIT_ABI = [
  {
    inputs: [
      { internalType: 'string', name: 'landId', type: 'string' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'issueCredits',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'string', name: 'landId', type: 'string' },
      { internalType: 'string', name: 'companyId', type: 'string' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'transferToCompany',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export function isMetaMaskInstalled() {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

export async function ensureSepoliaNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }], // Sepolia Hex
    });
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0xaa36a7',
            chainName: 'Ethereum Sepolia Testnet',
            rpcUrls: ['https://rpc.sepolia.org'],
            nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          },
        ],
      });
    } else {
      throw err;
    }
  }
}

export async function connectWallet() {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask not installed. Please install from metamask.io');
  }

  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts?.length) {
    throw new Error('No accounts found. Please unlock MetaMask.');
  }

  await ensureSepoliaNetwork();

  return accounts[0];
}

async function getSigner() {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask not installed');
  }
  await ensureSepoliaNetwork();
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
}

export async function getConnectedAddress() {
  if (!isMetaMaskInstalled()) return null;
  const accounts = await window.ethereum.request({
    method: 'eth_accounts',
  });
  return accounts[0] || null;
}

export async function signRegisterLand(landIdGov, ipfsCid, polygon) {
  const signer = await getSigner();
  const contract = new ethers.Contract(
    LAND_REGISTRY_ADDRESS,
    LAND_REGISTRY_ABI,
    signer
  );

  const polygonStr =
    typeof polygon === 'object' ? JSON.stringify(polygon) : String(polygon);
  const polygonHash = polygonStr.substring(0, 64);

  console.log('[WEB3] registerLand with CID:', ipfsCid);
  const tx = await contract.registerLand(landIdGov, ipfsCid, polygonHash);

  console.log('[WEB3] Tx sent:', tx.hash);
  const receipt = await tx.wait();
  console.log('[WEB3] Confirmed:', receipt.blockNumber);

  return {
    success: true,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    ipfsCid,
    explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
    ipfsUrl: `https://gateway.pinata.cloud/ipfs/${ipfsCid}`,
    signerAddress: await signer.getAddress(),
  };
}

export async function signIssueCredits(landIdGov, amount) {
  const signer = await getSigner();
  const contract = new ethers.Contract(
    CARBON_CREDIT_MANAGER_ADDRESS,
    CARBON_CREDIT_ABI,
    signer
  );

  const amountWei = ethers.parseUnits(
    String(Math.max(1, Math.floor(amount))),
    18
  );

  console.log('[WEB3] issueCredits:', landIdGov, amount, 'CC');
  const tx = await contract.issueCredits(landIdGov, amountWei);
  console.log('[WEB3] Tx sent:', tx.hash);

  const receipt = await tx.wait();
  console.log('[WEB3] Confirmed:', receipt.blockNumber);

  return {
    success: true,
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    explorerUrl: `https://sepolia.etherscan.io/tx/${receipt.hash}`,
    signerAddress: await signer.getAddress(),
  };
}
