import { Badge } from '@/components/ui/badge';
import type { RequestStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  RequestStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Pending',
    className: 'status-pending',
  },
  accepted: {
    label: 'Accepted',
    className: 'status-accepted',
  },
  in_progress: {
    label: 'In Progress',
    className: 'status-in-progress',
  },
  completed: {
    label: 'Completed',
    className: 'status-completed',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'status-cancelled',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge className={cn(config.className, 'font-medium', className)}>
      {config.label}
    </Badge>
  );
}
