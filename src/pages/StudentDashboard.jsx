import { Container, Tabs, Paper, Text, Title, Group, Badge, SimpleGrid, ThemeIcon, Button, Alert, Box } from '@mantine/core';
import {
  IconBook, IconCalendar, IconBell, IconReceipt, IconDownload, IconUser,
  IconBook2, IconCalendarEvent, IconClipboardList, IconSparkles, IconArrowRight, IconInfoCircle,
} from '@tabler/icons-react';
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import useStudentData from '../hooks/useStudentData';
import { getCoursesAPI } from '../services/api';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import CourseCard from '../components/courses/CourseCard';
import StudentCourses from '../components/student/StudentCourses';
import StudentLiveClasses from '../components/student/StudentLiveClasses';
import StudentAnnouncements from '../components/student/StudentAnnouncements';
import StudentPurchases from '../components/student/StudentPurchases';
import StudentDownloads from '../components/student/StudentDownloads';
import StudentProfile from '../components/student/StudentProfile';

function SummaryCard({ icon: Icon, value, label }) {
  return (
    <Paper withBorder radius="md" p="md" style={{ background: 'var(--mantine-color-body)' }}>
      <Group gap="sm" wrap="nowrap" align="center">
        <ThemeIcon size={38} radius="md" color="indigo" variant="light" style={{ flexShrink: 0 }}>
          <Icon size={20} />
        </ThemeIcon>
        <div style={{ minWidth: 0 }}>
          <Text fw={800} size="xl" className="tabular-nums" style={{ lineHeight: 1.1 }}>
            {value}
          </Text>
          <Text size="xs" c="dimmed" fw={500} truncate>
            {label}
          </Text>
        </div>
      </Group>
    </Paper>
  );
}

function TabCount({ count }) {
  if (!count) return null;
  return (
    <Badge size="xs" variant="light" color="indigo" radius="sm" ml={4}>
      {count}
    </Badge>
  );
}

const getDiscountPct = (c) => {
  if (c.discountedPrice == null || c.discountedPrice >= c.price || !c.price) return 0;
  return Math.round((1 - c.discountedPrice / c.price) * 100);
};

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { courses, classes, announcements, enrollments, assignments, submissions, notifications, loading, error, reload } = useStudentData();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    () => new URLSearchParams(location.search).get('tab') || 'courses'
  );

  useEffect(() => {
    setActiveTab(new URLSearchParams(location.search).get('tab') || 'courses');
  }, [location.search]);

  const { data: catalogCourses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCoursesAPI(),
  });

  const dealCourses = useMemo(() => {
    const ownedOrPendingIds = new Set(
      enrollments
        .filter((e) => e.accessGranted || e.paymentId?.status === 'pending')
        .map((e) => String(e.course?._id || e.course))
    );
    return catalogCourses
      .filter((c) => !ownedOrPendingIds.has(String(c._id)))
      .sort((a, b) => {
        const diff = getDiscountPct(b) - getDiscountPct(a);
        if (diff !== 0) return diff;
        const pa = Number(a.discountedPrice ?? a.price ?? 0);
        const pb = Number(b.discountedPrice ?? b.price ?? 0);
        return pa - pb;
      })
      .slice(0, 3);
  }, [catalogCourses, enrollments]);

  if (loading) {
    return <LoadingState label="Loading dashboard details..." fullPage variant="skeleton" rows={5} />;
  }

  if (error) {
    return (
      <Container size="lg" className="lms-container" py="xl">
        <ErrorState message={error} onRetry={reload} />
      </Container>
    );
  }

  const upcomingClasses = classes.filter(
    (c) => new Date(c.startTime || c.date) > new Date()
  ).length;

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const pendingCount = enrollments.filter(
    (e) => !e.accessGranted && e.paymentId?.status === 'pending'
  ).length;
  const rejectedCount = enrollments.filter(
    (e) => !e.accessGranted && e.paymentId?.status === 'rejected'
  ).length;

  const stats = [
    { icon: IconBook2, value: courses.length, label: 'My Courses' },
    { icon: IconCalendarEvent, value: upcomingClasses, label: 'Upcoming Classes' },
    { icon: IconClipboardList, value: assignments.length, label: 'Assignments' },
    { icon: IconBell, value: unreadCount, label: 'Unread Notifications' },
  ];

  return (
    <Container size="lg" className="lms-container page-shell">
      {/* Compact dashboard header */}
      <Paper
        withBorder
        radius="lg"
        p="xl"
        mb="xl"
        style={{ background: 'var(--lms-surface-subtle)' }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="lg">
          <div style={{ maxWidth: 460, minWidth: 260 }}>
            <Title order={2} size="h2">Welcome back, {user?.name}!</Title>
            <Text size="sm" c="dimmed" mt={4}>
              Track your enrolled courses, upcoming live sessions, and assignments—or explore new courses with exclusive deals.
            </Text>
          </div>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" style={{ flexGrow: 1, minWidth: 320 }}>
            {stats.map((s) => (
              <SummaryCard key={s.label} icon={s.icon} value={s.value} label={s.label} />
            ))}
          </SimpleGrid>
        </Group>
      </Paper>

      {(pendingCount > 0 || rejectedCount > 0) && (
        <Alert
          icon={<IconInfoCircle size={18} />}
          color={rejectedCount > 0 ? 'red' : 'yellow'}
          variant="light"
          radius="md"
          mb="lg"
          title={rejectedCount > 0 ? 'Payment Action Needed' : 'Enrollment Verification Pending'}
        >
          <Group justify="space-between" align="center" wrap="wrap" gap="sm">
            <Text size="sm">
              {pendingCount > 0 && `You have ${pendingCount} enrollment request${pendingCount > 1 ? 's' : ''} awaiting verification. `}
              {rejectedCount > 0 && `${rejectedCount} payment${rejectedCount > 1 ? 's were' : ' was'} rejected and can be re-submitted.`}
            </Text>
            <Button size="xs" variant="light" color={rejectedCount > 0 ? 'red' : 'yellow'} onClick={() => setActiveTab('payments')}>
              View Purchase Requests
            </Button>
          </Group>
        </Alert>
      )}

      {/* Unified horizontal navigation */}
      <Tabs value={activeTab} onChange={setActiveTab} color="indigo">
        <Tabs.List className="tabs-scroll" mb="lg">
          <Tabs.Tab value="courses" leftSection={<IconBook size={16} />} className="lms-tab">
            My Courses <TabCount count={courses.length} />
          </Tabs.Tab>
          <Tabs.Tab value="classes" leftSection={<IconCalendar size={16} />} className="lms-tab">
            Live Classes <TabCount count={upcomingClasses} />
          </Tabs.Tab>
          <Tabs.Tab value="announcements" leftSection={<IconBell size={16} />} className="lms-tab">
            Announcements <TabCount count={announcements.length} />
          </Tabs.Tab>
          <Tabs.Tab value="payments" leftSection={<IconReceipt size={16} />} className="lms-tab">
            Purchase Requests <TabCount count={enrollments.length} />
          </Tabs.Tab>
          <Tabs.Tab value="downloads" leftSection={<IconDownload size={16} />} className="lms-tab">
            Downloads
          </Tabs.Tab>
          <Tabs.Tab value="profile" leftSection={<IconUser size={16} />} className="lms-tab">
            Profile
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="courses">
          <StudentCourses courses={courses} classes={classes} assignments={assignments} submissions={submissions} />
        </Tabs.Panel>

        <Tabs.Panel value="classes">
          <StudentLiveClasses classes={classes} />
        </Tabs.Panel>

        <Tabs.Panel value="announcements">
          <StudentAnnouncements announcements={announcements} />
        </Tabs.Panel>

        <Tabs.Panel value="payments">
          <StudentPurchases enrollments={enrollments} />
        </Tabs.Panel>

        <Tabs.Panel value="downloads">
          <StudentDownloads classes={classes} />
        </Tabs.Panel>

        <Tabs.Panel value="profile">
          <StudentProfile />
        </Tabs.Panel>
      </Tabs>

      {/* Recommended & Best Deals Discovery */}
      {dealCourses.length > 0 && (
        <Box mt={56}>
          <Group justify="space-between" align="flex-end" mb="lg" wrap="wrap" gap="sm">
            <div>
              <Badge variant="light" color="teal" radius="xl" mb={6} leftSection={<IconSparkles size={13} />}>
                Best Deals &amp; Next Skills
              </Badge>
              <Title order={3}>Recommended Courses With Top Discounts</Title>
              <Text size="sm" c="dimmed" mt={2}>
                Expand your skillset with our highest-value offers not yet in your library.
              </Text>
            </div>
            <Button
              component={Link}
              to="/courses?sort=deals"
              variant="light"
              color="indigo"
              rightSection={<IconArrowRight size={16} />}
            >
              Browse All Deals
            </Button>
          </Group>

          <Box className="course-grid">
            {dealCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </Box>
        </Box>
      )}
    </Container>
  );
}
