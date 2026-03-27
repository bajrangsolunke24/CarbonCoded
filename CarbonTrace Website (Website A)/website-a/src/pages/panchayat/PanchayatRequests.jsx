import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Clock, XCircle } from 'lucide-react';
import api from '../../utils/api';

const FILTERS = ['All', 'PENDING', 'APPROVED', 'REJECTED'];

const STATUS_META = {
  APPROVED: { label: 'Approved', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', icon: CheckCircle2 },
  PENDING:  { label: 'Pending',  cls: 'bg-amber-500/10  text-amber-400  border-amber-500/30',  icon: Clock          },
  REJECTED: { label: 'Rejected', cls: 'bg-red-500/10    text-red-400    border-red-500/30',    icon: XCircle        },
};

const TIMELINE_STEPS = [
  { key: 'submitted',  label: 'Submitted'           },
  { key: 'review',     label: 'Under Review'         },
  { key: 'documents',  label: 'Documents Requested'  },
  { key: 'decision',   label: 'Final Decision'        },
];

function stepDone(req, key) {
  if (key === 'submitted') return true;
  if (key === 'review')    return req.status !== 'PENDING' || true; // always in review if submitted
  if (key === 'documents') return req.status === 'APPROVED' || req.status === 'REJECTED';
  if (key === 'decision')  return req.status === 'APPROVED' || req.status === 'REJECTED';
  return false;
}

export default function PanchayatRequests() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [requests, setRequests]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('All');
  const [expanded, setExpanded]   = useState(null);

  useEffect(() => {
    api.get('/gov/panchayat/land-requests')
      .then(r => setRequests(r.data || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const visible = filter === 'All' ? requests : requests.filter(r => r.status === filter);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-bold text-text-primary">My Land Requests</h1>
        <p className="text-sm text-text-secondary mt-0.5">All submissions from your panchayat</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium transition-colors border ${
              filter === f
                ? 'bg-amber-400 text-gov-navy border-amber-400'
                : 'bg-gov-surface text-text-secondary border-gov-border hover:text-text-primary'
            }`}
          >
            {f === 'All' ? 'All' : STATUS_META[f]?.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="gov-card p-0">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Request #</th>
              <th>Owner Name</th>
              <th>Area (ha)</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Action</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-8 text-text-muted text-xs">Loading...</td></tr>
            ) : visible.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8 text-text-muted text-xs">No requests found</td></tr>
            ) : (
              visible.map(req => {
                const s = STATUS_META[req.status] || STATUS_META.PENDING;
                const Icon = s.icon;
                const isOpen = expanded === req.id;
                return (
                  <React.Fragment key={req.id}>
                    <tr className={isOpen ? 'bg-gov-slate/30' : ''}>
                      <td className="font-mono text-xs text-amber-400">REQ-{String(req.id).padStart(4, '0')}</td>
                      <td>{req.owner_name}</td>
                      <td>{req.area_hectares}</td>
                      <td>
                        <span className={`gov-badge ${s.cls} border flex items-center gap-1 w-fit`}>
                          <Icon size={9} />{s.label}
                        </span>
                      </td>
                      <td className="text-text-muted text-xs">{new Date(req.created_at).toLocaleDateString('en-IN')}</td>
                      <td>
                        {req.status === 'APPROVED' && req.registeredLand?.land_id_gov && (
                          <span className="font-mono text-xs text-emerald-400">{req.registeredLand.land_id_gov}</span>
                        )}
                        {req.status === 'PENDING' && (
                          <span className="text-xs text-text-muted">Under Review</span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="text-xs text-red-400">See Timeline →</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => setExpanded(isOpen ? null : req.id)}
                          className="text-text-muted hover:text-text-primary transition-colors"
                        >
                          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-gov-slate/20">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="flex items-center gap-0">
                            {TIMELINE_STEPS.map((step, idx) => {
                              const done = stepDone(req, step.key);
                              return (
                                <div key={step.key} className="flex items-center">
                                  <div className="flex flex-col items-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      done ? 'bg-amber-400 text-gov-navy' : 'bg-gov-border text-text-muted'
                                    }`}>
                                      {done ? '✓' : idx + 1}
                                    </div>
                                    <p className="text-[10px] text-text-muted mt-1 text-center w-24">{step.label}</p>
                                  </div>
                                  {idx < TIMELINE_STEPS.length - 1 && (
                                    <div className={`h-px w-16 mb-4 ${done ? 'bg-amber-400' : 'bg-gov-border'}`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-text-muted mt-3">
                            Location: {req.location_description || '—'}
                          </p>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
