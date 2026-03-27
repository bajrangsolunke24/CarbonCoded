import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import api from '../../utils/api';

function NdviBadge({ records }) {
  if (!records || records.length === 0) return <span className="text-text-muted text-xs">No data</span>;
  const latest = records[records.length - 1];
  const v = parseFloat(latest.ndvi_value || 0);
  if (v >= 0.6) return <span className="gov-badge bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">Healthy ({v.toFixed(2)})</span>;
  if (v >= 0.3) return <span className="gov-badge bg-amber-500/10 text-amber-400 border border-amber-500/30">Moderate ({v.toFixed(2)})</span>;
  return <span className="gov-badge bg-red-500/10 text-red-400 border border-red-500/30">Low ({v.toFixed(2)})</span>;
}

export default function NgoLands() {
  const navigate = useNavigate();
  const [lands, setLands]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/gov/lands')
      .then(r => setLands(r.data))
      .catch(() => setLands([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-bold text-text-primary">My Lands</h1>
        <p className="text-sm text-text-secondary mt-0.5">All lands assigned to your NGO</p>
      </div>

      <div className="gov-card p-0">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Land ID</th>
              <th>Location</th>
              <th>Area (ha)</th>
              <th>NDVI</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-text-muted text-xs">Loading...</td></tr>
            ) : lands.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-8 text-text-muted text-xs">No lands assigned</td></tr>
            ) : (
              lands.map(land => (
                <tr key={land.id}>
                  <td className="font-mono text-xs text-emerald-400">{land.land_id_gov}</td>
                  <td className="text-xs text-text-secondary max-w-xs truncate">{land.landRequest?.location_description || '—'}</td>
                  <td>{land.landRequest?.area_hectares || '—'}</td>
                  <td><NdviBadge records={land.ndviRecords} /></td>
                  <td>
                    <span className={`gov-badge border text-xs ${
                      land.status === 'ACTIVE'   ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      land.status === 'VERIFIED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                      'bg-gov-border/20 text-text-muted border-gov-border'
                    }`}>{land.status}</span>
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/ngo/mrv?land=${land.land_id_gov}`)}
                      className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Upload size={11} /> Upload MRV
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
