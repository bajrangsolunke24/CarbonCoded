import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin, Search, ChevronRight, ChevronDown,
  XCircle, Clock, ExternalLink, Upload, User, MapIcon,
  Calendar, Leaf, Shield
} from 'lucide-react';
import api from '../utils/api';
import {
  signRegisterLand,
  connectWallet,
  getConnectedAddress
} from '../services/web3Service';

const getIPFSUrl = (cid) => {
  if (!cid || cid.includes('Fake') ||
      cid === 'QmPending' || cid === 'PENDING_CHAIN') {
    return null;
  }
  const clean = cid
    .replace('https://gateway.pinata.cloud/ipfs/', '')
    .replace('https://ipfs.io/ipfs/', '')
    .trim();
  return `https://gateway.pinata.cloud/ipfs/${clean}`;
};

const STATUS_STYLE = {
  PENDING: {
    bg: 'bg-accent-amber/10',
    text: 'text-accent-amber',
    border: 'border-accent-amber/30',
    label: 'Pending'
  },
  APPROVED: {
    bg: 'bg-accent-emerald/10',
    text: 'text-accent-emerald',
    border: 'border-accent-emerald/30',
    label: 'Approved'
  },
  REJECTED: {
    bg: 'bg-accent-red/10',
    text: 'text-accent-red',
    border: 'border-accent-red/30',
    label: 'Rejected'
  },
  UNDER_REVIEW: {
    bg: 'bg-accent-blue/10',
    text: 'text-accent-blue',
    border: 'border-accent-blue/30',
    label: 'Under Review'
  },
};

export default function LandRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [detailData, setDetailData] = useState({});
  const [loadingDetail, setLoadingDetail] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [blockchainStatus, setBlockchainStatus] = useState(null);
  const [uploadingFor, setUploadingFor] = useState(null);
  const walletConnecting = useRef(false);

  const fetchRequests = () => {
    setLoading(true);
    api.get('/gov/land-requests')
      .then(r => setRequests(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const filtered = requests.filter(r => {
    if (filter !== 'ALL' && r.status !== filter) return false;
    if (search &&
        !r.owner_name?.toLowerCase().includes(search.toLowerCase()) &&
        !r.panchayat?.name?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const countByStatus = requests.reduce((a, r) => {
    a[r.status] = (a[r.status] || 0) + 1;
    return a;
  }, {});

  const handleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (detailData[id]) return;

    setLoadingDetail(id);
    try {
      const res = await api.get(`/gov/land-requests/${id}`);
      setDetailData(prev => ({ ...prev, [id]: res.data }));
    } catch (err) {
      console.error('Detail load failed:', err);
    } finally {
      setLoadingDetail(null);
    }
  };

  const handleApprove = async (request) => {
    if (walletConnecting.current) return; // guard: MetaMask already pending
    try {
      walletConnecting.current = true;
      setProcessing(request.id);

      setBlockchainStatus('Connecting wallet...');
      let wallet = await getConnectedAddress();
      if (!wallet) wallet = await connectWallet();

      setBlockchainStatus('Uploading land data to Pinata IPFS...');
      const prepRes = await api.post(
        `/gov/land-requests/${request.id}/prepare-approval`,
        { state: 'MH' }
      );
      const { land_id_gov, ipfs_cid, polygon } = prepRes.data;

      setBlockchainStatus('Waiting for MetaMask signature...');
      const result = await signRegisterLand(
        land_id_gov, ipfs_cid, polygon
      );

      setBlockchainStatus('Saving to database...');
      await api.patch(
        `/gov/land-requests/${request.id}/approve-with-hash`,
        {
          tx_hash: result.txHash,
          land_id_gov,
          ipfs_cid,
          signer_address: result.signerAddress,
          polygon
        }
      );

      setBlockchainStatus(null);
      setProcessing(null);
      const res = await api.get(`/gov/land-requests/${request.id}`);
      setDetailData(prev => ({ ...prev, [request.id]: res.data }));
      fetchRequests();
    } catch (err) {
      setBlockchainStatus(null);
      setProcessing(null);
      if (err.code === 4001) {
        alert('Transaction rejected in MetaMask');
      } else {
        alert(err.message || 'Approval failed');
      }
    } finally {
      walletConnecting.current = false;
    }
  };


  const handleReject = async (requestId) => {
    if (!confirm('Reject this land request?')) return;
    try {
      await api.patch(`/gov/land-requests/${requestId}/reject`);
      fetchRequests();
      setDetailData(prev => {
        const updated = { ...prev };
        if (updated[requestId]) {
          updated[requestId] = { ...updated[requestId], status: 'REJECTED' };
        }
        return updated;
      });
    } catch (err) {
      alert('Rejection failed: ' + err.message);
    }
  };

  const handleFileUpload = async (requestId, files) => {
    const formData = new FormData();
    if (files.satbara) formData.append('satbara', files.satbara);
    if (files.other_doc) formData.append('other_doc', files.other_doc);

    setUploadingFor(requestId);
    try {
      await api.post(
        `/gov/land-requests/${requestId}/upload-document`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const detail = await api.get(`/gov/land-requests/${requestId}`);
      setDetailData(prev => ({ ...prev, [requestId]: detail.data }));
      alert('Documents uploaded to Pinata IPFS successfully');
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploadingFor(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-xl font-bold text-ct-text">
            Land Registration Requests
          </h1>
          <p className="text-sm text-ct-muted mt-0.5">
            Review and approve land registration
            submitted by panchayats
          </p>
        </div>
        <span className="text-xs text-text-muted">
          {requests.length} total requests
        </span>
      </div>

      <div className="ct-card flex items-center justify-between gap-4">
        <div className="flex gap-1">
          {['ALL', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === s
                  ? 'bg-accent-amber/10 text-accent-amber'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {s === 'ALL' ? 'All' : STATUS_STYLE[s]?.label || s}
              {s !== 'ALL' && countByStatus[s] ? ` (${countByStatus[s]})` : ''}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search owner or panchayat..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="gov-input pl-8 py-1.5 text-xs w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="ct-card flex items-center justify-center h-48">
          <p className="text-sm text-text-muted animate-pulse">
            Loading requests...
          </p>
        </div>
      ) : (
        <div className="ct-card p-0 overflow-hidden">
          <table className="ct-table">
            <thead>
              <tr>
                <th>Request #</th>
                <th>Owner Name</th>
                <th>Panchayat</th>
                <th>District</th>
                <th>Area (ha)</th>
                <th>Status</th>
                <th>Submitted</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const st = STATUS_STYLE[r.status] || STATUS_STYLE.PENDING;
                const isExpanded = expandedId === r.id;
                const detail = detailData[r.id];

                return (
                  <React.Fragment key={r.id}>
                    <tr
                      className="cursor-pointer hover:bg-gov-surface/50"
                      onClick={() => handleExpand(r.id)}
                    >
                      <td className="font-mono text-xs text-accent-cyan">
                        REQ-{String(r.id).padStart(4, '0')}
                      </td>
                      <td className="font-medium">{r.owner_name}</td>
                      <td className="text-text-secondary">{r.panchayat?.name || '—'}</td>
                      <td className="text-text-secondary text-xs">{r.panchayat?.district || '—'}</td>
                      <td className="font-mono">{r.area_hectares}</td>
                      <td>
                        <span className={`ct-badge ${st.bg} ${st.text} border ${st.border}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="text-xs text-text-muted">
                        {new Date(r.createdAt || r.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: '2-digit'
                        })}
                      </td>
                      <td>
                        {isExpanded
                          ? <ChevronDown size={14} className="text-accent-amber" />
                          : <ChevronRight size={14} className="text-text-muted" />
                        }
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr key={`detail-${r.id}`}>
                        <td colSpan={8} className="p-0 bg-gov-navy/30">
                          {loadingDetail === r.id ? (
                            <div className="p-6 text-center text-sm text-text-muted animate-pulse">
                              Loading details...
                            </div>
                          ) : detail ? (
                            <DetailPanel
                              request={detail}
                              onApprove={handleApprove}
                              onReject={handleReject}
                              onUpload={handleFileUpload}
                              processing={processing}
                              uploading={uploadingFor === r.id}
                            />
                          ) : (
                            <div className="p-6 text-center text-sm text-text-muted">
                              Failed to load details
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-text-muted">
                    No requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {blockchainStatus && (
        <div className="fixed bottom-6 right-6 z-50 bg-gov-surface border border-accent-cyan/40 px-5 py-4 shadow-2xl min-w-72">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-accent-cyan text-sm font-semibold">
              Blockchain Transaction
            </span>
          </div>
          <p className="text-text-secondary text-xs ml-7">{blockchainStatus}</p>
        </div>
      )}
    </div>
  );
}

function DetailPanel({
  request, onApprove, onReject,
  onUpload, processing, uploading
}) {
  const [satbaraFile, setSatbaraFile] = useState(null);
  const [otherFile, setOtherFile] = useState(null);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  const docs = request.documents?.find(d => d.satbara_cid || d.other_docs_cid) || request.documents?.[0] || null;
  const land = request.registeredLand || null;

  const satbaraUrl = getIPFSUrl(docs?.satbara_cid);
  const otherDocUrl = getIPFSUrl(docs?.other_docs_cid);
  const landIpfsUrl = getIPFSUrl(land?.plantation_doc_cid);
  const hasAnyDocument = Boolean(satbaraUrl || otherDocUrl);
  const etherscanUrl = land?.blockchain_hash &&
    land.blockchain_hash !== 'PENDING_CHAIN' &&
    land.blockchain_hash.startsWith('0x')
    ? `https://sepolia.etherscan.io/tx/${land.blockchain_hash}`
    : null;

  const handleUploadSubmit = () => {
    if (!satbaraFile && !otherFile) {
      alert('Please select at least one file');
      return;
    }
    onUpload(request.id, { satbara: satbaraFile, other_doc: otherFile });
  };

  return (
    <div className="p-5 grid grid-cols-3 gap-5 border-t border-gov-border">
      <div className="space-y-4">
        <div>
          <p className="text-xs text-accent-cyan font-semibold uppercase tracking-wider mb-2">
            Owner Information
          </p>
          <div className="space-y-2">
            {[
              { icon: User, label: 'Owner Name', value: request.owner_name },
              { icon: MapIcon, label: 'Location', value: request.location_description },
              { icon: Leaf, label: 'Area', value: `${request.area_hectares} hectares` },
              { icon: Calendar, label: 'Submitted', value: new Date(request.created_at).toLocaleDateString('en-IN') },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <item.icon size={12} className="text-text-muted mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-text-muted uppercase tracking-wide">{item.label}</p>
                  <p className="text-xs text-text-primary font-medium">{item.value || '—'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-accent-cyan font-semibold uppercase tracking-wider mb-2">Panchayat</p>
          <div className="space-y-1.5 text-xs">
            <p className="text-text-primary font-medium">{request.panchayat?.name}</p>
            <p className="text-text-secondary">{request.panchayat?.village}, {request.panchayat?.taluka}</p>
            <p className="text-text-secondary">{request.panchayat?.district}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-accent-cyan font-semibold uppercase tracking-wider mb-2">
            Uploaded Documents
          </p>

          <div className="bg-gov-navy/50 border border-gov-border p-3 mb-2">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-accent-amber" />
                <span className="text-xs font-medium text-text-primary">7/12 Satbara Extract</span>
              </div>
              {satbaraUrl ? (
                <span className="text-[10px] px-1.5 py-0.5 bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30">ON IPFS</span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 bg-accent-amber/10 text-accent-amber border border-accent-amber/30">NOT YET ON IPFS</span>
              )}
            </div>
            {satbaraUrl ? (
              <div className="space-y-1">
                <p className="text-[10px] text-text-muted font-mono break-all">{docs?.satbara_cid?.slice(0, 20)}...</p>
                <a href={satbaraUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-accent-cyan hover:text-accent-amber transition-colors">
                  View on Pinata IPFS
                  <ExternalLink size={9} />
                </a>
              </div>
            ) : (
              <p className="text-[10px] text-text-muted">Not yet on IPFS</p>
            )}
          </div>

          <div className="bg-gov-navy/50 border border-gov-border p-3">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <MapPin size={12} className="text-accent-blue" />
                <span className="text-xs font-medium text-text-primary">Supporting Document</span>
              </div>
              {otherDocUrl ? (
                <span className="text-[10px] px-1.5 py-0.5 bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30">ON IPFS</span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 bg-accent-amber/10 text-accent-amber border border-accent-amber/30">NOT YET ON IPFS</span>
              )}
            </div>
            {otherDocUrl ? (
              <div className="space-y-1">
                <p className="text-[10px] text-text-muted font-mono break-all">{docs?.other_docs_cid?.slice(0, 20)}...</p>
                <a href={otherDocUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-accent-cyan hover:text-accent-amber transition-colors">
                  View on Pinata IPFS
                  <ExternalLink size={9} />
                </a>
              </div>
            ) : (
              <p className="text-[10px] text-text-muted">Not yet on IPFS</p>
            )}
          </div>
        </div>

        {request.status === 'PENDING' && (
          <div>
            <p className="text-xs text-accent-cyan font-semibold uppercase tracking-wider mb-2">
              Upload Documents
            </p>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] text-text-muted uppercase tracking-wide block mb-1">
                  Satbara / 7-12 Extract (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setSatbaraFile(e.target.files[0])}
                  className="text-xs text-text-secondary w-full file:mr-2 file:py-1 file:px-2 file:border-0 file:text-xs file:bg-gov-surface file:text-accent-cyan file:cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[10px] text-text-muted uppercase tracking-wide block mb-1">
                  Other Document (optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={e => setOtherFile(e.target.files[0])}
                  className="text-xs text-text-secondary w-full file:mr-2 file:py-1 file:px-2 file:border-0 file:text-xs file:bg-gov-surface file:text-accent-cyan file:cursor-pointer"
                />
              </div>
              <button
                onClick={handleUploadSubmit}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/20 disabled:opacity-50 transition-colors"
              >
                <Upload size={12} />
                {uploading ? 'Uploading to Pinata...' : 'Upload to IPFS'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {land && (
          <div>
            <p className="text-xs text-accent-cyan font-semibold uppercase tracking-wider mb-2">
              Blockchain Record
            </p>
            <div className="bg-gov-navy/50 border border-gov-border p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-muted uppercase">Land ID</span>
                <span className="text-xs text-accent-cyan font-mono font-bold">{land.land_id_gov}</span>
              </div>
              <div>
                <span className="text-[10px] text-text-muted uppercase block mb-1">Tx Hash</span>
                {etherscanUrl ? (
                  <a href={etherscanUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-accent-emerald hover:text-accent-cyan font-mono transition-colors">
                    {land.blockchain_hash.slice(0, 12)}...{land.blockchain_hash.slice(-6)}
                    <ExternalLink size={9} />
                  </a>
                ) : (
                  <span className="text-[10px] text-accent-amber flex items-center gap-1">
                    <Clock size={9} />
                    {land.blockchain_hash === 'PENDING_CHAIN' ? 'Pending confirmation' : 'Not yet on chain'}
                  </span>
                )}
              </div>
              {landIpfsUrl && (
                <div>
                  <span className="text-[10px] text-text-muted uppercase block mb-1">IPFS Record</span>
                  <a href={landIpfsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-accent-cyan hover:text-accent-amber transition-colors">
                    View land data on Pinata
                    <ExternalLink size={9} />
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs text-accent-cyan font-semibold uppercase tracking-wider mb-2">
            Actions
          </p>
          {request.status === 'PENDING' ? (
            <div className="space-y-2">
              <div className="p-2 border border-gov-border bg-gov-surface">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reviewConfirmed}
                    onChange={(e) => setReviewConfirmed(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-[11px] text-text-secondary">
                    I have reviewed owner details, panchayat data, and uploaded documents before taking action.
                  </span>
                </label>
                {!hasAnyDocument && (
                  <p className="text-[10px] text-accent-amber mt-2">
                    No valid IPFS documents found yet. Upload/review documents before approval.
                  </p>
                )}
              </div>

              <button
                onClick={() => onApprove(request)}
                disabled={processing === request.id || !reviewConfirmed || !hasAnyDocument}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald hover:bg-accent-emerald/20 disabled:opacity-50 transition-colors"
              >
                <Shield size={12} />
                {processing === request.id ? 'Processing...' : '⛓ Approve + Register on Chain'}
              </button>
              <button
                onClick={() => onReject(request.id)}
                disabled={processing === request.id || !reviewConfirmed}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-semibold bg-accent-red/10 border border-accent-red/30 text-accent-red hover:bg-accent-red/20 disabled:opacity-50 transition-colors"
              >
                <XCircle size={12} />
                Reject Request
              </button>
            </div>
          ) : (
            <div className={`p-3 border text-xs text-center ${STATUS_STYLE[request.status]?.bg} ${STATUS_STYLE[request.status]?.text} border-current/30`}>
              {request.status === 'APPROVED'
                ? '✓ Approved and registered on blockchain'
                : '✗ This request has been rejected'}
            </div>
          )}
        </div>

        {land?.allowed_species?.length > 0 && (
          <div>
            <p className="text-xs text-accent-cyan font-semibold uppercase tracking-wider mb-2">
              Allowed Species
            </p>
            <div className="flex flex-wrap gap-1">
              {land.allowed_species.map((s, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/30">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
