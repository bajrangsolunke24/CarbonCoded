import { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getLiveTotal } from '@/services/ledger';

export function CreditCounterWidget() {
  const [count, setCount] = useState(0);
  
  const { data } = useQuery({ 
    queryKey: ['public-totals'], 
    queryFn: getLiveTotal, 
    refetchInterval: 30000 
  });
  
  const target = data?.total_available || 0;

  useEffect(() => {
    if (target === 0) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="fixed bottom-6 right-6 z-50 no-print">
      <div className="bg-primary text-primary-foreground px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-pulse-green">
        <Leaf className="h-5 w-5" />
        <div>
          <p className="text-xs opacity-80">National Credits</p>
          <p className="text-lg font-bold tabular-nums">{count.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
}
