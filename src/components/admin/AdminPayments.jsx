import { useMemo, useState } from 'react';
import { Table, Text, Image, Group, Button, TextInput, Select, SimpleGrid } from '@mantine/core';
import { IconCheck, IconX, IconSearch } from '@tabler/icons-react';
import { getUploadUrl } from '../../services/api';
import TablePanel from '../ui/TablePanel';
import EmptyState from '../ui/EmptyState';
import StatusBadge from '../ui/StatusBadge';

export default function AdminPayments({ payments, onApprove, onReject }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const counts = useMemo(() => {
    const result = { all: payments.length, pending: 0, approved: 0, rejected: 0 };
    payments.forEach((p) => {
      if (result[p.status] !== undefined) result[p.status] += 1;
    });
    return result;
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (p.user?.name || '').toLowerCase().includes(q) ||
        (p.user?.email || '').toLowerCase().includes(q) ||
        (p.course?.title || '').toLowerCase().includes(q) ||
        (p.transactionId || '').toLowerCase().includes(q)
      );
    });
  }, [payments, search, statusFilter]);

  return (
    <TablePanel
      title="Transactions &amp; Verification Logs"
      subtitle="Review receipts, UTR references, and approve or reject manual payments"
      count={filteredPayments.length}
    >
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mb="md">
        <TextInput
          placeholder="Search student, email, course, or UTR..."
          leftSection={<IconSearch size={15} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />
        <Select
          value={statusFilter}
          onChange={(val) => setStatusFilter(val || 'all')}
          data={[
            { value: 'all', label: `All Transactions (${counts.all})` },
            { value: 'pending', label: `Pending Review (${counts.pending})` },
            { value: 'approved', label: `Approved (${counts.approved})` },
            { value: 'rejected', label: `Rejected (${counts.rejected})` },
          ]}
        />
      </SimpleGrid>

      {filteredPayments.length > 0 ? (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Student</Table.Th>
              <Table.Th>Course</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Transaction ID (UTR)</Table.Th>
              <Table.Th>Screenshot</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredPayments.map((p) => (
              <Table.Tr key={p._id}>
                <Table.Td>
                  <Text fw={500}>{p.user?.name || 'Unknown'}</Text>
                  <Text size="xs" c="dimmed">{p.user?.email || ''}</Text>
                </Table.Td>
                <Table.Td>{p.course?.title || 'Course Deleted'}</Table.Td>
                <Table.Td className="tabular-nums">₹{p.amount}</Table.Td>
                <Table.Td>
                  <Text size="xs" fw={700} className="tabular-nums" style={{ fontFamily: 'monospace' }}>
                    {p.transactionId || 'N/A'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <a href={getUploadUrl(p.screenshotUrl)} target="_blank" rel="noreferrer">
                    <Image
                      src={getUploadUrl(p.screenshotUrl)}
                      height={40}
                      width={60}
                      radius="xs"
                      fallbackSrc="https://placehold.co/60x40"
                    />
                  </a>
                </Table.Td>
                <Table.Td>
                  <StatusBadge status={p.status} />
                  {p.status === 'rejected' && p.rejectionReason && (
                    <Text size="xs" c="red" mt={4} maw={200} lineClamp={2}>
                      {p.rejectionReason}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  {p.status === 'pending' ? (
                    <Group gap="xs" wrap="nowrap">
                      <Button size="xs" color="green" leftSection={<IconCheck size={12} />} onClick={() => onApprove?.(p._id)}>
                        Approve
                      </Button>
                      <Button size="xs" color="red" leftSection={<IconX size={12} />} onClick={() => onReject?.(p)}>
                        Reject
                      </Button>
                    </Group>
                  ) : p.status === 'rejected' ? (
                    <Button size="xs" variant="light" color="green" leftSection={<IconCheck size={12} />} onClick={() => onApprove?.(p._id)}>
                      Re-Approve
                    </Button>
                  ) : (
                    <Text size="xs" c="dimmed">Verified</Text>
                  )}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <EmptyState
          title={payments.length === 0 ? 'No payment transactions recorded yet.' : 'No matching transactions found.'}
          description={payments.length > 0 ? 'Try clearing your search or changing the status filter.' : undefined}
        />
      )}
    </TablePanel>
  );
}