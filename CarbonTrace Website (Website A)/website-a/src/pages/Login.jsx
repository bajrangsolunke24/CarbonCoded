import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Leaf, Shield } from 'lucide-react';
import api from '../utils/api';

function redirectAfterLogin(role) {
  if (role === 'GOVERNMENT') return '/gov/dashboard';
  if (role === 'PANCHAYAT') return '/panchayat/dashboard';
  if (role === 'NGO') return '/ngo/dashboard';
  return '/gov/dashboard';
}

const demoCredentials = [
  { role: 'Government', email: 'rajesh@gov.in', pass: 'admin123' },
  { role: 'Panchayat', email: 'ratnagiri@panch.in', pass: 'panch123' },
  { role: 'NGO', email: 'coastal@ngo.in', pass: 'ngo123' },
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/gov/auth/login', { email, password }, { timeout: 12000 });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      navigate(redirectAfterLogin(data.user.role));
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Authentication request timed out. Please check backend/DB and try again.');
      } else if (!err.response) {
        setError('Unable to reach server. Please ensure backend is running on port 5001.');
      } else {
        setError(err.response?.data?.message || err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf7] px-6 py-6 text-[#163b2b]">
      <div className="mx-auto mb-4 h-1 max-w-7xl rounded-full bg-[linear-gradient(90deg,#ff9933_0%,#ff9933_33%,#ffffff_33%,#ffffff_66%,#138808_66%,#138808_100%)]" />
      <div className="mx-auto max-w-7xl rounded-[28px] border border-[#d9e3dc] bg-white shadow-[0_16px_40px_rgba(22,95,56,0.06)]">
        <div className="flex items-center justify-between border-b border-[#d9e3dc] px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#165f38]/15 bg-[#165f38]/5">
              <Leaf size={22} className="text-[#165f38]" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-[#163b2b]">CarbonTrace Portal</p>
              <p className="text-xs text-[#6a7b75]">Government Carbon Registry</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="text-sm font-medium text-[#62758f] hover:text-[#163b2b]">
            Back to Home
          </button>
        </div>

        <div className="grid lg:grid-cols-[0.92fr_1.08fr]">
          <section className="bg-[linear-gradient(160deg,#145a36_0%,#1c6b43_100%)] px-8 py-10 text-white lg:rounded-l-[28px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2">
              <Shield size={15} />
              <span className="text-sm font-semibold">Authorized Government Access</span>
            </div>

            <h1 className="mt-8 max-w-md text-5xl font-semibold leading-[1.02] tracking-[-0.05em]">
              Government access for the CarbonTrace operations workspace.
            </h1>

            <p className="mt-5 max-w-md text-base leading-8 text-white/78">
              Use your assigned credentials to access review queues, monitoring workflows, and registry actions across the national carbon program.
            </p>

            <div className="mt-10 space-y-3">
              {demoCredentials.map((cred, index) => (
                <button
                  key={cred.role}
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword(cred.pass);
                  }}
                  className={`flex w-full items-center justify-between rounded-[22px] border px-4 py-4 text-left ${
                    index === 0 ? 'border-[#d2ab3f]/35 bg-[#d2ab3f]/12' : 'border-white/12 bg-white/5'
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#dbe6dc]">{cred.role}</p>
                    <p className="mt-1 text-sm text-white">{cred.email}</p>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">Autofill</span>
                </button>
              ))}
            </div>
          </section>

          <section className="px-8 py-10">
            <p className="text-sm font-medium text-[#62758f]">Secure Sign In</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#163b2b]">
              Continue with your assigned role credentials
            </h2>

            <form onSubmit={handleSubmit} className="mt-10 space-y-7">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#62758f]">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-[22px] border border-[#d9e3dc] bg-[#f8faf7] px-4 py-4 text-sm text-[#163b2b] outline-none transition-colors focus:border-[#145a36]"
                  placeholder="you@gov.in"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#62758f]">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-[22px] border border-[#d9e3dc] bg-[#f8faf7] px-4 py-4 text-sm text-[#163b2b] outline-none transition-colors focus:border-[#145a36]"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <p className="flex items-center gap-2 rounded-2xl border border-[#f2cccc] bg-[#fff4f1] px-4 py-3 text-sm text-[#c45437]">
                  <AlertTriangle size={14} />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#145a36] px-5 py-4 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(20,90,54,0.14)] disabled:opacity-60"
              >
                {loading ? 'Signing In...' : 'Continue to Portal'}
                <ArrowRight size={16} />
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
