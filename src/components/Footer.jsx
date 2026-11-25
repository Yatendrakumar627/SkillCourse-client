import { Container, Text, Group, Box, Stack, ThemeIcon, SimpleGrid, Grid, Divider, ActionIcon } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconSchool, IconPhone, IconMail, IconBrandWhatsapp } from '@tabler/icons-react';

const COURSE_LINKS = [
  { label: 'Career & Campus Tracks', to: '/courses?category=career-productivity' },
  { label: 'Data Science & AI', to: '/courses?category=data-science' },
  { label: 'Full Stack by Language', to: '/courses?category=full-stack-development' },
];

const COMPANY_LINKS = [
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Register', to: '/register' },
];

const SUPPORT_LINKS = [
  { label: 'Help Center', to: '/contact' },
  { label: 'All Courses', to: '/courses' },
  { label: 'Student Login', to: '/login' },
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
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="sm">
              <Group gap="xs" wrap="nowrap">
                <ThemeIcon size={34} radius="md" className="brand-gradient">
                  <IconSchool size={20} />
                </ThemeIcon>
                <Text size="lg" fw={700}>SkillCourse</Text>
              </Group>
              <Text size="sm" c="dimmed" style={{ maxWidth: 280 }}>
                Live mentor-led cohorts in New Delhi &amp; across India for students, faculty mentors, and developers.
              </Text>
              <Text size="xs" c="dimmed" fw={500}>
                New Delhi, India · +91 98994 15841
              </Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 8 }}>
            <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="lg">
              <FooterColumn title="Courses" links={COURSE_LINKS} />
              <FooterColumn title="Company" links={COMPANY_LINKS} />
              <FooterColumn title="Support" links={SUPPORT_LINKS} />
            </SimpleGrid>
          </Grid.Col>
        </Grid>

        <Divider my="lg" />

        <Group justify="space-between" wrap="wrap" gap="sm">
          <Text size="sm" c="dimmed">
            © {new Date().getFullYear()} SkillCourse LMS · New Delhi, India. All rights reserved.
          </Text>
          <Group gap="xs" wrap="nowrap">
            <ActionIcon
              variant="default"
              color="gray"
              radius="pill"
              aria-label="Call SkillCourse Support"
              component="a"
              href="tel:+919899415841"
            >
              <IconPhone size={17} />
            </ActionIcon>
            <ActionIcon
              variant="default"
              color="gray"
              radius="pill"
              aria-label="WhatsApp SkillCourse Support"
              component="a"
              href="https://wa.me/919899415841"
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconBrandWhatsapp size={17} />
            </ActionIcon>
            <ActionIcon
              variant="default"
              color="gray"
              radius="pill"
              aria-label="Email SkillCourse Support"
              component="a"
              href="mailto:support@skillcourse.com"
            >
              <IconMail size={17} />
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
