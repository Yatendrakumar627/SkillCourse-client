import { Container, Text, Group, Box, Stack, ThemeIcon, SimpleGrid, Divider, ActionIcon } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconSchool, IconBrandFacebook, IconBrandInstagram, IconBrandTwitter, IconBrandYoutube } from '@tabler/icons-react';

const COURSE_LINKS = [
  { label: 'Browse Courses', to: '/courses' },
  { label: 'Live Classes', to: '/courses' },
  { label: 'Certifications', to: '/courses' },
];

const COMPANY_LINKS = [
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Register', to: '/register' },
];

const SUPPORT_LINKS = [
  { label: 'Help Center', to: '/contact' },
  { label: 'Privacy Policy', to: '/contact' },
  { label: 'Terms of Service', to: '/contact' },
];

export default function Footer() {
  return (
    <Box
      component="footer"
      style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--mantine-color-default-border)',
        backgroundColor: 'var(--lms-surface-subtle)',
        padding: '48px 0 24px',
        width: '100%',
      }}
    >
      <Container size="lg" className="lms-container">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xl">
          <Stack gap="sm">
            <Group gap="xs" wrap="nowrap">
              <ThemeIcon size={34} radius="md" className="brand-gradient">
                <IconSchool size={20} />
              </ThemeIcon>
              <Text size="lg" fw={700}>SkillCourse</Text>
            </Group>
            <Text size="sm" c="dimmed" style={{ maxWidth: 260 }}>
              Learn through live cohorts, self-paced courses and real-world projects with
              certified mentors.
            </Text>
          </Stack>

          <FooterColumn title="Courses" links={COURSE_LINKS} />
          <FooterColumn title="Company" links={COMPANY_LINKS} />
          <FooterColumn title="Support" links={SUPPORT_LINKS} />
        </SimpleGrid>

        <Divider my="lg" />

        <Group justify="space-between" wrap="wrap" gap="sm">
          <Text size="sm" c="dimmed">
            © {new Date().getFullYear()} SkillCourse LMS. All rights reserved.
          </Text>
          <Group gap="xs" wrap="nowrap">
            <ActionIcon variant="default" color="gray" radius="pill" aria-label="Facebook" component="a" href="#" onClick={(e) => e.preventDefault()}>
              <IconBrandFacebook size={18} />
            </ActionIcon>
            <ActionIcon variant="default" color="gray" radius="pill" aria-label="Instagram" component="a" href="#" onClick={(e) => e.preventDefault()}>
              <IconBrandInstagram size={18} />
            </ActionIcon>
            <ActionIcon variant="default" color="gray" radius="pill" aria-label="Twitter" component="a" href="#" onClick={(e) => e.preventDefault()}>
              <IconBrandTwitter size={18} />
            </ActionIcon>
            <ActionIcon variant="default" color="gray" radius="pill" aria-label="YouTube" component="a" href="#" onClick={(e) => e.preventDefault()}>
              <IconBrandYoutube size={18} />
            </ActionIcon>
          </Group>
        </Group>
      </Container>
    </Box>
  );
}

function FooterColumn({ title, links }) {
  return (
    <Stack gap="xs">
      <Text fw={600} size="sm" tt="uppercase" c="dimmed">
        {title}
      </Text>
      {links.map(link => (
        <Text
          key={link.label}
          component={Link}
          to={link.to}
          size="sm"
          c="dimmed"
          className="lms-footer-link"
        >
          {link.label}
        </Text>
      ))}
    </Stack>
  );
}