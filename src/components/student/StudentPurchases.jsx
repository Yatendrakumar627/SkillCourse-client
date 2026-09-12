import { Card, Text, Group, SimpleGrid } from '@mantine/core';
import { IconReceipt } from '@tabler/icons-react';
import EmptyState from '../ui/EmptyState';
import StatusBadge from '../ui/StatusBadge';

export default function StudentPurchases({ enrollments }) {
  if (enrollments.length === 0) {
    return (
      <EmptyState
        icon={IconReceipt}
        title="No purchase requests yet"
        description="Enroll in a course to get started — your payment requests and verification status will appear here."
      />
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      {enrollments.map((enroll) => {
        const pay = enroll.paymentId;
        const status = pay?.status || 'pending';
        return (
          <Card key={enroll._id} withBorder radius="lg" p="lg" className="card-hover">
            <Group justify="space-between" align="flex-start" gap="sm">
              <div style={{ minWidth: 0, flexGrow: 1 }}>
                <Text fw={700} lineClamp={2}>{enroll.course?.title}</Text>
                <Text size="sm" c="dimmed" mt={4}>
                  Amount: <strong>₹{pay?.amount || 0}</strong>
                </Text>
                <Text size="xs" c="dimmed" mt={2}>
                  Submitted: {new Date(enroll.createdAt).toLocaleDateString()}
                </Text>
                <Text size="xs" fw={700} tt="uppercase" style={{ fontFamily: 'monospace' }} mt={4}>
                  {pay?.transactionId || 'N/A'}
                </Text>
                {pay?.rejectionReason && (
                  <Text size="xs" color="red" mt={4}>{pay.rejectionReason}</Text>
                )}
              </div>
              <StatusBadge status={status} size="lg" />
            </Group>
          </Card>
        );
      })}
    </SimpleGrid>
  );
}