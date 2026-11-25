import { useCallback, useEffect, useState } from 'react';
import { Modal, Text, Paper, Table, Badge, Title, Stack, Group, Select, Button } from '@mantine/core';
import { IconDownload, IconPlus } from '@tabler/icons-react';
import {
  getStudentActivityAPI,
  grantStudentEnrollmentAPI,
  revokeStudentEnrollmentAPI,
  getUploadUrl,
} from '../../services/api';
import LoadingState from '../ui/LoadingState';
import ErrorState from '../ui/ErrorState';
import EmptyState from '../ui/EmptyState';
import { notifyError, notifySuccess } from '../../utils/toast';

export default function StudentActivityModal({ opened, onClose, studentId, courses = [], onChanged }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [grantCourseId, setGrantCourseId] = useState('');
  const [granting, setGranting] = useState(false);
  const [revokingId, setRevokingId] = useState('');

  const loadActivity = useCallback(async (showSpinner = true) => {
    if (!studentId) return;
    if (showSpinner) {
      setData(null);
      setLoading(true);
    }
    setError('');
    try {
      const res = await getStudentActivityAPI(studentId);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading student activity');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (!opened || !studentId) return;
    setGrantCourseId('');
    loadActivity(true);
  }, [opened, studentId, loadActivity]);

  const student = data?.student;
  const enrollments = data?.enrollments || [];
  const submissions = data?.submissions || [];

  const grantedCourseIds = new Set(
    enrollments.filter((e) => e.accessGranted).map((e) => String(e.course?._id || e.course))
  );
  const grantableCourses = courses.filter((c) => !grantedCourseIds.has(String(c._id)));

  const handleGrant = async () => {
    if (!grantCourseId) return;
    setGranting(true);
    try {
      await grantStudentEnrollmentAPI(studentId, grantCourseId);
      setGrantCourseId('');
      await loadActivity(false);
      onChanged?.();
      notifySuccess('Access Granted', 'Student can now access the selected course.');
    } catch (err) {
      notifyError('Grant Failed', 'Could not grant course access.', err);
    } finally {
      setGranting(false);
    }
  };

  const handleRevoke = async (courseId) => {
    setRevokingId(courseId);
    try {
      await revokeStudentEnrollmentAPI(studentId, courseId);
      await loadActivity(false);
      onChanged?.();
      notifySuccess('Access Revoked', 'Course access has been disabled for this student.');
    } catch (err) {
      notifyError('Revoke Failed', 'Could not revoke course access.', err);
    } finally {
      setRevokingId('');
    }
  };

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

          {grantableCourses.length > 0 && (
            <Group align="flex-end" wrap="wrap" gap="sm">
              <Select
                label="Grant Complimentary / Offline Course Access"
                placeholder="Select a course..."
                searchable
                nothingFoundMessage="No matching course"
                data={grantableCourses.map((c) => ({ value: c._id, label: c.title }))}
                value={grantCourseId || null}
                onChange={(val) => setGrantCourseId(val || '')}
                style={{ flex: 1, minWidth: 220 }}
              />
              <Button
                color="indigo"
                leftSection={<IconPlus size={15} />}
                disabled={!grantCourseId}
                loading={granting}
                onClick={handleGrant}
              >
                Grant Access
              </Button>
            </Group>
          )}

          <div>
            <Title order={3} size="h4" mb="xs">Enrolled Courses &amp; Payments</Title>
            {enrollments.length > 0 ? (
              <div className="table-scroll">
                <Table striped mb="sm">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Course</Table.Th>
                      <Table.Th>Access Status</Table.Th>
                      <Table.Th>Amount Paid</Table.Th>
                      <Table.Th>Transaction ID</Table.Th>
                      <Table.Th>Payment Status</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {enrollments.map((e) => {
                      const cid = String(e.course?._id || e.course || '');
                      return (
                        <Table.Tr key={e._id}>
                          <Table.Td fw={500}>{e.course?.title || 'Course Deleted'}</Table.Td>
                          <Table.Td>
                            <Badge color={e.accessGranted ? 'green' : 'yellow'}>
                              {e.accessGranted ? 'GRANTED' : 'PENDING'}
                            </Badge>
                          </Table.Td>
                          <Table.Td className="tabular-nums">
                            {e.paymentId ? `₹${e.paymentId.amount || 0}` : '₹0 (Manual)'}
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" fw={700} style={{ fontFamily: 'monospace' }}>
                              {e.paymentId?.transactionId || 'ADMIN GRANT'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            {e.paymentId ? (
                              <Badge
                                color={
                                  e.paymentId.status === 'approved'
                                    ? 'green'
                                    : e.paymentId.status === 'pending'
                                      ? 'yellow'
                                      : 'red'
                                }
                              >
                                {e.paymentId.status?.toUpperCase()}
                              </Badge>
                            ) : (
                              <Badge color="teal" variant="light">MANUAL</Badge>
                            )}
                          </Table.Td>
                          <Table.Td>
                            {e.accessGranted && cid ? (
                              <Button
                                size="xs"
                                color="red"
                                variant="light"
                                loading={revokingId === cid}
                                onClick={() => handleRevoke(cid)}
                              >
                                Revoke
                              </Button>
                            ) : (
                              <Text size="xs" c="dimmed">—</Text>
                            )}
                          </Table.Td>
                        </Table.Tr>
                      );
                    })}
                  </Table.Tbody>
                </Table>
              </div>
            ) : (
              <EmptyState title="No enrollments found." />
            )}
          </div>

          <div>
            <Title order={3} size="h4" mb="xs">Assignment Submissions</Title>
            {submissions.length > 0 ? (
              <div className="table-scroll">
                <Table striped>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Assignment</Table.Th>
                      <Table.Th>Submission Text</Table.Th>
                      <Table.Th>Attachment</Table.Th>
                      <Table.Th>Grade</Table.Th>
                      <Table.Th>Teacher Feedback</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {submissions.map((s) => (
                      <Table.Tr key={s._id}>
                        <Table.Td fw={500}>{s.assignment?.title || 'Assignment Removed'}</Table.Td>
                        <Table.Td>{s.submissionText || 'Attached File Only'}</Table.Td>
                        <Table.Td>
                          {s.filePath ? (
                            <Button
                              size="xs"
                              variant="subtle"
                              leftSection={<IconDownload size={14} />}
                              component="a"
                              href={getUploadUrl(s.filePath)}
                              target="_blank"
                              rel="noreferrer"
                            >
                              File
                            </Button>
                          ) : (
                            <Text size="xs" c="dimmed">—</Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Badge color={s.grade ? 'green' : 'gray'}>{s.grade || 'UNGRADED'}</Badge>
                        </Table.Td>
                        <Table.Td>{s.feedback || '-'}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            ) : (
              <EmptyState title="No assignments submitted yet." />
            )}
          </div>
        </Stack>
      ) : null}
    </Modal>
  );
}