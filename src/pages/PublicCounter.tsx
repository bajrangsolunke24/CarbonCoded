import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLiveTotal, getPublicStats } from '@/services/ledger';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, RefreshCw, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['hsl(150,55%,23%)', 'hsl(155,45%,30%)', 'hsl(160,40%,35%)', 'hsl(43,55%,54%)', 'hsl(38,50%,45%)', 'hsl(217,91%,60%)', 'hsl(200,60%,50%)', 'hsl(180,40%,40%)', 'hsl(140,30%,45%)', 'hsl(120,25%,40%)'];

export default function PublicCounter() {
  const [count, setCount] = useState(0);

  const { data: totalsData, isLoading: totalsLoading, dataUpdatedAt } = useQuery({ queryKey: ['public-totals'], queryFn: getLiveTotal, refetchInterval: 30000 });
  const { data: statsData, isLoading: statsLoading } = useQuery({ queryKey: ['public-stats'], queryFn: getPublicStats, refetchInterval: 300000 });

  const target = totalsData?.total_available || 0;
  const creditsByState = statsData?.creditsByState || [];
  const topParcels = statsData?.topParcels || [];

  useEffect(() => {
    if (target === 0) return;
    const steps = 60;
    const inc = target / steps;
    let c = 0;
    const t = setInterval(() => {
      c += inc;
      if (c >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(c));
    }, 30);
    return () => clearInterval(t);
  }, [target]);

  const lastUpdatedText = dataUpdatedAt ? `Updated ${Math.floor((Date.now() - dataUpdatedAt) / 60000)} mins ago` : 'Updating...';

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">National Carbon Credits</span>
          </div>
          <Button variant="ghost" size="sm"><Share2 className="h-4 w-4 mr-2" /> Share</Button>
        </div>
      </nav>

      <section className="gradient-hero text-primary-foreground py-20 text-center">
        {totalsLoading ? (
          <div className="flex flex-col items-center justify-center opacity-80 h-32 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin" /><p>Connecting to Ledger...</p>
          </div>
        ) : (
          <>
            <p className="text-sm font-medium opacity-80 mb-4">Total Carbon Credits Available Nationally</p>
            <p className="text-6xl md:text-8xl font-extrabold tabular-nums animate-countUp">{count.toLocaleString('en-IN')}</p>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm opacity-70">
              <RefreshCw className="h-4 w-4" /><span>{lastUpdatedText}</span>
            </div>
          </>
        )}
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
        {statsLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            {creditsByState.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Credits Available by State</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie data={creditsByState} dataKey="credits" nameKey="state" cx="50%" cy="50%" outerRadius={120} label={({ state, percent }) => `${state} (${(percent * 100).toFixed(0)}%)`} labelLine={true}>
                        {creditsByState.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(v: number) => v.toLocaleString()} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {topParcels.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Top Land Parcels by Available Credits</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-secondary/50">
                          <th className="text-left p-3 text-muted-foreground font-medium">#</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Land ID</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Location</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Type</th>
                          <th className="text-left p-3 text-muted-foreground font-medium">Available Credits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topParcels.map((p: any, i: number) => (
                          <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                            <td className="p-3 font-bold text-muted-foreground">{i + 1}</td>
                            <td className="p-3 font-mono text-xs">{p.id}</td>
                            <td className="p-3">{p.district}, {p.state}</td>
                            <td className="p-3 capitalize">{p.landType}</td>
                            <td className="p-3 font-bold text-primary">{p.availableCredits.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
