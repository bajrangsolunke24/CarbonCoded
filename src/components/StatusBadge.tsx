import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { className: string }> = {
  Pending: { className: 'bg-status-pending/15 text-status-pending border-status-pending/30' },
  Approved: { className: 'bg-status-approved/15 text-status-approved border-status-approved/30' },
  Active: { className: 'bg-status-approved/15 text-status-approved border-status-approved/30' },
  Rejected: { className: 'bg-status-rejected/15 text-status-rejected border-status-rejected/30' },
  Expired: { className: 'bg-muted text-muted-foreground border-border' },
  'Under Review': { className: 'bg-status-review/15 text-status-review border-status-review/30' },
  'Expiring Soon': { className: 'bg-status-pending/15 text-status-pending border-status-pending/30' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || statusConfig.Pending;
  return (
    <Badge variant="outline" className={cn('font-medium text-xs border', config.className)}>
      {status}
    </Badge>
  );
}
