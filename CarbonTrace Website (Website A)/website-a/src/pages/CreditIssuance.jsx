import { useState, useEffect } from 'react';
import { Coins, Calculator, CheckCircle2, Hash, Leaf, TrendingUp, Loader2 } from 'lucide-react';
import api from '../utils/api';
import {
  signIssueCredits,
  connectWallet,
  getConnectedAddress,
} from '../services/web3Service';

export default function CreditIssuance() {
  const [lands, setLands] = useState([]);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [blockchainStatus, setBlockchainStatus] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const fetchLands = () => {
    Promise.all([api.get('/gov/lands'), api.get('/gov/credits/count')])
      .then(([landsRes, creditsRes]) => {
        setLands(landsRes.data || []);
        setCredits(creditsRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLands();
  }, []);

  const handleIssueCredits = async (land) => {
    setProcessing(land.land_id_gov);
    setError('');
    setSuccess(null);
    try {
      setBlockchainStatus('Connecting wallet...');
      let walletAddress = await getConnectedAddress();
      if (!walletAddress) {
        walletAddress = await connectWallet();
      }

      setBlockchainStatus('Uploading credit data to IPFS (Pinata)...');
      const prepRes = await api.post(`/gov/lands/${land.land_id_gov}/prepare-credits`, { years: 1 });
      const { credits_calculated, ipfs_cid } = prepRes.data;

      setBlockchainStatus('Waiting for MetaMask signature...');
      const result = await signIssueCredits(land.land_id_gov, credits_calculated);

      setBlockchainStatus('Saving to database...');
      await api.post(`/gov/lands/${land.land_id_gov}/issue-credits-with-hash`, {
        tx_hash: result.txHash,
        ipfs_cid,
        credits_calculated,
        signer_address: result.signerAddress,
      });

      setBlockchainStatus(null);
      setSuccess({
        land_id: land.land_id_gov,
        credits: credits_calculated,
        tx_hash: result.txHash,
        explorer_url: result.explorerUrl,
        ipfs_url: `https://gateway.pinata.cloud/ipfs/${ipfs_cid}`,
      });
      fetchLands();
    } catch (err) {
      setBlockchainStatus(null);
      if (err.code === 4001) {
        setError('Rejected in MetaMask');
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Credit issuance failed.');
      }
    } finally {
      setProcessing(null);
    }
  };

  /* Credit calculation formula (representative) */
  const calculateCredits = (areaHa) => {
    const seqRate = 7.5;      // tCO2/ha/year
    const survivalRate = 0.85;
    return (parseFloat(areaHa) * seqRate * survivalRate).toFixed(2);
  };

  const totalArea = lands.reduce((s, l) => s + parseFloat(l.landRequest?.area_hectares || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-ct-text">Carbon Credit Issuance</h1>
          <p className="text-ct-muted text-sm mt-0.5">Calculate, approve, and issue tCO2 credits with blockchain verification</p>
        </div>
      </div>

      {error && (
        <div className="gov-card bg-red-50 border border-red-200 text-red-700 text-sm py-2 px-3">
          {error}
        </div>
      )}
      {success && (
        <div className="gov-card bg-green-50 border border-green-200 text-green-700 text-sm py-2 px-3 flex items-center justify-between gap-2 flex-wrap">
          <span>
            <strong>{success.credits?.toFixed(0)}</strong> credits issued for <strong>{success.land_id}</strong>.
          </span>
          <div className="flex gap-3">
            {success.explorer_url && (
              <a href={success.explorer_url} target="_blank" rel="noopener noreferrer" className="text-gov-blue underline text-xs">
                Etherscan →
              </a>
            )}
            {success.ipfs_url && (
              <a href={success.ipfs_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 underline text-xs">
                IPFS →
              </a>
            )}
          </div>
        </div>
      )}
      {blockchainStatus && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-gov-border px-5 py-4 shadow-2xl min-w-72">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 border-2 border-gov-blue border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-gov-blue text-sm font-semibold">Blockchain Transaction</span>
          </div>
          <p className="text-gray-600 text-xs ml-7">{blockchainStatus}</p>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="gov-card">
          <div className="flex items-center gap-2 mb-2">
            <Coins size={14} className="text-gov-blue" />
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Issued</p>
          </div>
          <p className="text-2xl font-bold text-gov-navy">{credits ? parseFloat(credits.total_issued).toLocaleString() : '—'}</p>
          <p className="text-[10px] text-gray-500 mt-1">tCO2 equivalent</p>
        </div>
        <div className="gov-card">
          <div className="flex items-center gap-2 mb-2">
            <Leaf size={14} className="text-green-700" />
            <p className="text-xs text-gray-500 uppercase font-semibold">Available</p>
          </div>
          <p className="text-2xl font-bold text-gov-navy">{credits ? parseFloat(credits.total_available).toLocaleString() : '—'}</p>
          <p className="text-[10px] text-gray-500 mt-1">For marketplace sale</p>
        </div>
        <div className="gov-card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-gov-blue" />
            <p className="text-xs text-gray-500 uppercase font-semibold">Total Area</p>
          </div>
          <p className="text-2xl font-bold text-gov-navy">{totalArea.toFixed(1)}</p>
          <p className="text-[10px] text-gray-500 mt-1">Hectares registered</p>
        </div>
        <div className="gov-card">
          <div className="flex items-center gap-2 mb-2">
            <Calculator size={14} className="text-gov-blue" />
            <p className="text-xs text-gray-500 uppercase font-semibold">Seq. Rate</p>
          </div>
          <p className="text-2xl font-bold text-gov-navy">7.5</p>
          <p className="text-[10px] text-gray-500 mt-1">tCO2/ha/year</p>
        </div>
      </div>

      <div className="bg-gov-table border border-gov-border p-3 text-xs">
        <div className="font-bold text-gov-navy mb-2">Carbon Calculation Formula</div>
        <div className="text-gray-600">credits = area_ha × 7.5 × 0.85</div>
      </div>

      {/* Credit Calculation Table */}
      <div className="ct-card overflow-hidden">
        <div className="gov-card-header">
          <div className="flex items-center gap-2">
            <Calculator size={14} />
            <h3 className="text-sm font-semibold">Credit Calculation per Land Parcel</h3>
          </div>
        </div>
        <table className="ct-table">
          <thead>
            <tr>
              <th>Land ID</th>
              <th>Owner</th>
              <th>Area (ha)</th>
              <th>Species</th>
              <th>Credits (tCO₂)</th>
              <th>Blockchain</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {lands.map((l) => {
              const area = l.landRequest?.area_hectares || 0;
              const creds = calculateCredits(area);
              const hasHash = !!l.blockchain_hash;
              return (
                <tr key={l.id}>
                  <td className="font-mono text-xs text-gov-blue">{l.land_id_gov}</td>
                  <td>{l.landRequest?.owner_name || '—'}</td>
                  <td className="font-mono">{area}</td>
                  <td className="text-xs text-gray-600">{l.allowed_species?.slice(0, 2).join(', ') || '—'}</td>
                  <td>
                    <span className="font-mono text-gov-blue font-semibold">{creds}</span>
                  </td>
                  <td>
                    {hasHash ? (
                      <a
                        href={`https://sepolia.etherscan.io/tx/${l.blockchain_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-gov-blue underline text-[10px] font-mono"
                      >
                        <Hash size={10} />
                        {l.blockchain_hash.slice(0, 10)}...
                      </a>
                    ) : (
                      <span className="text-gray-500 text-[10px]">Not minted</span>
                    )}
                  </td>
                  <td>
                    <span className={l.status === 'VERIFIED' ? 'ct-badge-verified' : 'ct-badge-pending'}>
                      {l.status === 'VERIFIED' ? <CheckCircle2 size={10} className="mr-1" /> : null}
                      {l.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleIssueCredits(l)}
                      disabled={processing === l.land_id_gov}
                      className="btn-gov text-xs py-1 px-3 disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                      {processing === l.land_id_gov ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Coins size={12} />
                      )}
                      {processing === l.land_id_gov ? 'Processing...' : '⛓ Issue'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
