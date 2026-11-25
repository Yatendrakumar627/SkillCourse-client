import { Table, Text, Image } from '@mantine/core';
import { getUploadUrl } from '../../services/api';
import TablePanel from '../ui/TablePanel';
import EmptyState from '../ui/EmptyState';
import StatusBadge from '../ui/StatusBadge';

export default function AdminPayments({ payments }) {
  return (
    <TablePanel
      title="Transactions &amp; Verification Logs"
      subtitle="All payment records submitted by students"
      count={payments.length}
    >
      {payments.length > 0 ? (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Student</Table.Th>
              <Table.Th>Course</Table.Th>
              <Table.Th>Amount</Table.Th>
              <Table.Th>Transaction ID</Table.Th>
              <Table.Th>Screenshot</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {payments.map((p) => (
              <Table.Tr key={p._id}>
                <Table.Td>
                  <Text fw={500}>{p.user?.name || 'Unknown'}</Text>
                  <Text size="xs" c="dimmed">{p.user?.email || ''}</Text>
                </Table.Td>
                <Table.Td>{p.course?.title || 'Course Deleted'}</Table.Td>
                <Table.Td>₹{p.amount}</Table.Td>
                <Table.Td>
                  <Text size="xs" fw={700} style={{ fontFamily: 'monospace' }}>
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
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <EmptyState title="No payment transactions recorded yet." />
      )}
    </TablePanel>
  );
}