import { useEffect, useState } from 'react';
import { Modal, Text, Paper, Table, Badge, Title, Stack } from '@mantine/core';
import { getStudentActivityAPI } from '../../services/api';
import LoadingState from '../ui/LoadingState';
import ErrorState from '../ui/ErrorState';
import EmptyState from '../ui/EmptyState';

export default function StudentActivityModal({ opened, onClose, studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!opened || !studentId) return;
    setData(null);
    setError('');
    setLoading(true);
    getStudentActivityAPI(studentId)
      .then(setData)
      .catch((err) => setError(err.response?.data?.message || 'Error loading student activity'))
      .finally(() => setLoading(false));
  }, [opened, studentId]);

  const student = data?.student;
  const enrollments = data?.enrollments || [];
  const submissions = data?.submissions || [];

  return (
    <Modal opened={opened} onClose={onClose} title="Student Learning Portfolio" size="xl">
      {loading ? (
        <LoadingState label="Loading student details..." />
      ) : error ? (
        <ErrorState message={error} />
      ) : data ? (
        <Stack gap="lg">
          <Paper p="md" withBorder style={{ backgroundColor: 'var(--lms-surface-subtle)' }}>
            <Title order={3} size="h4">{student?.name}</Title>
            <Text size="sm" c="dimmed">Email: {student?.email}</Text>
            <Text size="sm" c="dimmed">Phone: {student?.phone || 'N/A'}</Text>
            <Text size="sm" c="dimmed" mt="xs">
              Status:{' '}
              <Badge color={student?.status === 'active' ? 'green' : 'gray'}>{student?.status}</Badge>
            </Text>
          </Paper>

          <div>
            <Title order={3} size="h4" mb="xs">Enrolled Courses &amp; Payments</Title>
            {enrollments.length > 0 ? (
              <Table striped mb="sm">
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Course</Table.Th>
                    <Table.Th>Access Status</Table.Th>
                    <Table.Th>Amount Paid</Table.Th>
                    <Table.Th>Transaction ID</Table.Th>
                    <Table.Th>Payment Status</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {enrollments.map((e) => (
                    <Table.Tr key={e._id}>
                      <Table.Td fw={500}>{e.course?.title}</Table.Td>
                      <Table.Td>
                        <Badge color={e.accessGranted ? 'green' : 'yellow'}>
                          {e.accessGranted ? 'GRANTED' : 'PENDING'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>₹{e.paymentId?.amount || 0}</Table.Td>
                      <Table.Td>
                        <Text size="xs" fw={700} style={{ fontFamily: 'monospace' }}>
                          {e.paymentId?.transactionId || 'N/A'}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          color={
                            e.paymentId?.status === 'approved'
                              ? 'green'
                              : e.paymentId?.status === 'pending'
                                ? 'yellow'
                                : 'red'
                          }
                        >
                          {e.paymentId?.status?.toUpperCase()}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <EmptyState title="No enrollments found." />
            )}
          </div>

          <div>
            <Title order={3} size="h4" mb="xs">Assignment Submissions</Title>
            {submissions.length > 0 ? (
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Assignment</Table.Th>
                    <Table.Th>Submission Text</Table.Th>
                    <Table.Th>Grade</Table.Th>
                    <Table.Th>Teacher Feedback</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {submissions.map((s) => (
                    <Table.Tr key={s._id}>
                      <Table.Td fw={500}>{s.assignment?.title}</Table.Td>
                      <Table.Td>{s.submissionText || 'Attached File Only'}</Table.Td>
                      <Table.Td>
                        <Badge color={s.grade ? 'green' : 'gray'}>{s.grade || 'UNGRADED'}</Badge>
                      </Table.Td>
                      <Table.Td>{s.feedback || '-'}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <EmptyState title="No assignments submitted yet." />
            )}
          </div>
        </Stack>
      ) : null}
    </Modal>
  );
}