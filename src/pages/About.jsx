import { Container, Text, SimpleGrid, Paper, ThemeIcon, Group, Title } from '@mantine/core';
import { IconSchool, IconRocket, IconTarget, IconUsers } from '@tabler/icons-react';
import PageHeader from '../components/ui/PageHeader';

const CARDS = [
  {
    icon: IconRocket,
    title: 'Our Mission',
    description:
      'To provide accessible, high-quality live instruction that focuses on interactive participation, feedback, and mentoring. We bypass pre-recorded courses and bring back the value of real-time teacher student dialogue.',
  },
  {
    icon: IconSchool,
    title: 'Our Approach',
    description:
      'By building direct Google Meet integrations, providing modular study resource notes, and verifying payments manually, we make online courses scalable, fraud-resistant, and high-touch.',
  },
  {
    icon: IconTarget,
    title: 'Our Method',
    description:
      'Small live cohorts, project-driven assignments, and manual validation from mentors ensures every learner proves their skill, not just consumes content.',
  },
  {
    icon: IconUsers,
    title: 'Our Community',
    description:
      'A supportive network of learners and working professionals, with direct instructor access and a help-first culture across every cohort.',
  },
];

export default function About() {
  return (
    <Container size="lg" className="lms-container page-shell">
      <PageHeader
        title="About SkillCourse LMS"
        subtitle="SkillCourse LMS is a premium cohort-based live education platform. We connect student learners with industry veterans to teach real skills through live practice and interactive sessions."
        align="center"
      />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb={50}>
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Paper key={card.title} withBorder p="xl" className="card-hover">
              <Group gap="sm" mb="sm" wrap="nowrap">
                <ThemeIcon size="lg" radius="md" color="indigo" variant="light">
                  <Icon size={20} />
                </ThemeIcon>
                <Title order={3} fw={700}>{card.title}</Title>
              </Group>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                {card.description}
              </Text>
            </Paper>
          );
        })}
      </SimpleGrid>
    </Container>
  );
}