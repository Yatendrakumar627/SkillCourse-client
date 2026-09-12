import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Group, Button, Container, Text, Menu, Avatar, Box, ActionIcon, Indicator,
  useMantineColorScheme, ThemeIcon, Burger, Drawer, Stack, Divider, Badge,
} from '@mantine/core';
import { useDisclosure, useWindowScroll } from '@mantine/hooks';
import { useAuthStore } from '../store/authStore';
import { getNotificationsAPI, markNotificationReadAPI, markAllNotificationsReadAPI } from '../services/api';
import {
  IconLogout, IconDashboard, IconBook, IconLogin, IconUserPlus, IconBell,
  IconCheck, IconSun, IconMoon, IconSchool, IconInfoCircle, IconMail, IconUser,
} from '@tabler/icons-react';

const NAV_LINKS = [
  { to: '/courses', label: 'Browse Courses', icon: IconBook, match: (path) => path === '/courses' || path.startsWith('/courses/') },
  { to: '/about', label: 'About Us', icon: IconInfoCircle, match: (path) => path === '/about' },
  { to: '/contact', label: 'Contact', icon: IconMail, match: (path) => path === '/contact' },
];

function Brand({ size = 'md' }) {
  return (
    <Group gap="xs" wrap="nowrap" component={Link} to="/" style={{ textDecoration: 'none', cursor: 'pointer' }}>
      <ThemeIcon size={size === 'lg' ? 36 : 32} radius="md" className="brand-gradient">
        <IconSchool size={size === 'lg' ? 22 : 19} />
      </ThemeIcon>
      <Text size={size === 'lg' ? 'xl' : 'lg'} fw={700} lts="-0.01em" c="var(--mantine-color-text)">
        SkillCourse<span style={{ color: 'var(--mantine-color-indigo-7)' }}> LMS</span>
      </Text>
    </Group>
  );
}

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifications, setNotifications] = useState([]);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [opened, { open, close }] = useDisclosure(false);
  const [scroll] = useWindowScroll();

  const scrolled = scroll.y > 4;

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await getNotificationsAPI();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleLogout = () => {
    close();
    logout();
    navigate('/');
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationReadAPI(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadAPI();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error(error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const dashboardTo = user?.role === 'admin' ? '/admin' : '/dashboard';
  const dashboardLabel = user?.role === 'admin' ? 'Admin Panel' : 'My Dashboard';
  const profileTo = '/dashboard?tab=profile';

  const initials = user?.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

  const navStyle = (active) => ({
    root: {
      color: active ? 'var(--mantine-color-indigo-7)' : 'var(--mantine-color-dimmed)',
      fontWeight: active ? 600 : 500,
      borderRadius: 'var(--mantine-radius-sm)',
      '&:hover': {
        color: active ? 'var(--mantine-color-indigo-7)' : 'var(--mantine-color-text)',
        backgroundColor: active
          ? 'var(--mantine-color-indigo-0)'
          : 'var(--mantine-color-default-hover)',
      },
    },
    label: { fontSize: '14px' },
    section: { color: 'inherit' },
  });

  return (
    <Box
      component="header"
      style={{
        borderBottom: '1px solid var(--mantine-color-default-border)',
        backgroundColor: 'var(--mantine-color-body)',
        position: 'sticky',
        top: 0,
        transition: 'box-shadow 150ms ease',
        boxShadow: scrolled ? 'var(--mantine-shadow-sm)' : 'none',
        zIndex: 100,
        width: '100%',
      }}
    >
      <Container size="lg" className="lms-container" style={{ height: 64, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Brand />

        <Group gap={4} visibleFrom="md">
          {NAV_LINKS.map(link => {
            const Icon = link.icon;
            const active = link.match(location.pathname);
            return (
              <Button
                key={link.to}
                variant={active ? 'light' : 'subtle'}
                component={Link}
                to={link.to}
                leftSection={<Icon size={16} />}
                px="sm"
                styles={navStyle(active)}
              >
                {link.label}
              </Button>
            );
          })}
        </Group>

        <Group gap="sm" wrap="nowrap">
          <ActionIcon
            onClick={toggleColorScheme}
            variant="default"
            size="lg"
            radius="md"
            aria-label="Toggle color scheme"
          >
            {colorScheme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
          </ActionIcon>

          {isAuthenticated && (
            <Menu shadow="lg" width={340} position="bottom-end" closeOnItemClick={false} offset={6}>
              <Menu.Target>
                <Indicator
                  color="red"
                  size={16}
                  label={unreadCount > 9 ? '9+' : unreadCount}
                  disabled={unreadCount === 0}
                  offset={5}
                  withBorder
                  processing={unreadCount > 0}
                >
                  <ActionIcon variant="default" size="lg" radius="md" aria-label="Notifications">
                    <IconBell size={20} />
                  </ActionIcon>
                </Indicator>
              </Menu.Target>

              <Menu.Dropdown p={0} radius="panel" style={{ overflow: 'hidden' }}>
                <Box p="sm" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                  <Group justify="space-between" wrap="nowrap" gap="sm">
                    <Group gap={8} wrap="nowrap">
                      <Text fw={600} size="sm">Notifications</Text>
                      {unreadCount > 0 && (
                        <Badge variant="light" color="red" size="xs" radius="sm">
                          {unreadCount}
                        </Badge>
                      )}
                    </Group>
                    {unreadCount > 0 && (
                      <Button variant="subtle" size="xs" onClick={handleMarkAllRead} leftSection={<IconCheck size={14} />} styles={{ root: { fontWeight: 600 } }}>
                        Mark all as read
                      </Button>
                    )}
                  </Group>
                </Box>

                <Box style={{ maxHeight: 384, overflowY: 'auto' }}>
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <Menu.Item
                        key={n._id}
                        onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                        p={0}
                        style={{
                          backgroundColor: n.isRead ? 'transparent' : 'var(--mantine-color-indigo-0)',
                          borderBottom: '1px solid var(--mantine-color-default-border)',
                        }}
                      >
                        <Group gap={10} wrap="nowrap" align="flex-start" p="sm">
                          <Box
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 999,
                              background: n.isRead ? 'var(--mantine-color-gray-4)' : 'var(--mantine-color-indigo-6)',
                              flexShrink: 0,
                              marginTop: 9,
                            }}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <Text fw={n.isRead ? 500 : 600} size="sm" lineClamp={1}>{n.title}</Text>
                            <Text size="xs" c="dimmed" lineClamp={2} mt={2}>{n.message}</Text>
                            <Text size="xs" c="dimmed" mt={4} ta="right">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </Text>
                          </div>
                        </Group>
                      </Menu.Item>
                    ))
                  ) : (
                    <Text size="xs" c="dimmed" ta="center" py="xl">No notifications yet.</Text>
                  )}
                </Box>
              </Menu.Dropdown>
            </Menu>
          )}

          {isAuthenticated ? (
            <Menu shadow="lg" width={280} position="bottom-end" offset={6}>
              <Menu.Target>
                <Avatar src={null} alt={user?.name} color="indigo" radius="pill" style={{ cursor: 'pointer' }}>
                  {initials}
                </Avatar>
              </Menu.Target>

              <Menu.Dropdown p="xs">
                <Box p="sm" mb="xs" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                  <Group gap="sm" wrap="nowrap">
                    <Avatar color="indigo" radius="pill" size="lg" style={{ flexShrink: 0 }}>
                      {initials}
                    </Avatar>
                    <Stack gap={2} style={{ minWidth: 0 }}>
                      <Text fw={600} size="sm" truncate>{user?.name}</Text>
                      <Text size="xs" c="dimmed" truncate>{user?.email}</Text>
                      <Badge
                        size="xs"
                        variant="light"
                        color={user?.role === 'admin' ? 'violet' : 'indigo'}
                        radius="sm"
                        style={{ width: 'fit-content' }}
                      >
                        {user?.role === 'admin' ? 'Administrator' : 'Student'}
                      </Badge>
                    </Stack>
                  </Group>
                </Box>

                <Menu.Item leftSection={<IconDashboard size={15} />} component={Link} to={dashboardTo} onClick={close}>
                  {dashboardLabel}
                </Menu.Item>

                {user?.role === 'student' && (
                  <Menu.Item leftSection={<IconUser size={15} />} component={Link} to={profileTo} onClick={close}>
                    Profile
                  </Menu.Item>
                )}

                <Menu.Divider />
                <Menu.Item color="red" leftSection={<IconLogout size={15} />} onClick={handleLogout}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Group gap="sm" visibleFrom="md" wrap="nowrap">
              <Button variant="default" component={Link} to="/login" leftSection={<IconLogin size={16} />}>
                Login
              </Button>
              <Button
                color="indigo"
                component={Link}
                to="/register"
                leftSection={<IconUserPlus size={16} />}
              >
                Register
              </Button>
            </Group>
          )}

          <Burger opened={opened} onClick={opened ? close : open} hiddenFrom="md" aria-label="Toggle navigation" />
        </Group>
      </Container>

      <Drawer
        opened={opened}
        onClose={close}
        title={<Brand />}
        size="xs"
        padding="lg"
        position="right"
      >
        {isAuthenticated && (
          <>
            <Box
              p="sm"
              mb="md"
              style={{ borderRadius: 'var(--mantine-radius-md)', border: '1px solid var(--mantine-color-default-border)' }}
            >
              <Group gap="sm" wrap="nowrap">
                <Avatar color="indigo" radius="pill" size="lg" style={{ flexShrink: 0 }}>
                  {initials}
                </Avatar>
                <Stack gap={2} style={{ minWidth: 0 }}>
                  <Text fw={600} size="sm" truncate>{user?.name}</Text>
                  <Text size="xs" c="dimmed" truncate>{user?.email}</Text>
                </Stack>
              </Group>
            </Box>
          </>
        )}

        <Stack gap={6} mt="sm">
          {NAV_LINKS.map(link => {
            const Icon = link.icon;
            const active = link.match(location.pathname);
            return (
              <Button
                key={link.to}
                variant={active ? 'light' : 'subtle'}
                component={NavLink}
                to={link.to}
                onClick={close}
                leftSection={<Icon size={18} />}
                justify="flex-start"
                fullWidth
                styles={navStyle(active)}
              >
                {link.label}
              </Button>
            );
          })}
        </Stack>

        <Divider my="md" />

        {isAuthenticated ? (
          <Stack gap={6}>
            <Button
              variant="light"
              component={Link}
              to={dashboardTo}
              onClick={close}
              leftSection={<IconDashboard size={18} />}
              justify="flex-start"
              fullWidth
            >
              {dashboardLabel}
            </Button>
            {user?.role === 'student' && (
              <Button
                variant="light"
                component={Link}
                to={profileTo}
                onClick={close}
                leftSection={<IconUser size={18} />}
                justify="flex-start"
                fullWidth
              >
                Profile
              </Button>
            )}
            <Button
              color="red"
              variant="light"
              onClick={handleLogout}
              leftSection={<IconLogout size={18} />}
              justify="flex-start"
              fullWidth
            >
              Logout
            </Button>
          </Stack>
        ) : (
          <Stack gap={6}>
            <Button component={Link} to="/login" onClick={close} leftSection={<IconLogin size={18} />} fullWidth>
              Login
            </Button>
            <Button
              color="indigo"
              component={Link}
              to="/register"
              onClick={close}
              leftSection={<IconUserPlus size={18} />}
              fullWidth
            >
              Create Account
            </Button>
          </Stack>
        )}
      </Drawer>
    </Box>
  );
}