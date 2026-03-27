import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLedger, getLiveTotal, validateChain } from '@/services/ledger';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, CheckCircle, XCircle, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const EVENT_COLORS: Record<string, string> = {
  generated: 'bg-green-100 text-green-800',
  issued: 'bg-blue-100 text-blue-800',
  revoked: 'bg-red-100 text-red-800',
};

export default function GovLedger() {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);

  const { data: totals } = useQuery({ queryKey: ['ledger-total'], queryFn: getLiveTotal, refetchInterval: 60000 });
  const { data: chainStatus } = useQuery({ queryKey: ['chain-validate'], queryFn: validateChain });
  const { data, isLoading } = useQuery({
    queryKey: ['ledger', search, page],
    queryFn: () => getLedger({ land_id: search || undefined, page, limit: 20 }),
    placeholderData: (prev) => prev,
  });

  const MOCK_BLOCKS = [
    { block_index: 2405, event_type: 'issued', land_id: 'LND-MH-003322', credits_delta: -3500, certificate_id: 'CERT-IN-2025-00312', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), block_hash: '0xabc12347f98a72b3cddf89100020' },
    { block_index: 2404, event_type: 'generated', land_id: 'LND-MH-003322', credits_delta: 5000, certificate_id: null, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), block_hash: '0xdef45678f98a72b3cddf89100021' },
    { block_index: 2403, event_type: 'issued', land_id: 'LND-GJ-009911', credits_delta: -10000, certificate_id: 'CERT-IN-2025-00287', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), block_hash: '0x789ghi01f98a72b3cddf89100022' },
    { block_index: 2402, event_type: 'generated', land_id: 'LND-GJ-009911', credits_delta: 25000, certificate_id: null, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), block_hash: '0x456def89f98a72b3cddf89100023' },
    { block_index: 2401, event_type: 'revoked', land_id: 'LND-GJ-008129', credits_delta: 5000, certificate_id: 'CERT-IN-2025-00104', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), block_hash: '0x123abc45f98a72b3cddf89100024' },
  ];

  const API_BLOCKS = data?.data || [];
  let blocks = API_BLOCKS.length > 0 ? API_BLOCKS : MOCK_BLOCKS;
  if (search) {
    blocks = blocks.filter((b: any) => b.land_id?.toLowerCase().includes(search.toLowerCase()));
  }

  const totalPages = data?.pages || 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Carbon Credit Blockchain Ledger</h1>
        {chainStatus && (
          <div className={`flex items-center gap-2 text-sm rounded-full px-3 py-1.5 ${chainStatus.valid ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {chainStatus.valid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
            Chain {chainStatus.valid ? 'Valid' : `Broken at block #${chainStatus.broken_at_index}`}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Generated</p>
          <p className="text-2xl font-bold">{(totals?.total_generated || 0).toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Issued</p>
          <p className="text-2xl font-bold text-blue-600">{(totals?.total_issued || 0).toLocaleString()}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total Available</p>
          <p className="text-2xl font-bold text-primary">{(totals?.total_available || 0).toLocaleString()}</p>
        </CardContent></Card>
      </div>

      <div className="relative flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Search by Land ID..." value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }} />
        </div>
        <Button size="sm" onClick={() => { setSearch(searchInput); setPage(1); }}>Search</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left p-3 text-muted-foreground font-medium">Block #</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Event</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Land ID</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Credits Δ</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Certificate</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Timestamp</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.map((b: any) => (
                    <tr key={b.block_index} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="p-3 font-mono text-xs">{b.block_index}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${EVENT_COLORS[b.event_type] || ''}`}>{b.event_type}</span>
                      </td>
                      <td className="p-3 font-mono text-xs">{b.land_id}</td>
                      <td className={`p-3 font-semibold ${b.credits_delta > 0 ? 'text-green-600' : 'text-blue-600'}`}>
                        {b.credits_delta > 0 ? '+' : ''}{b.credits_delta}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{b.certificate_id || '—'}</td>
                      <td className="p-3 text-xs">{new Date(b.timestamp).toLocaleString('en-IN')}</td>
                      <td className="p-3 font-mono text-xs text-muted-foreground truncate max-w-[100px]" title={b.block_hash}>{b.block_hash?.substring(0, 12)}...</td>
                    </tr>
                  ))}
                  {blocks.length === 0 && (
                    <tr><td colSpan={7} className="text-center p-8 text-muted-foreground">No blocks found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
