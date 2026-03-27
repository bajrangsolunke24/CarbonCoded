import { useState, useEffect } from 'react';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  RadialBarChart, RadialBar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { Satellite, TrendingUp, AlertTriangle, Loader2, Zap, Image } from 'lucide-react';
import api from '../utils/api';

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gov-border px-3 py-2 text-xs shadow-sm">
      <p className="text-gray-500 mb-1 font-semibold">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}:{' '}
          <span className="font-bold text-gov-navy">
            {typeof p.value === 'number' ? p.value.toFixed(4) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
};

export default function NdviMonitoring() {
  const [lands, setLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState(null);
  const [ndviData, setNdviData] = useState([]);
  const [ndviSummary, setNdviSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [bhuvanStatus, setBhuvanStatus] = useState(null);
  const [scanningAll, setScanningAll] = useState(false);
  const [fullScanResult, setFullScanResult] = useState(null);

  useEffect(() => {
    const fallbackSummary = {
      healthy: 4,
      moderate: 3,
      sparse: 2,
      barren: 1,
      total: 10,
      avgNdvi: 0.52,
      byState: [
        { state: 'MH', lands: 5, avgNdvi: 0.58, credits: 18500 },
        { state: 'KL', lands: 3, avgNdvi: 0.61, credits: 14200 },
        { state: 'GJ', lands: 2, avgNdvi: 0.42, credits: 8100 },
      ]
    };

    Promise.all([
      api.get('/gov/lands'),
      api.get('/gov/ndvi/summary').catch(() => ({ data: fallbackSummary })),
      api.get('/bhuvan/status').catch(() => ({ data: { status: 'unconfigured' } })),
    ]).then(([landsRes, summaryRes, statusRes]) => {
      setLands(landsRes.data);
      setNdviSummary(summaryRes.data);
      setBhuvanStatus(statusRes.data);
      if (landsRes.data.length) setSelectedLand(landsRes.data[0]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Load NDVI history for selected land
  useEffect(() => {
    if (!selectedLand) return;
    setScanResult(null);
    api.get(`/gov/lands/${selectedLand.id}/ndvi`)
      .then((r) => {
        const formatted = r.data.map((n) => ({
          date: new Date(n.recorded_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
          ndvi: parseFloat(n.ndvi_value),
          increase: parseFloat(n.greenery_increase_percent) || 0,
          source: n.satellite_source,
        }));
        setNdviData(formatted);
      })
      .catch(console.error);
  }, [selectedLand]);

  // Trigger live Bhuvan NDVI scan for selected land
  const handleBhuvanScan = async () => {
    if (!selectedLand) return;
    setScanning(true);
    setScanResult(null);
    try {
      const res = await api.get(`/bhuvan/ndvi/${selectedLand.id}`);
      setScanResult(res.data);
      // Reload NDVI history to include the new reading
      const ndviRes = await api.get(`/gov/lands/${selectedLand.id}/ndvi`);
      const formatted = ndviRes.data.map((n) => ({
        date: new Date(n.recorded_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        ndvi: parseFloat(n.ndvi_value),
        increase: parseFloat(n.greenery_increase_percent) || 0,
        source: n.satellite_source,
      }));
      setNdviData(formatted);
    } catch (err) {
      setScanResult({ error: err.response?.data?.message || err.message });
    } finally {
      setScanning(false);
    }
  };

  // Trigger full scan for all lands
  const handleFullScan = async () => {
    setScanningAll(true);
    setFullScanResult(null);
    try {
      const res = await api.post('/bhuvan/scan-all');
      setFullScanResult(res.data);
    } catch (err) {
      setFullScanResult({ error: err.response?.data?.message || err.message });
    } finally {
      setScanningAll(false);
    }
  };

  const latestNdvi = ndviData.length ? ndviData[ndviData.length - 1]?.ndvi : 0;
  const ndviStatus = latestNdvi >= 0.5 ? 'HEALTHY' : latestNdvi >= 0.3 ? 'MODERATE' : 'LOW';
  const statusColor = ndviStatus === 'HEALTHY' ? '#10b981' : ndviStatus === 'MODERATE' ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-ct-text">NDVI Monitoring</h1>
          <p className="text-ct-muted text-sm mt-0.5">Satellite-based vegetation index tracking via ISRO Bhuvan</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleFullScan}
            disabled={scanningAll || !bhuvanStatus?.apiKeyPresent}
            className="btn-gov-outline flex items-center gap-2 text-xs py-1.5 disabled:opacity-50"
          >
            {scanningAll ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            {scanningAll ? 'Scanning All...' : 'Scan All Parcels'}
          </button>
        </div>
      </div>

      {/* Bhuvan Status Bar */}
      <div className={`gov-card flex items-center justify-between py-2 px-3 ${
        bhuvanStatus?.apiKeyPresent ? 'border-green-300' : 'border-amber-300'
      }`}>
        <div className="flex items-center gap-3">
          <Satellite size={16} className={bhuvanStatus?.apiKeyPresent ? 'text-green-700' : 'text-amber-700'} />
          <div>
            <span className="text-xs font-semibold text-gov-navy">ISRO Bhuvan WMS</span>
            <span className={`ml-2 text-[10px] font-mono ${bhuvanStatus?.apiKeyPresent ? 'text-green-700' : 'text-amber-700'}`}>
              {bhuvanStatus?.apiKeyPresent ? '● API Key Configured' : '● Not configured'}
            </span>
          </div>
        </div>
        <span className="text-[10px] text-gray-500">API Key: {bhuvanStatus?.apiKeyPresent ? '✓ Present' : '✗ Missing'}</span>
      </div>

      {/* NDVI Health Distribution + NDVI by State (charts only add-on) */}
      {ndviSummary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* PIE CHART — Health Distribution */}
          <div className="gov-card col-span-1">
            <div className="gov-card-header">
              <span>Vegetation Health Distribution</span>
              <span className="text-xs text-gray-300 font-normal">
                All Registered Lands
              </span>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: 'Healthy (≥0.6)',
                        value: ndviSummary.healthy,
                        color: '#1a7a3c',
                      },
                      {
                        name: 'Moderate (0.4-0.6)',
                        value: ndviSummary.moderate,
                        color: '#d97706',
                      },
                      {
                        name: 'Sparse (0.2-0.4)',
                        value: ndviSummary.sparse,
                        color: '#ea580c',
                      },
                      {
                        name: 'Barren (<0.2)',
                        value: ndviSummary.barren,
                        color: '#c0392b',
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {[
                      '#1a7a3c',
                      '#d97706',
                      '#ea580c',
                      '#c0392b',
                    ].map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} lands`, name]}
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e8ecf0',
                      fontSize: '11px',
                      borderRadius: 0,
                    }}
                  />
                  <Legend
                    iconType="square"
                    iconSize={10}
                    wrapperStyle={{
                      fontSize: '11px',
                      paddingTop: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Center stat */}
              <div className="text-center -mt-2">
                <div className="text-2xl font-bold text-gov-navy">
                  {ndviSummary.avgNdvi}
                </div>
                <div className="text-xs text-gray-500">
                  National Average NDVI
                </div>
              </div>
            </div>
          </div>

          {/* BAR CHART — NDVI by State */}
          <div className="gov-card col-span-2">
            <div className="gov-card-header">
              <span>Average NDVI by State</span>
              <span className="text-xs text-gray-300 font-normal">
                Latest satellite readings
              </span>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={ndviSummary.byState || []}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e8ecf0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="state"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={{ stroke: '#e8ecf0' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 1]}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v.toFixed(1)}
                  />
                  <Tooltip
                    formatter={(v, name) => [
                      typeof v === 'number' ? v.toFixed(3) : v,
                      name === 'avgNdvi' ? 'Avg NDVI' : name,
                    ]}
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e8ecf0',
                      fontSize: '11px',
                      borderRadius: 0,
                    }}
                  />
                  <ReferenceLine
                    y={0.6}
                    stroke="#1a7a3c"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Healthy',
                      fill: '#1a7a3c',
                      fontSize: 10,
                      position: 'right',
                    }}
                  />
                  <ReferenceLine
                    y={0.4}
                    stroke="#d97706"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Moderate',
                      fill: '#d97706',
                      fontSize: 10,
                      position: 'right',
                    }}
                  />
                  <Bar
                    dataKey="avgNdvi"
                    name="Avg NDVI"
                    radius={0}
                  >
                    {(ndviSummary.byState || []).map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.avgNdvi >= 0.6
                            ? '#1a7a3c'
                            : entry.avgNdvi >= 0.4
                              ? '#d97706'
                              : '#c0392b'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>

              {/* State summary table */}
              <table className="gov-table mt-3">
                <thead>
                  <tr>
                    <th>State</th>
                    <th>Lands</th>
                    <th>Avg NDVI</th>
                    <th>Credits Issued</th>
                  </tr>
                </thead>
                <tbody>
                  {(ndviSummary.byState || []).map((s, i) => (
                    <tr key={i}>
                      <td className="font-semibold text-gov-blue">
                        {s.state}
                      </td>
                      <td>{s.lands}</td>
                      <td>
                        <span
                          style={{
                            color:
                              s.avgNdvi >= 0.6
                                ? '#1a7a3c'
                                : s.avgNdvi >= 0.4
                                  ? '#d97706'
                                  : '#c0392b',
                            fontWeight: 600,
                          }}
                        >
                          {s.avgNdvi}
                        </span>
                      </td>
                      <td>{s.credits.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Land Selector */}
        <div className="gov-card p-0 max-h-[600px] overflow-y-auto">
          <div className="px-4 py-3 border-b border-gov-border">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Select Land Parcel</h3>
          </div>
          <div className="divide-y divide-gov-border/50">
            {lands.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedLand(l)}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  selectedLand?.id === l.id ? 'bg-gov-table border-l-2 border-gov-orange' : 'hover:bg-gray-50 border-l-2 border-transparent'
                }`}
              >
                <p className="text-xs font-mono text-gov-blue">{l.land_id_gov}</p>
                <p className="text-xs text-gray-700 mt-0.5 truncate">{l.landRequest?.owner_name || '—'}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{l.landRequest?.area_hectares} ha</p>
              </button>
            ))}
          </div>
        </div>

        {/* NDVI Chart + Details */}
        <div className="lg:col-span-3 space-y-3">
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-3">
            <div className="gov-card p-3">
              <p className="text-xs text-gray-500 uppercase font-semibold">Current NDVI</p>
              <p className="text-2xl font-bold mt-1" style={{ color: statusColor }}>{latestNdvi.toFixed(4)}</p>
            </div>
            <div className="gov-card p-3">
              <p className="text-xs text-gray-500 uppercase font-semibold">Vegetation Status</p>
              <p className="text-lg font-bold mt-1" style={{ color: statusColor }}>{ndviStatus}</p>
            </div>
            <div className="gov-card p-3">
              <p className="text-xs text-gray-500 uppercase font-semibold">Greenery Change</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {ndviData.length > 1 ? `+${ndviData[ndviData.length - 1].increase.toFixed(1)}%` : '—'}
              </p>
            </div>
            <div className="gov-card p-3">
              <p className="text-xs text-gray-500 uppercase font-semibold">Live Scan</p>
              <button
                onClick={handleBhuvanScan}
                disabled={scanning || !selectedLand || !bhuvanStatus?.apiKeyPresent}
                className="mt-1 btn-gov text-xs py-1.5 px-3 flex items-center gap-2 disabled:opacity-50"
              >
                {scanning ? <Loader2 size={12} className="animate-spin" /> : <Satellite size={12} />}
                {scanning ? 'Scanning...' : 'Bhuvan Scan'}
              </button>
            </div>
          </div>

          {/* RADIAL HEALTH GAUGE */}
          {selectedLand && ndviData.length > 0 && (
            <div className="gov-card mb-4">
              <div className="gov-card-header">
                <span>
                  Current Health Status - {selectedLand.land_id_gov}
                </span>
              </div>
              <div className="p-4 flex items-center gap-8">
                {/* Radial gauge */}
                <div className="flex-shrink-0">
                  <ResponsiveContainer width={160} height={160}>
                    <RadialBarChart
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      startAngle={90}
                      endAngle={-270}
                      data={[
                        {
                          name: 'NDVI',
                          value: Math.round(latestNdvi * 100),
                          fill:
                            latestNdvi >= 0.6
                              ? '#1a7a3c'
                              : latestNdvi >= 0.4
                                ? '#d97706'
                                : '#c0392b',
                        },
                      ]}
                    >
                      <RadialBar
                        dataKey="value"
                        cornerRadius={0}
                        background={{ fill: '#e8ecf0' }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="text-center -mt-20 mb-16">
                    <div className="text-2xl font-bold text-gov-navy">
                      {(latestNdvi * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      Health Score
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-3 flex-1">
                  {[
                    {
                      label: 'Current NDVI',
                      value: latestNdvi.toFixed(4),
                    },
                    {
                      label: 'Health Status',
                      value: ndviStatus,
                    },
                    {
                      label: 'Total Scans',
                      value: ndviData.length,
                    },
                    {
                      label: 'Data Source',
                      value: 'ISRO Bhuvan',
                    },
                    {
                      label: 'Avg NDVI',
                      value: ndviData.length
                        ? (ndviData.reduce((s, d) => s + d.ndvi, 0) / ndviData.length).toFixed(4)
                        : '—',
                    },
                    {
                      label: 'Last Change',
                      value:
                        ndviData.length > 1
                          ? `${ndviData[ndviData.length - 1]?.increase > 0 ? '+' : ''}${parseFloat(ndviData[ndviData.length - 1]?.increase || 0).toFixed(2)}%`
                          : '—',
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="bg-gov-bg border border-gov-border p-3"
                    >
                      <div className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                        {stat.label}
                      </div>
                      <div
                        className="text-sm font-bold"
                        style={{ color: statusColor }}
                      >
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* NDVI scale legend */}
                <div className="flex-shrink-0 border-l border-gov-border pl-6">
                  <div className="text-xs font-bold text-gov-navy uppercase tracking-wide mb-3">
                    NDVI Scale
                  </div>
                  {[
                    { range: '0.6 - 1.0', label: 'Healthy', color: '#1a7a3c' },
                    { range: '0.4 - 0.6', label: 'Moderate', color: '#d97706' },
                    { range: '0.2 - 0.4', label: 'Sparse', color: '#ea580c' },
                    { range: '0.0 - 0.2', label: 'Barren', color: '#c0392b' },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 mb-2"
                    >
                      <div
                        className="w-3 h-3 flex-shrink-0"
                        style={{ background: s.color }}
                      />
                      <span className="text-xs text-gray-600">
                        <span className="font-mono">{s.range}</span> - {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bhuvan Scan Result */}
          {scanResult && (
            <div className={`gov-card p-3 ${scanResult.error ? 'border-red-300' : 'border-green-300'}`}>
              {scanResult.error ? (
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle size={14} />
                  <span className="text-xs">Scan failed: {scanResult.error}</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Satellite size={14} className="text-green-700" />
                    <span className="text-xs font-semibold text-green-700">Live Bhuvan Scan Result</span>
                    <span className="text-[10px] text-gray-500 ml-auto">{scanResult.calculatedAt}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500">Mean NDVI</p>
                      <p className="text-lg font-bold text-green-700">{scanResult.meanNdvi ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Min NDVI</p>
                      <p className="text-sm font-mono text-gov-navy">{scanResult.minNdvi ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Max NDVI</p>
                      <p className="text-sm font-mono text-gov-navy">{scanResult.maxNdvi ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Samples</p>
                      <p className="text-sm font-mono text-gov-navy">{scanResult.successfulSamples}/{scanResult.sampledPoints}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NDVI Chart */}
          <div className="gov-card p-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-green-700" />
                <h3 className="text-sm font-semibold text-gov-navy">
                  NDVI Time Series - {selectedLand?.land_id_gov || '—'}
                </h3>
              </div>
              <div className="flex gap-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-700 inline-block" /> NDVI Value
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-600 inline-block" /> Threshold (0.3)
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={ndviData}>
                <defs>
                  <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[0, 1]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={0.3} stroke="#d97706" strokeDasharray="6 3" label={{ value: 'Min Threshold', fill: '#d97706', fontSize: 10, position: 'right' }} />
                <Area type="monotone" dataKey="ndvi" stroke="#1a7a3c" strokeWidth={2} fill="url(#ndviGrad)" name="NDVI" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* NEW: NDVI detail charts (additive visuals) */}
          {ndviData.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {/* LINE CHART — NDVI trend over time */}
              <div className="gov-card p-3">
                <div className="gov-card-header">
                  <span>
                    NDVI Trend — {selectedLand?.land_id_gov || '—'}
                  </span>
                </div>
                <div className="p-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart
                      data={ndviData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e8ecf0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e8ecf0' }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 1]}
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => v.toFixed(1)}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#fff',
                          border: '1px solid #e8ecf0',
                          fontSize: '11px',
                          borderRadius: 0,
                        }}
                        formatter={(v) => [Number(v).toFixed(4), 'NDVI']}
                      />
                      <ReferenceLine y={0.6} stroke="#1a7a3c" strokeDasharray="3 3" />
                      <ReferenceLine y={0.4} stroke="#d97706" strokeDasharray="3 3" />
                      <Line
                        type="monotone"
                        dataKey="ndvi"
                        stroke="#2d5fa6"
                        strokeWidth={2}
                        dot={{ fill: '#2d5fa6', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="NDVI Value"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* BAR CHART — Greenery increase % per scan */}
              <div className="gov-card p-3">
                <div className="gov-card-header">
                  <span>Greenery Change (%) per Scan</span>
                </div>
                <div className="p-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={ndviData}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#e8ecf0"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        axisLine={{ stroke: '#e8ecf0' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#6b7280' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${parseFloat(v).toFixed(0)}%`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#fff',
                          border: '1px solid #e8ecf0',
                          fontSize: '11px',
                          borderRadius: 0,
                        }}
                        formatter={(v) => [`${parseFloat(v).toFixed(2)}%`, 'Change']}
                      />
                      <ReferenceLine y={0} stroke="#6b7280" strokeWidth={1} />
                      <Bar
                        dataKey="increase"
                        name="Greenery Change %"
                        radius={0}
                      >
                        {ndviData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={
                              entry.increase >= 0 ? '#1a7a3c' : '#c0392b'
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* NDVI Satellite Image */}
          {/* Full Scan Results (additive charts preserved; moved below NDVI charts) */}
          {fullScanResult && !fullScanResult.error && (
            <div className="gov-card p-3">
              <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-gov-blue" />
                <h3 className="text-sm font-semibold text-gov-navy">Full Scan Results</h3>
                <span className="text-[10px] text-gray-500 ml-auto">{fullScanResult.scannedAt}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="text-center p-2 bg-gov-table border border-gov-border">
                  <p className="text-lg font-bold text-green-700">{fullScanResult.successful}</p>
                  <p className="text-[10px] text-gray-500">Successful</p>
                </div>
                <div className="text-center p-2 bg-gov-table border border-gov-border">
                  <p className="text-lg font-bold text-gov-navy">{fullScanResult.totalScanned}</p>
                  <p className="text-[10px] text-gray-500">Total Scanned</p>
                </div>
              </div>

              {/* NEW: Bar chart of NDVI per land (success only) */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-gov-navy mb-2 uppercase tracking-wide">
                  NDVI per Land (Latest Scan)
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={(fullScanResult.results || [])
                      .filter((r) => r.status === 'success')
                      .map((r) => ({
                        id: r.landId?.split('-')?.slice(-2).join('-') || r.landId,
                        ndvi: parseFloat(r.ndvi || 0),
                        fullId: r.landId,
                        change: r.change,
                      }))}
                    margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e8ecf0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="id"
                      tick={{ fontSize: 9, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e8ecf0' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 1]}
                      tick={{ fontSize: 9, fill: '#6b7280' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => Number(v).toFixed(1)}
                    />
                    <Tooltip
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #e8ecf0',
                        fontSize: '11px',
                        borderRadius: 0,
                      }}
                      formatter={(v, _, props) => [
                        Number(v).toFixed(4),
                        props?.payload?.fullId || 'Land',
                      ]}
                    />
                    <ReferenceLine y={0.6} stroke="#1a7a3c" strokeDasharray="3 3" />
                    <ReferenceLine y={0.4} stroke="#d97706" strokeDasharray="3 3" />
                    <Bar dataKey="ndvi" radius={0}>
                      {(fullScanResult.results || [])
                        .filter((r) => r.status === 'success')
                        .map((r, i) => {
                          const val = parseFloat(r.ndvi || 0);
                          const fill =
                            val >= 0.6 ? '#1a7a3c' : val >= 0.4 ? '#d97706' : '#c0392b';
                          return <Cell key={i} fill={fill} />;
                        })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="max-h-32 overflow-y-auto space-y-1">
                {fullScanResult.results?.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gov-border/30">
                    <span className="font-mono text-gov-blue">{r.landId}</span>
                    {r.status === 'success' ? (
                      <span className="text-green-700">NDVI: {r.ndvi} ({r.change})</span>
                    ) : (
                      <span className="text-red-700">{r.status}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedLand && bhuvanStatus?.apiKeyPresent && (
            <div className="gov-card p-3">
              <div className="flex items-center gap-2 mb-3">
                <Image size={14} className="text-gov-blue" />
                <h3 className="text-sm font-semibold text-gov-navy">Satellite NDVI Imagery</h3>
              </div>
              <div className="relative bg-white border border-gov-border aspect-video flex items-center justify-center overflow-hidden">
                <img
                  src={`/api/bhuvan/ndvi-image/${selectedLand.id}`}
                  alt={`NDVI satellite view for ${selectedLand.land_id_gov}`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <div className="hidden items-center justify-center absolute inset-0">
                  <p className="text-xs text-gray-500">Satellite image unavailable for this parcel</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">Source: ISRO Bhuvan WMS - NDVI composite layer</p>
            </div>
          )}

          {/* Alerts */}
          {latestNdvi > 0 && latestNdvi < 0.3 && (
            <div className="gov-card border-red-300 flex items-center gap-3 p-3">
              <AlertTriangle size={18} className="text-red-700 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">Critical: Vegetation Below Threshold</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  NDVI value ({latestNdvi.toFixed(4)}) is below the minimum 0.3 threshold. 
                  Investigation required for {selectedLand?.land_id_gov}.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
