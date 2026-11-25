import { Table, Text, Group, Button, Image } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { getUploadUrl } from '../../services/api';

export default function PaymentApprovalTable({ payments, onApprove, onReject }) {
  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Student</Table.Th>
          <Table.Th>Course</Table.Th>
          <Table.Th>Amount</Table.Th>
          <Table.Th>Transaction ID (UTR)</Table.Th>
          <Table.Th>Screenshot</Table.Th>
          <Table.Th>Actions</Table.Th>
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
              <Group gap="xs" wrap="nowrap">
                <Button size="xs" color="green" leftSection={<IconCheck size={12} />} onClick={() => onApprove(p._id)}>
                  Approve
                </Button>
                <Button size="xs" color="red" leftSection={<IconX size={12} />} onClick={() => onReject(p)}>
                  Reject
                </Button>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}