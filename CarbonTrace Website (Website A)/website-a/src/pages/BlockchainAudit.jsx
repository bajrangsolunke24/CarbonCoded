import { useState, useEffect } from 'react';
import { Shield, ExternalLink, Hash, Clock, CheckCircle2, Blocks, Link2,
         RefreshCw, AlertCircle, Coins, ArrowRightLeft } from 'lucide-react';
import api from '../utils/api';
import BlockchainBadge from '../components/BlockchainBadge';

const EXPLORER = 'https://sepolia.etherscan.io';

const EVENT_META = {
  LandRegistered:    { icon: Shield,         cls: 'badge-verified', label: 'Land Registered' },
  CreditsIssued:     { icon: Coins,          cls: 'badge-approved', label: 'Credits Issued' },
  CreditsTransferred:{ icon: ArrowRightLeft, cls: 'badge-pending',  label: 'Credits Transferred' },
};

export default function BlockchainAudit() {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chainEvents, setChainEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const [currentBlock, setCurrentBlock] = useState(null);

  useEffect(() => {
    api.get('/gov/lands')
      .then((r) => setLands(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
    fetchChainEvents();
  }, []);

  const fetchChainEvents = () => {
    setEventsLoading(true);
    setEventsError(null);
    api.get('/gov/blockchain/events')
      .then((r) => {
        setChainEvents(r.data.events || []);
        setCurrentBlock(r.data.currentBlock);
      })
      .catch((err) => setEventsError(err.response?.data?.error || err.message))
      .finally(() => setEventsLoading(false));
  };

  const onChain  = lands.filter((l) => l.blockchain_hash && l.blockchain_hash.startsWith('0x') && l.blockchain_hash.length === 66);
  const offChain = lands.filter((l) => !l.blockchain_hash || !l.blockchain_hash.startsWith('0x'));


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-ct-text">Blockchain Audit Trail</h1>
          <p className="text-ct-muted text-sm mt-0.5">Immutable records on Ethereum Sepolia - LandRegistry smart contract</p>
        </div>
        <a
          href={`${EXPLORER}/address/0x0172a95425f10712321eB82D22e69d1c78605a3C`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gov-outline flex items-center gap-2 text-xs py-1.5"
        >
          <ExternalLink size={12} />
          View Contract on Etherscan
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="gov-card">
          <div className="flex items-center gap-2 mb-2">
            <Blocks size={14} className="text-gov-blue" />
            <p className="text-xs text-gray-500 uppercase font-semibold">On-Chain Records</p>
          </div>
          <p className="text-2xl font-bold text-gov-navy">{onChain.length}</p>
        </div>
        <div className="gov-card">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-gov-blue" />
            <p className="text-xs text-gray-500 uppercase font-semibold">Pending Chain</p>
          </div>
          <p className="text-2xl font-bold text-gov-navy">{offChain.length}</p>
        </div>
        <div className="gov-card">
          <div className="flex items-center gap-2 mb-2">
            <Link2 size={14} className="text-gov-blue" />
            <p className="text-xs text-gray-500 uppercase font-semibold">Network</p>
          </div>
          <p className="text-lg font-bold text-gov-navy mt-1">Ethereum Sepolia</p>
          <p className="text-[10px] text-gray-500">Chain ID: 11155111{currentBlock && ` · Block #${currentBlock.toLocaleString()}`}</p>
        </div>
      </div>

      {/* ── Live On-Chain Events ── */}
      <div className="ct-card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-gov-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Blocks size={14} className="text-gov-blue" />
            <h3 className="text-sm font-semibold text-gov-navy">Live Chain Events</h3>
            <span className="text-[10px] text-gray-500">(last 2,000 blocks)</span>
          </div>
          <button
            onClick={fetchChainEvents}
            disabled={eventsLoading}
            className="btn-gov-outline flex items-center gap-1 text-xs py-1 px-2"
          >
            <RefreshCw size={11} className={eventsLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
        {eventsError && (
          <div className="flex items-center gap-2 px-4 py-3 text-xs text-red-400">
            <AlertCircle size={12} /> {eventsError}
          </div>
        )}
        <table className="ct-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Land / Entity</th>
              <th>Amount</th>
              <th>Block</th>
              <th>Tx Hash</th>
            </tr>
          </thead>
          <tbody>
            {eventsLoading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                  <td key={j}><div className="h-3 bg-gov-border/50 animate-pulse w-20" /></td>
                  ))}
                </tr>
              ))
            ) : chainEvents.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-6 text-xs">
                  No events found in last 2 000 blocks. Approve a land to create the first transaction.
                </td>
              </tr>
            ) : (
              chainEvents.map((ev, i) => {
                const meta = EVENT_META[ev.type] || EVENT_META.LandRegistered;
                const Icon = meta.icon;
                return (
                  <tr key={i}>
                    <td>
                      <span className={`${meta.cls} flex items-center gap-1 w-fit`}>
                        <Icon size={9} />{meta.label}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-gov-blue">{ev.landId || ev.from || '—'}</td>
                    <td className="text-xs">{ev.amount ? `${parseFloat(ev.amount).toFixed(2)} CC` : '—'}</td>
                    <td className="text-xs text-gray-500">#{ev.blockNumber?.toLocaleString()}</td>
                    <td>
                      <a href={ev.explorerUrl} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-1 text-gov-blue underline text-xs font-mono">
                        {ev.txHash?.slice(0, 8)}…{ev.txHash?.slice(-6)}
                        <ExternalLink size={10} />
                      </a>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>


      <div className="ct-card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-gov-border flex items-center gap-2">
          <Shield size={14} className="text-gov-blue" />
          <h3 className="text-sm font-semibold text-gov-navy">Transaction Ledger</h3>
        </div>
        <table className="ct-table">
          <thead>
            <tr>
              <th>Land ID</th>
              <th>Owner</th>
              <th>Status</th>
              <th>IPFS</th>
              <th>Transaction Hash</th>
              <th>Etherscan</th>
            </tr>
          </thead>
          <tbody>
            {lands.map((l) => (
              <tr key={l.id}>
                <td className="font-mono text-xs text-gov-blue">{l.land_id_gov}</td>
                <td>{l.landRequest?.owner_name || '—'}</td>
                <td>
                  {(l.blockchain_hash && l.blockchain_hash.startsWith('0x') && l.blockchain_hash.length === 66) ? (
                    <span className="ct-badge-approved">
                      <CheckCircle2 size={10} className="mr-1" /> On-Chain
                    </span>
                  ) : (
                    <span className="ct-badge-pending">
                      <Clock size={10} className="mr-1" /> Pending
                    </span>
                  )}
                </td>
                <td>
                  {l.plantation_doc_cid && l.plantation_doc_cid !== 'QmPending' ? (
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${l.plantation_doc_cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-purple-600 underline"
                    >
                      {l.plantation_doc_cid.slice(0, 8)}...
                      <ExternalLink size={10} />
                    </a>
                  ) : (
                    <span className="text-gray-500 text-xs">—</span>
                  )}
                </td>
                <td colSpan={2}>
                  <BlockchainBadge hash={l.blockchain_hash} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Contract Info */}
      <div className="gov-card">
        <h3 className="text-sm font-semibold text-gov-navy mb-3">Deployed Contracts</h3>
        <div className="space-y-2">
          {[
            { name: 'LandRegistry', addr: '0x0172a95425f10712321eB82D22e69d1c78605a3C' },
            { name: 'CarbonCreditManager', addr: '0xD0e796095C08819C24120F45Af8CA1D8fE81d6E8' },
          ].map((c) => (
            <div key={c.name} className="flex items-center justify-between py-2 border-b border-gov-border/50 last:border-0">
              <div>
                <p className="text-xs font-semibold text-gov-navy">{c.name}</p>
                <p className="font-mono text-[11px] text-gray-500 mt-0.5">{c.addr}</p>
              </div>
              <a
                href={`${EXPLORER}/address/${c.addr}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gov-blue underline text-xs flex items-center gap-1"
              >
                <ExternalLink size={12} />
                Etherscan
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
