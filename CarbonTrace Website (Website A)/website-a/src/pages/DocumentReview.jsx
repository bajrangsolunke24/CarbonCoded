import { useState, useEffect } from 'react';
import {
  FileCheck2, FileText, ExternalLink,
  CheckCircle2, XCircle, Clock, RefreshCw
} from 'lucide-react';
import api from '../utils/api';

const getIPFSUrl = (cid) => {
  if (!cid || cid.includes('Fake') ||
      cid === 'QmPending') return null;
  const clean = cid
    .replace('https://gateway.pinata.cloud/ipfs/', '')
    .replace('https://ipfs.io/ipfs/', '')
    .trim();
  return `https://gateway.pinata.cloud/ipfs/${clean}`;
};

const STATUS_MAP = {
  VERIFIED: {
    bg: 'bg-accent-emerald/10',
    text: 'text-accent-emerald',
    border: 'border-accent-emerald/30',
    icon: CheckCircle2,
    label: 'Verified'
  },
  PENDING: {
    bg: 'bg-accent-amber/10',
    text: 'text-accent-amber',
    border: 'border-accent-amber/30',
    icon: Clock,
    label: 'Pending'
  },
  REJECTED: {
    bg: 'bg-accent-red/10',
    text: 'text-accent-red',
    border: 'border-accent-red/30',
    icon: XCircle,
    label: 'Rejected'
  },
};

export default function DocumentReview() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchDocs = () => {
    setLoading(true);
    api.get('/gov/documents')
      .then(r => setDocs(r.data))
      .catch(err => {
        console.error('Failed to load docs:', err);
        setDocs([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, []);

  const filtered = filter === 'ALL'
    ? docs
    : docs.filter(d => d.doc_status === filter);

  const counts = docs.reduce((a, d) => {
    a[d.doc_status] = (a[d.doc_status] || 0) + 1;
    return a;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-xl font-bold
                         text-ct-text">
            Document Verification
          </h1>
          <p className="text-sm text-ct-muted mt-0.5">
            Review uploaded land ownership documents
            stored on Pinata IPFS
          </p>
        </div>
        <button
          onClick={fetchDocs}
          className="flex items-center gap-1.5 text-xs
                     text-text-muted hover:text-accent-cyan
                     transition-colors"
        >
          <RefreshCw size={12}
            className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Verified', key: 'VERIFIED',
            color: 'text-accent-emerald',
            bg: 'bg-accent-emerald/10' },
          { label: 'Pending Review', key: 'PENDING',
            color: 'text-accent-amber',
            bg: 'bg-accent-amber/10' },
          { label: 'Rejected', key: 'REJECTED',
            color: 'text-accent-red',
            bg: 'bg-accent-red/10' },
        ].map(s => (
          <div key={s.key}
               className="ct-card flex items-center gap-3">
            <div className={`w-9 h-9 ${s.bg} flex
                             items-center justify-center`}>
              <FileCheck2 size={16} className={s.color} />
            </div>
            <div>
              <p className="gov-stat-value">
                {counts[s.key] || 0}
              </p>
              <p className="gov-stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="ct-card flex gap-1">
        {['ALL','PENDING','VERIFIED','REJECTED'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium
                        transition-colors ${
              filter === s
                ? 'bg-accent-amber/10 text-accent-amber'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            {s === 'ALL'
              ? `All (${docs.length})`
              : `${s.charAt(0) + s.slice(1).toLowerCase()}
                 (${counts[s] || 0})`}
          </button>
        ))}
      </div>

      {/* Document Cards */}
      {loading ? (
        <div className="ct-card flex items-center
                        justify-center h-48">
          <p className="text-sm text-text-muted animate-pulse">
            Loading documents...
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ct-card flex items-center
                        justify-center h-48">
          <p className="text-sm text-text-muted">
            No documents found
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {filtered.map(doc => {
            const st = STATUS_MAP[doc.doc_status]
              || STATUS_MAP.PENDING;
            const StIcon = st.icon;
            const satbaraUrl = getIPFSUrl(doc.satbara_cid);
            const otherUrl = getIPFSUrl(doc.other_docs_cid);

            return (
              <div key={doc.id}
                   className="ct-card hover:border-accent-amber/30
                              transition-colors">
                <div className="flex items-start
                                justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText size={16}
                              className="text-accent-cyan" />
                    <div>
                      <p className="text-sm font-semibold
                                   text-text-primary">
                        {doc.req_number} - {doc.owner}
                      </p>
                      <p className="text-[10px] text-text-muted
                                   mt-0.5">
                        {doc.panchayat} · {doc.district}
                      </p>
                    </div>
                  </div>
                  <span className={`ct-badge ${st.bg}
                    ${st.text} border ${st.border}`}>
                    <StIcon size={10} className="mr-1" />
                    {st.label}
                  </span>
                </div>

                {/* Document links */}
                <div className="space-y-2 pt-2
                                border-t border-gov-border">
                  {/* Satbara */}
                  <div className="flex items-center
                                  justify-between">
                    <span className="text-xs text-text-secondary">
                      7/12 Satbara Extract
                    </span>
                    {satbaraUrl ? (
                      <a
                        href={satbaraUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1
                                   text-xs text-accent-cyan
                                   hover:text-accent-amber
                                   transition-colors"
                      >
                        View IPFS
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-xs
                                       text-text-muted">
                        Not yet on IPFS
                      </span>
                    )}
                  </div>

                  {/* Other doc */}
                  <div className="flex items-center
                                  justify-between">
                    <span className="text-xs text-text-secondary">
                      Supporting Document
                    </span>
                    {otherUrl ? (
                      <a
                        href={otherUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1
                                   text-xs text-accent-cyan
                                   hover:text-accent-amber
                                   transition-colors"
                      >
                        View IPFS
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-xs
                                       text-text-muted">
                        Not yet on IPFS
                      </span>
                    )}
                  </div>

                  {/* CID display */}
                  {(doc.satbara_cid || doc.other_docs_cid) && (
                    <div className="mt-2 p-2
                                    bg-gov-navy/50
                                    border border-gov-border">
                      <p className="text-[9px] text-text-muted
                                   uppercase tracking-wide mb-1">
                        IPFS CID
                      </p>
                      <p className="text-[10px] text-text-muted
                                   font-mono break-all">
                        {(doc.satbara_cid
                          || doc.other_docs_cid
                        )?.slice(0, 30)}...
                      </p>
                    </div>
                  )}

                  <p className="text-[10px] text-text-muted">
                    Uploaded:{' '}
                    {new Date(doc.uploaded_at)
                      .toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
