// Ethereum / MetaMask wallet integration for the Carbon Credit frontend

export const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex
export const CONTRACT_ADDRESS = '0xBb30a555d41dD89677A38F65Dc39864530793D9c';

// Minimal ABI — read-only functions only
const CONTRACT_ABI = [
  {
    name: 'getCertificate',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_certId', type: 'string' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'certId',     type: 'string'  },
          { name: 'companyCIN',type: 'string'  },
          { name: 'landId',    type: 'string'  },
          { name: 'credits',   type: 'uint256' },
          { name: 'validFrom', type: 'uint256' },
          { name: 'validTo',   type: 'uint256' },
          { name: 'issuedBy',  type: 'address' },
          { name: 'issuedAt',  type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'verifyCertificate',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_certId', type: 'string' }],
    outputs: [{ type: 'bool' }],
  },
];

declare global {
  interface Window {
    ethereum?: any;
  }
}

/** Connect MetaMask and return the selected wallet address */
export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
  }

  // Ask user to connect
  const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts returned by MetaMask.');
  }

  // Ensure we're on Sepolia
  const chainId: string = await window.ethereum.request({ method: 'eth_chainId' });
  if (chainId !== SEPOLIA_CHAIN_ID) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // If Sepolia not in list, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia Testnet',
              rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
              nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  return accounts[0];
}

/** Get the currently connected wallet address (no popup) */
export async function getWalletAddress(): Promise<string | null> {
  if (!window.ethereum) return null;
  const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
  return accounts[0] || null;
}

export interface OnChainCertificate {
  certId: string;
  companyCIN: string;
  landId: string;
  credits: bigint;
  validFrom: bigint;
  validTo: bigint;
  issuedBy: string;
  issuedAt: bigint;
  isValid: boolean;
}

/** Read a certificate directly from the Sepolia blockchain via MetaMask */
export async function verifyCertificateOnChain(certId: string): Promise<OnChainCertificate> {
  if (!window.ethereum) {
    throw new Error('MetaMask is not installed.');
  }

  // We use a raw eth_call so we don't need ethers as a frontend dep
  const iface = {
    getCertificate: '0x' + keccak256Selector('getCertificate(string)'),
    verifyCertificate: '0x' + keccak256Selector('verifyCertificate(string)'),
  };

  // Dynamic import of ethers to keep bundle small
  const { ethers } = await import('ethers');
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

  const [cert, isValid] = await Promise.all([
    contract.getCertificate(certId),
    contract.verifyCertificate(certId),
  ]);

  return {
    certId: cert.certId,
    companyCIN: cert.companyCIN,
    landId: cert.landId,
    credits: cert.credits,
    validFrom: cert.validFrom,
    validTo: cert.validTo,
    issuedBy: cert.issuedBy,
    issuedAt: cert.issuedAt,
    isValid,
  };
}

// Helper: we don't actually need keccak in this file since ethers handles encoding
function keccak256Selector(_sig: string): string { return ''; }
