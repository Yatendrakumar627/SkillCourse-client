import { Container, Text, SimpleGrid, Paper, ThemeIcon, Group, Title, Badge, Stack, Button, List, Box } from '@mantine/core';
import { Link } from 'react-router-dom';
import {
  IconSchool,
  IconRocket,
  IconTarget,
  IconUsers,
  IconCheck,
  IconArrowRight,
  IconMapPin,
  IconPhone,
  IconBriefcase,
  IconChalkboard,
} from '@tabler/icons-react';
import PageHeader from '../components/ui/PageHeader';

const HIGHLIGHTS = [
  { value: '56+', label: 'Live & Career Courses', detail: 'Across Career, Data Science & Full Stack tracks' },
  { value: '₹999+', label: 'Student-Friendly Pricing', detail: 'Accessible cohorts with instant UPI QR checkout' },
  { value: '100%', label: 'Project & Assignment Driven', detail: 'Mentor-reviewed submissions, not passive videos' },
  { value: 'New Delhi', label: 'India Headquarters', detail: 'Serving campuses & learners across India' },
];

const PILLARS = [
  {
    icon: IconRocket,
    title: 'Our Mission',
    description:
      'To make industry-grade, live skill education affordable for every Indian college student and early-career learner—replacing passive pre-recorded playlists with real-time mentor interaction.',
  },
  {
    icon: IconChalkboard,
    title: 'Built with Campus & Faculty Reality in Mind',
    description:
      'Our syllabi are structured into clear weekly modules and graded assignments that complement university coursework, making it easy for professors and placement cells to recommend.',
  },
  {
    icon: IconTarget,
    title: 'Practical, Portfolio-First Method',
    description:
      'Whether it is AI workflows, Excel dashboards, Data Analytics, or Full Stack engineering, every cohort ends with tangible projects, GitHub/portfolio deliverables, and verified certificates.',
  },
  {
    icon: IconUsers,
    title: 'Direct Mentorship & Support',
    description:
      'Live Google Meet sessions, bilingual Hindi + English clarity where needed, direct assignment feedback, and responsive Delhi-based student support.',
  },
];

const STUDENT_BENEFITS = [
  'Career Launchpad tracks starting at ₹999 (AI Powered Student, Excel, Communication, Placements)',
  'Complete Data Science & AI suite: SQL, Power BI, PyTorch, GenAI, RAG, MLOps & PySpark',
  'Individual Full Stack tracks across JavaScript, TypeScript, Python, Java, C#, Go, Rust, PHP & more',
  'Evening & weekend live cohorts designed to fit alongside college classes and exams',
];

const FACULTY_BENEFITS = [
  'Structured weekly module outlines aligned with modern industry & NEP skill outcomes',
  'Hands-on assignments with mentor grading to validate real student competency',
  'Transparent tracking of student attendance, submissions, and completion certificates',
  'Dedicated campus partnership & cohort coordination directly with our New Delhi team',
];

export default function About() {
  return (
    <Container size="lg" className="lms-container page-shell">
      <Box mb="md" ta="center">
        <Badge variant="light" color="teal" radius="xl" size="lg">
          New Delhi, India · Campus &amp; Career EdTech
        </Badge>
      </Box>

      <PageHeader
        title="About SkillCourse LMS"
        subtitle="SkillCourse LMS is a Delhi-based live learning platform helping Indian college students, faculty mentors, and aspiring engineers build job-ready skills through mentor-led cohorts and real-world projects."
        align="center"
      />

      {/* Key Metrics Strip */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb={48}>
        {HIGHLIGHTS.map((item) => (
          <Paper key={item.label} withBorder p="lg" radius="lg" ta="center">
            <Text fw={800} size="xl" c="indigo" style={{ fontSize: '1.75rem' }}>
              {item.value}
            </Text>
            <Text fw={700} size="sm" mt={4}>
              {item.label}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              {item.detail}
            </Text>
          </Paper>
        ))}
      </SimpleGrid>

      {/* Core Pillars */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb={48}>
        {PILLARS.map((card) => {
          const Icon = card.icon;
          return (
            <Paper key={card.title} withBorder p="xl" radius="lg" className="card-hover">
              <Group gap="sm" mb="sm" wrap="nowrap">
                <ThemeIcon size="lg" radius="md" color="indigo" variant="light">
                  <Icon size={20} />
                </ThemeIcon>
                <Title order={3} fw={700}>{card.title}</Title>
              </Group>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.65 }}>
                {card.description}
              </Text>
            </Paper>
          );
        })}
      </SimpleGrid>

      {/* Audience Alignment: Students & College Professors */}
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb={48}>
        <Paper withBorder p="xl" radius="lg" style={{ background: 'var(--lms-surface-subtle)' }}>
          <Group gap="sm" mb="md" wrap="nowrap">
            <ThemeIcon size={40} radius="md" color="indigo" variant="light">
              <IconBriefcase size={20} />
            </ThemeIcon>
            <div>
              <Title order={3} size="h4">For College Students &amp; Job Seekers</Title>
              <Text size="xs" c="dimmed">From first-year foundations to campus placements</Text>
            </div>
          </Group>
          <List
            spacing="sm"
            size="sm"
            icon={
              <ThemeIcon color="teal" size={20} radius="xl">
                <IconCheck size={13} />
              </ThemeIcon>
            }
          >
            {STUDENT_BENEFITS.map((item) => (
              <List.Item key={item}>{item}</List.Item>
            ))}
          </List>
        </Paper>

        <Paper withBorder p="xl" radius="lg" style={{ background: 'var(--lms-surface-subtle)' }}>
          <Group gap="sm" mb="md" wrap="nowrap">
            <ThemeIcon size={40} radius="md" color="teal" variant="light">
              <IconSchool size={20} />
            </ThemeIcon>
            <div>
              <Title order={3} size="h4">For College Professors &amp; Placement Cells</Title>
              <Text size="xs" c="dimmed">Bridge the degree-to-industry employability gap</Text>
            </div>
          </Group>
          <List
            spacing="sm"
            size="sm"
            icon={
              <ThemeIcon color="indigo" size={20} radius="xl">
                <IconCheck size={13} />
              </ThemeIcon>
            }
          >
            {FACULTY_BENEFITS.map((item) => (
              <List.Item key={item}>{item}</List.Item>
            ))}
          </List>
        </Paper>
      </SimpleGrid>

      {/* CTA + Delhi Contact Strip */}
      <Paper
        withBorder
        p="xl"
        radius="lg"
        style={{
          background: 'var(--lms-surface-accent-soft)',
          borderLeft: '4px solid var(--mantine-color-indigo-6)',
        }}
      >
        <Group justify="space-between" align="center" wrap="wrap" gap="lg">
          <Stack gap={4} style={{ maxWidth: 600 }}>
            <Title order={3}>Ready to Explore Our Tracks or Partner With Us?</Title>
            <Text size="sm" c="dimmed">
              Browse 56+ career, Data Science, and Full Stack courses or connect with our New Delhi team for campus cohorts and student queries.
            </Text>
            <Group gap="lg" mt="xs" wrap="wrap">
              <Group gap={6} wrap="nowrap">
                <IconMapPin size={15} color="var(--mantine-color-indigo-6)" />
                <Text size="xs" fw={600}>New Delhi, Delhi NCR, India</Text>
              </Group>
              <Group gap={6} wrap="nowrap">
                <IconPhone size={15} color="var(--mantine-color-indigo-6)" />
                <Text size="xs" fw={600}>+91 98994 15841</Text>
              </Group>
            </Group>
          </Stack>

          <Group gap="sm" wrap="wrap">
            <Button
              component={Link}
              to="/courses"
              color="indigo"
              size="md"
              rightSection={<IconArrowRight size={16} />}
            >
              Browse Courses
            </Button>
            <Button
              component={Link}
              to="/contact"
              variant="default"
              size="md"
            >
              Contact Delhi Team
            </Button>
          </Group>
        </Group>
      </Paper>
    </Container>
  );
}
