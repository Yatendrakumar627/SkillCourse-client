import { Badge } from '@mantine/core';
import { STATUS_COLORS, STATUS_LABELS } from '../../constants/statusColors';

export default function StatusBadge({ status, color = null, label = null, size = 'xs', ...props }) {
  const normalized = (status || '').toLowerCase();
  const resolvedColor = color || STATUS_COLORS[normalized] || 'gray';
  const resolvedLabel = label || (STATUS_LABELS[normalized] ?? String(status).toUpperCase());

  return (
    <Badge color={resolvedColor} size={size} {...props}>
      {resolvedLabel}
    </Badge>
  );
}