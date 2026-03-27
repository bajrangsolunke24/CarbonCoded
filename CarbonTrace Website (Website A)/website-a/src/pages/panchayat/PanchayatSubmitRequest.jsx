import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';

export default function PanchayatSubmitRequest() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [form, setForm] = useState({
    owner_name: '',
    owner_phone: '',
    area_hectares: '',
    location_description: '',
    village: user.village || '',
    taluka: user.taluka || '',
    district: user.district || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const area = parseFloat(form.area_hectares);
    if (isNaN(area) || area < 0.1 || area > 500) {
      setError('Please enter a valid area between 0.1 and 500 hectares.');
      setSubmitting(false);
      return;
    }
    try {
      const res = await api.post('/gov/panchayat/submit-request', {
        owner_name: form.owner_name.trim(),
        owner_phone: form.owner_phone?.trim() || null,
        area_hectares: area,
        location_description: form.location_description?.trim() || '',
        village: form.village?.trim() || null,
        taluka: form.taluka?.trim() || null,
        district: form.district?.trim() || null,
      });
      setSuccess(res.data.request);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message;
      setError(msg || 'Submission failed. Please try again.');
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
          <h2 className="font-heading text-lg font-bold text-text-primary">Request Submitted!</h2>
          <p className="text-2xl font-mono text-amber-400 font-bold">
            REQ-{String(success.id).padStart(4, '0')}
          </p>
          <p className="text-sm text-text-secondary">
            Government will review your request within <strong className="text-text-primary">3–5 working days</strong>.
          </p>
          <p className="text-xs text-text-muted">
            Track status at: My Land Requests
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={() => navigate('/panchayat/requests')}
              className="px-4 py-2 text-sm text-gov-navy bg-amber-400 hover:bg-amber-300 transition-colors font-medium"
            >
              Track My Requests
            </button>
            <button
              onClick={() => { setSuccess(null); setForm({ owner_name: '', owner_phone: '', area_hectares: '', location_description: '', village: user.village || '', taluka: user.taluka || '', district: user.district || '' }); }}
              className="px-4 py-2 text-sm text-text-secondary border border-gov-border hover:text-text-primary transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-heading text-xl font-bold text-text-primary">Submit Land Request</h1>
        <p className="text-sm text-text-secondary mt-0.5">Fill in all details for the land to be included in the carbon sequestration program</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-2.5 text-sm text-red-400">
          <AlertTriangle size={14} /><span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="gov-card space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="gov-label">Owner Full Name *</label>
            <input className="gov-input" required value={form.owner_name}
              onChange={e => set('owner_name', e.target.value)} placeholder="As per Aadhaar" />
          </div>
          <div>
            <label className="gov-label">Owner Phone</label>
            <input className="gov-input" value={form.owner_phone} maxLength={10}
              onChange={e => set('owner_phone', e.target.value)} placeholder="10-digit mobile" />
          </div>
        </div>

        <div>
          <label className="gov-label">Area (Hectares) *</label>
          <input className="gov-input" type="number" required min="0.1" max="500" step="0.1"
            value={form.area_hectares} onChange={e => set('area_hectares', e.target.value)} placeholder="e.g. 5.5" />
          <p className="text-[11px] text-text-muted mt-1">Min: 0.1 ha · Max: 500 ha</p>
        </div>

        <div>
          <label className="gov-label">Location Description *</label>
          <textarea className="gov-input min-h-[80px] resize-y" required
            value={form.location_description}
            onChange={e => set('location_description', e.target.value)}
            placeholder="Describe the location — e.g. coastal belt near Ratnagiri creek, GPS if available" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="gov-label">Village</label>
            <input className="gov-input bg-gov-slate/50" value={form.village}
              onChange={e => set('village', e.target.value)} placeholder="Village name" />
          </div>
          <div>
            <label className="gov-label">Taluka</label>
            <input className="gov-input bg-gov-slate/50" value={form.taluka}
              onChange={e => set('taluka', e.target.value)} placeholder="Taluka" />
          </div>
          <div>
            <label className="gov-label">District</label>
            <input className="gov-input bg-gov-slate/50" value={form.district}
              onChange={e => set('district', e.target.value)} placeholder="District" />
          </div>
        </div>

        <div className="border border-dashed border-gov-border p-4 text-center">
          <p className="text-xs text-text-muted mb-1">Satbara Document (PDF, max 5MB)</p>
          <input type="file" accept=".pdf" className="text-xs text-text-secondary" />
        </div>

        <div className="border border-dashed border-gov-border p-4 text-center">
          <p className="text-xs text-text-muted mb-1">Additional Ownership Document (Optional, PDF)</p>
          <input type="file" accept=".pdf" className="text-xs text-text-secondary" />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 text-sm font-medium text-gov-navy bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Submitting...' : 'Submit Land Request'}
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
