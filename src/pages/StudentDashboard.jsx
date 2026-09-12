import { Container, Tabs, Paper, Text, Title, Group, Badge, SimpleGrid, ThemeIcon } from '@mantine/core';
import {
  IconBook, IconCalendar, IconBell, IconReceipt, IconDownload, IconUser,
  IconBook2, IconCalendarEvent, IconClipboardList,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import useStudentData from '../hooks/useStudentData';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
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
          <Text fw={800} size="xl" style={{ lineHeight: 1.1 }}>
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

const TAB_STYLES = {
  tab: {
    fontSize: 14,
    '&[data-active]': {
      fontWeight: 700,
    },
  },
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
        style={{ background: 'var(--mantine-color-gray-0)' }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="lg">
          <div style={{ maxWidth: 460, minWidth: 260 }}>
            <Title order={2} size="h2">Welcome back, {user?.name}!</Title>
            <Text size="sm" c="dimmed" mt={4}>
              Continue your learning journey and stay on top of your upcoming classes.
            </Text>
          </div>
          <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm" style={{ flexGrow: 1, minWidth: 320 }}>
            {stats.map((s) => (
              <SummaryCard key={s.label} icon={s.icon} value={s.value} label={s.label} />
            ))}
          </SimpleGrid>
        </Group>
      </Paper>

      {/* Unified horizontal navigation */}
      <Tabs value={activeTab} onChange={setActiveTab} color="indigo">
        <Tabs.List className="tabs-scroll" mb="lg">
          <Tabs.Tab value="courses" leftSection={<IconBook size={16} />} styles={TAB_STYLES}>
            My Courses <TabCount count={courses.length} />
          </Tabs.Tab>
          <Tabs.Tab value="classes" leftSection={<IconCalendar size={16} />} styles={TAB_STYLES}>
            Live Classes <TabCount count={upcomingClasses} />
          </Tabs.Tab>
          <Tabs.Tab value="announcements" leftSection={<IconBell size={16} />} styles={TAB_STYLES}>
            Announcements <TabCount count={announcements.length} />
          </Tabs.Tab>
          <Tabs.Tab value="payments" leftSection={<IconReceipt size={16} />} styles={TAB_STYLES}>
            Purchase Requests <TabCount count={enrollments.length} />
          </Tabs.Tab>
          <Tabs.Tab value="downloads" leftSection={<IconDownload size={16} />} styles={TAB_STYLES}>
            Downloads
          </Tabs.Tab>
          <Tabs.Tab value="profile" leftSection={<IconUser size={16} />} styles={TAB_STYLES}>
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
    </Container>
  );
}