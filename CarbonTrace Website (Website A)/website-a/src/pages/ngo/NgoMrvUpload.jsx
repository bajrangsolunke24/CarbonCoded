import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Upload } from 'lucide-react';
import api from '../../utils/api';

export default function NgoMrvUpload() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [lands, setLands] = useState([]);

  const [form, setForm] = useState({
    land_id: params.get('land') || '',
    monitoring_date: new Date().toISOString().split('T')[0],
    species_count: '',
    survival_rate: 75,
    growth_height_cm: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    api.get('/gov/lands').then(r => setLands(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/gov/mrv/submit', {
        land_id: form.land_id,
        monitoring_date: form.monitoring_date,
        species_count: parseInt(form.species_count) || 0,
        survival_rate: parseFloat(form.survival_rate),
        notes: form.notes,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-lg mx-auto mt-10">
        <div className="gov-card text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} className="text-emerald-400" />
          </div>
          <h2 className="font-heading text-lg font-bold text-text-primary">MRV Data Uploaded!</h2>
          <p className="text-sm text-text-secondary">Data submitted for land <strong className="text-emerald-400">{form.land_id}</strong>.</p>
          <p className="text-xs text-text-muted">Government will review NDVI data within 48 hours.</p>
          <div className="flex gap-3 justify-center pt-2">
            <button onClick={() => navigate('/ngo/lands')}
              className="px-4 py-2 text-sm text-gov-navy bg-emerald-400 hover:bg-emerald-300 transition-colors font-medium">
              Back to My Lands
            </button>
            <button onClick={() => { setSuccess(false); setForm(f => ({ ...f, species_count: '', notes: '', growth_height_cm: '' })); }}
              className="px-4 py-2 text-sm text-text-secondary border border-gov-border hover:text-text-primary transition-colors">
              Upload Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-heading text-xl font-bold text-text-primary">MRV Data Upload</h1>
        <p className="text-sm text-text-secondary mt-0.5">Submit field monitoring data for your assigned land</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-2.5 text-sm text-red-400">
          <AlertTriangle size={14} /><span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="gov-card space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="gov-label">Land ID *</label>
            <select className="gov-input" required value={form.land_id} onChange={e => set('land_id', e.target.value)}>
              <option value="">Select land...</option>
              {lands.map(l => (
                <option key={l.id} value={l.land_id_gov}>{l.land_id_gov}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="gov-label">Monitoring Date *</label>
            <input className="gov-input" type="date" required value={form.monitoring_date}
              onChange={e => set('monitoring_date', e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="gov-label">Species Count</label>
            <input className="gov-input" type="number" min="0" value={form.species_count}
              onChange={e => set('species_count', e.target.value)} placeholder="Number of trees surveyed" />
          </div>
          <div>
            <label className="gov-label">Growth Height (cm)</label>
            <input className="gov-input" type="number" min="0" value={form.growth_height_cm}
              onChange={e => set('growth_height_cm', e.target.value)} placeholder="Average height in cm" />
          </div>
        </div>

        <div>
          <label className="gov-label">
            Survival Rate — <span className="text-emerald-400 font-semibold">{form.survival_rate}%</span>
          </label>
          <input type="range" min="0" max="100" step="1" className="w-full accent-emerald-400 mt-2"
            value={form.survival_rate} onChange={e => set('survival_rate', e.target.value)} />
          <div className="flex justify-between text-[10px] text-text-muted mt-1">
            <span>0% — No survival</span><span>100% — Full survival</span>
          </div>
        </div>

        <div>
          <label className="gov-label">Notes / Observations</label>
          <textarea className="gov-input min-h-[80px] resize-y" value={form.notes}
            onChange={e => set('notes', e.target.value)}
            placeholder="Any field observations, health issues, or notable conditions..." />
        </div>

        <div className="border border-dashed border-gov-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Upload size={14} className="text-text-muted" />
            <p className="text-xs text-text-muted">Upload Photos (max 5, JPG/PNG)</p>
          </div>
          <input type="file" accept="image/*" multiple className="text-xs text-text-secondary" />
        </div>

        <div className="border border-dashed border-gov-border p-4">
          <p className="text-xs text-text-muted mb-1">Upload Field Report (Optional, PDF)</p>
          <input type="file" accept=".pdf" className="text-xs text-text-secondary" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={submitting}
            className="px-6 py-2 text-sm font-medium text-gov-navy bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {submitting ? 'Uploading...' : 'Submit MRV Data'}
          </button>
          <button type="button" onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm text-text-secondary border border-gov-border hover:text-text-primary transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
