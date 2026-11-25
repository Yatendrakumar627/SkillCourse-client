import { useState } from 'react';
import { Container, Tabs, Badge, Modal, Textarea, Button, Group, Text, Title, Box } from '@mantine/core';
import {
  IconTrendingUp, IconBook, IconFolder, IconClipboard,
  IconReceipt, IconCalendar, IconBell, IconUsers, IconShield,
  IconMail, IconBrandTelegram,
} from '@tabler/icons-react';
import useAdminData from '../hooks/useAdminData';
import { updatePaymentStatusAPI, testTelegramAPI } from '../services/api';
import { notifyError, notifySuccess } from '../utils/toast';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import AdminOverview from '../components/admin/AdminOverview';
import AdminCourses from '../components/admin/AdminCourses';
import AdminCurriculum from '../components/admin/AdminCurriculum';
import AdminAssignments from '../components/admin/AdminAssignments';
import AdminPayments from '../components/admin/AdminPayments';
import AdminLiveClasses from '../components/admin/AdminLiveClasses';
import AdminAnnouncements from '../components/admin/AdminAnnouncements';
import AdminStudents from '../components/admin/AdminStudents';
import AdminInquiries from '../components/admin/AdminInquiries';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const {
    courses, categories, payments, classes, announcements, students, inquiries,
    loading, error, reload,
  } = useAdminData();

  const pendingPayments = payments.filter((p) => p.status === 'pending');

  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    try {
      const res = await testTelegramAPI();
      notifySuccess('Telegram Connected', res.message || 'Test message sent to channel.');
    } catch (err) {
      notifyError('Telegram Test Failed', 'Could not post test message to channel.', err);
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleApprovePayment = async (id) => {
    try {
      await updatePaymentStatusAPI(id, { status: 'approved' });
      notifySuccess('Payment Approved', 'Student enrollment has been activated.');
      reload();
    } catch (err) {
      notifyError('Approval Failed', 'There was an error approving this payment.', err);
    }
  };

  const handleOpenRejectModal = (payment) => {
    setRejectTarget(payment);
    setRejectionReason('');
  };

  const handleRejectPayment = async () => {
    if (!rejectionReason.trim()) {
      notifyError('Action Needed', 'Please specify a rejection reason.');
      return;
    }
    setRejecting(true);
    try {
      await updatePaymentStatusAPI(rejectTarget._id, {
        status: 'rejected',
        rejectionReason,
      });
      setRejectTarget(null);
      reload();
      notifySuccess('Payment Rejected', 'The student has been notified about the rejection.');
    } catch (err) {
      notifyError('Rejection Failed', 'There was an error rejecting this payment.', err);
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading admin panel..." fullPage variant="skeleton" rows={8} />;
  }

  if (error) {
    return (
      <Container size="lg" className="lms-container" py="xl">
        <ErrorState message={error} onRetry={reload} />
      </Container>
    );
  }

  return (
    <Container size="lg" className="lms-container page-shell" style={{ textAlign: 'left' }}>
      <Group justify="space-between" align="center" wrap="wrap" gap="sm" mb="lg">
        <div>
          <Title order={2}>Admin Console</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Manage courses, payments, cohorts and learners across your LMS.
          </Text>
        </div>
        <Group gap="xs" wrap="wrap">
          <Button
            size="xs"
            variant="light"
            color="teal"
            leftSection={<IconBrandTelegram size={14} />}
            loading={testingTelegram}
            onClick={handleTestTelegram}
          >
            Test Telegram
          </Button>
          <Badge color="violet" variant="light" size="lg" radius="sm" leftSection={<IconShield size={14} />}>
            Admin Access
          </Badge>
        </Group>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab} color="violet">
        <Tabs.List mb="lg" className="no-scrollbar" style={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
          <Tabs.Tab value="overview" leftSection={<IconTrendingUp size={16} />}>Overview</Tabs.Tab>
          <Tabs.Tab value="courses" leftSection={<IconBook size={16} />}>Courses</Tabs.Tab>
          <Tabs.Tab value="curriculum" leftSection={<IconFolder size={16} />}>Curriculum</Tabs.Tab>
          <Tabs.Tab value="assignments" leftSection={<IconClipboard size={16} />}>Assignments</Tabs.Tab>
          <Tabs.Tab value="payments" leftSection={<IconReceipt size={16} />}>
            Payments {pendingPayments.length > 0 && <Badge color="red" size="xs">{pendingPayments.length}</Badge>}
          </Tabs.Tab>
          <Tabs.Tab value="classes" leftSection={<IconCalendar size={16} />}>Live Classes</Tabs.Tab>
          <Tabs.Tab value="announcements" leftSection={<IconBell size={16} />}>Announcements</Tabs.Tab>
          <Tabs.Tab value="students" leftSection={<IconUsers size={16} />}>Students</Tabs.Tab>
          <Tabs.Tab value="inquiries" leftSection={<IconMail size={16} />}>
            Inquiries {inquiries.length > 0 && <Badge color="indigo" variant="light" size="xs">{inquiries.length}</Badge>}
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview">
          <AdminOverview
            payments={payments}
            students={students}
            courses={courses}
            pendingPayments={pendingPayments}
            onApprove={handleApprovePayment}
            onReject={handleOpenRejectModal}
          />
        </Tabs.Panel>

        <Tabs.Panel value="courses">
          <AdminCourses courses={courses} categories={categories} onReload={reload} />
        </Tabs.Panel>

        <Tabs.Panel value="curriculum">
          <AdminCurriculum courses={courses} />
        </Tabs.Panel>

        <Tabs.Panel value="assignments">
          <AdminAssignments courses={courses} />
        </Tabs.Panel>

        <Tabs.Panel value="payments">
          <AdminPayments
            payments={payments}
            onApprove={handleApprovePayment}
            onReject={handleOpenRejectModal}
          />
        </Tabs.Panel>

        <Tabs.Panel value="classes">
          <AdminLiveClasses courses={courses} classes={classes} onReload={reload} />
        </Tabs.Panel>

        <Tabs.Panel value="announcements">
          <AdminAnnouncements courses={courses} announcements={announcements} onReload={reload} />
        </Tabs.Panel>

        <Tabs.Panel value="students">
          <AdminStudents students={students} courses={courses} onReload={reload} />
        </Tabs.Panel>

        <Tabs.Panel value="inquiries">
          <AdminInquiries inquiries={inquiries} onReload={reload} />
        </Tabs.Panel>
      </Tabs>

      {/* Reject Payment Reason Modal */}
      <Modal
        opened={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Reject Transaction Request"
        centered
      >
        {rejectTarget && (
          <Box
            p="sm"
            mb="md"
            style={{ borderRadius: 8, background: 'var(--lms-surface-subtle)', border: '1px solid var(--mantine-color-default-border)' }}
          >
            <Text size="sm" fw={600}>{rejectTarget.user?.name || 'Student'} · ₹{rejectTarget.amount}</Text>
            <Text size="xs" c="dimmed">Course: {rejectTarget.course?.title || 'Course'}</Text>
            <Text size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
              UTR: {rejectTarget.transactionId || 'N/A'}
            </Text>
          </Box>
        )}
        <Textarea
          label="Reason for rejection"
          placeholder="e.g. Screenshot blurry, UTR mismatch, payment amount mismatch"
          required
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          mb="lg"
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setRejectTarget(null)}>Cancel</Button>
          <Button color="red" onClick={handleRejectPayment} loading={rejecting}>
            Reject Transaction
          </Button>
        </Group>
      </Modal>
    </Container>
  );
}