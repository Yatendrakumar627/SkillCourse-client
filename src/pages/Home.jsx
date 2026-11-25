import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Container, Title, Text, Button, Group, SimpleGrid, Card, Accordion, Box, ThemeIcon, Badge, Paper, TextInput, Stack } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { getCoursesAPI } from '../services/api';
import {
  IconChevronRight, IconVideo, IconBooks, IconUserCheck, IconCompass,
  IconClipboardCheck, IconMessages, IconBook2, IconCreditCard,
  IconLiveView, IconUsersGroup, IconPlayerPlay, IconSearch, IconSparkles,
} from '@tabler/icons-react';
import CourseCard from '../components/courses/CourseCard';
import CourseCardSkeleton from '../components/ui/CourseCardSkeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import {
  FlipWords,
  AnimatedCounter,
  SpotlightWrap,
  TrackMarquee,
  ScrollReveal,
} from '../components/ui/MotionPrimitives';
import heroImg from '../assets/hero.png';

const HERO_WORDS = [
  'AI & GenAI',
  'Campus Placements',
  'Data Analytics',
  'Full Stack Coding',
];

const TRUST_ITEMS = [
  { icon: IconLiveView, title: 'Faculty-Aligned Syllabi', text: 'Structured modules & graded tasks' },
  { icon: IconBooks, title: 'Campus Placement Focus', text: 'AI, Excel, aptitude & mock prep' },
  { icon: IconUserCheck, title: 'Student-Friendly Pricing', text: 'Career tracks starting at ₹999' },
  { icon: IconCompass, title: 'Verified Outcomes', text: 'Live mentor feedback & certificates' },
];

const IMPACT_METRICS = [
  { target: 56, suffix: '+', label: 'Industry & Career Courses', detail: 'Career, Data Science & Full Stack' },
  { target: 7, suffix: '', label: 'Structured Learning Tracks', detail: 'From ₹999 launchpads to advanced engineering' },
  { target: 999, prefix: '₹', suffix: '', label: 'Starting Cohort Fee', detail: 'Instant dynamic UPI QR enrollment' },
  { target: 100, suffix: '%', label: 'Live & Mentor Reviewed', detail: 'Google Meet classes + graded assignments' },
];

const MARQUEE_TRACKS = [
  { label: 'AI Powered Student', to: '/courses?q=AI+Powered+Student', badge: true },
  { label: 'Placement Ready Pro', to: '/courses?q=Placement+Ready+Pro', badge: true },
  { label: 'Data Analytics Career Track', to: '/courses?q=Data+Analytics', badge: true },
  { label: 'Excel to Excellence', to: '/courses?q=Excel', badge: true },
  { label: 'Python Coding Foundation', to: '/courses?q=Python', badge: false },
  { label: 'Generative AI, LLMs & RAG', to: '/courses?q=Generative+AI', badge: false },
  { label: 'TypeScript & Next.js', to: '/courses?q=TypeScript', badge: false },
  { label: 'Java Spring Boot', to: '/courses?q=Java', badge: false },
  { label: 'Go & Rust Backend', to: '/courses?q=Rust', badge: false },
  { label: 'Power BI & SQL', to: '/courses?q=Power+BI', badge: false },
  { label: 'Communication Mastery', to: '/courses?q=Communication', badge: true },
  { label: 'Freelance Starter Pro', to: '/courses?q=Freelance', badge: true },
];

const WHY_ITEMS = [
  {
    icon: IconVideo,
    title: 'Fits College Timetables',
    text: 'Live interactive cohorts scheduled to complement college lectures, labs, and semester exams.',
  },
  {
    icon: IconBooks,
    title: 'Outcome-Based Curriculum',
    text: 'Syllabi structured with clear weekly modules that college professors confidently recommend to students.',
  },
  {
    icon: IconClipboardCheck,
    title: 'Portfolio & Placement Proof',
    text: 'Every track ends with practical assignments, real datasets, and ATS-ready project deliverables.',
  },
  {
    icon: IconMessages,
    title: 'Direct Mentor Guidance',
    text: 'Live Google Meet Q&A, code & resume reviews, and clear career roadmaps from industry practitioners.',
  },
];

const STEPS = [
  { num: '01', icon: IconBook2, title: 'Choose a Course', text: 'Browse live career & tech tracks' },
  { num: '02', icon: IconCreditCard, title: 'Pay via Dynamic UPI QR', text: 'Scan or tap UPI app & upload UTR' },
  { num: '03', icon: IconPlayerPlay, title: 'Join Live Classes', text: 'Access Google Meet links & assignments' },
];

const FAQS = [
  {
    value: 'meet-link',
    question: 'How do I join the live classes?',
    answer:
      'Once you enroll and your payment is verified, your Student Dashboard unlocks immediately with direct Google Meet links, class notes, and assignments.',
  },
  {
    value: 'payment',
    question: 'How does the UPI QR enrollment & verification work?',
    answer:
      'Click Enroll Now on any course to open a dynamic UPI QR code with the exact course amount pre-filled. Scan or open GPay/PhonePe/Paytm, then submit your 12-digit UTR and receipt screenshot.',
  },
  {
    value: 'campus',
    question: 'Are these programs suitable for college students and faculty recommendations?',
    answer:
      'Yes. Our Career & Campus Launchpads (₹999–₹2,999) run on student-friendly evening/weekend schedules with structured weekly modules, graded assignments, and completion certificates.',
  },
];

export default function Home() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const {
    data: allCourses = [],
    isLoading: loading,
    error: queryError,
    refetch: loadFeaturedCourses,
  } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCoursesAPI(),
  });

  const courses = allCourses.slice(0, 6);
  const error = queryError
    ? queryError.response?.data?.message || 'Unable to load courses right now. Make sure the server is running.'
    : '';

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/courses?q=${encodeURIComponent(q)}` : '/courses');
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* SECTION 1 — HERO (full bleed with architectural grid & glassmorphism) */}
      <Box className="hero">
        <div className="hero-grid" />
        <Container
          size="lg"
          className="lms-container hero-inner"
          style={{
            paddingTop: 'clamp(64px, 7vw, 104px)',
            paddingBottom: 'clamp(72px, 7.5vw, 104px)',
          }}
        >
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" style={{ alignItems: 'center' }}>
            <div style={{ minWidth: 0 }}>
              <Badge
                variant="light"
                color="gray"
                size="lg"
                radius="xl"
                tt="uppercase"
                fw={600}
                lts="0.06em"
                mb="md"
                leftSection={<IconSparkles size={14} />}
                styles={{
                  root: {
                    background: 'rgba(255,255,255,0.12)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.25)',
                  },
                }}
              >
                Live Campus &amp; Career Platform
              </Badge>
              <Title
                order={1}
                style={{
                  color: 'white',
                  fontSize: 'clamp(2.05rem, 4.1vw, 3.45rem)',
                  lineHeight: 1.08,
                  letterSpacing: '-0.025em',
                  fontWeight: 700,
                }}
              >
                Master <FlipWords words={HERO_WORDS} /> Beyond the College Syllabus
              </Title>
              <Text size="lg" mt="md" style={{ color: 'rgba(255,255,255,0.9)', maxWidth: 530, lineHeight: 1.55 }}>
                Practical live courses in AI, Excel, Placements, Data Science, and Full Stack Engineering—trusted by
                college faculty mentors and built for student employability.
              </Text>

              <form className="hero-search" onSubmit={handleSearch} style={{ marginTop: 28 }}>
                <TextInput
                  variant="unstyled"
                  placeholder="Search AI, Placement, Python, Java, Data Science..."
                  aria-label="Search courses"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  leftSection={<IconSearch size={18} style={{ color: 'rgba(255,255,255,0.75)' }} />}
                  style={{ flexGrow: 1 }}
                />
                <Button
                  type="submit"
                  variant="white"
                  color="indigo"
                  radius="md"
                  size="md"
                  px="xl"
                  styles={{ root: { fontWeight: 700 } }}
                >
                  Search
                </Button>
              </form>

              <Group mt="xl" gap="md" wrap="wrap">
                <Button
                  size="lg"
                  variant="white"
                  color="indigo"
                  component={Link}
                  to="/courses"
                  className="btn-shine"
                  rightSection={<IconChevronRight size={18} />}
                  styles={{ root: { fontWeight: 700 } }}
                >
                  Browse Courses
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  component={Link}
                  to="/about"
                  styles={{
                    root: { borderColor: 'rgba(255,255,255,0.45)', color: 'white', background: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  For Faculty &amp; Campuses
                </Button>
              </Group>
            </div>

            {/* Right — glowing 3D glassmorphism composition */}
            <Box mt={{ base: 'lg', md: 0 }} px={{ base: 0, sm: 'md' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 540, aspectRatio: '16/10', marginInline: 'auto' }}>
                <Box
                  visibleFrom="sm"
                  style={{ position: 'absolute', top: -28, right: 12, transform: 'rotate(14deg)', pointerEvents: 'none' }}
                >
                  <Box className="hero-float" style={{ width: 92, height: 92, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.35)', boxShadow: '0 0 40px rgba(255,255,255,0.25), inset 0 0 36px rgba(255,255,255,0.16)' }} />
                </Box>

                <Box
                  visibleFrom="sm"
                  style={{ position: 'absolute', bottom: -32, left: -12, transform: 'rotate(-8deg)', pointerEvents: 'none' }}
                >
                  <Box className="hero-float" style={{ width: 136, height: 136, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85), var(--mantine-color-indigo-4) 42%, var(--mantine-color-indigo-6) 78%)', filter: 'blur(2px)', opacity: 0.9 }} />
                </Box>

                <Box style={{ position: 'absolute', inset: 0, transform: 'rotate(-2deg)' }}>
                  <Box className="hero-glass" style={{ position: 'relative', height: '100%', borderRadius: 24, overflow: 'hidden' }}>
                    <div className="hero-sheen" />
                    <img
                      src={heroImg}
                      alt="Live learning illustration"
                      fetchPriority="high"
                      decoding="async"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                </Box>

                <Box visibleFrom="sm" style={{ position: 'absolute', top: '10%', left: -24, transform: 'rotate(12deg)', pointerEvents: 'none' }}>
                  <Box className="hero-glass hero-float" style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box style={{ width: 24, height: 24, borderRadius: 8, background: 'linear-gradient(135deg, var(--mantine-color-indigo-3), var(--mantine-color-teal-4))' }} />
                  </Box>
                </Box>

                <Box className="hero-glass hero-float" style={{ position: 'absolute', bottom: 14, left: 16, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 999, padding: '7px 14px', zIndex: 2 }}>
                  <Box style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: '#22c55e', boxShadow: '0 0 12px rgba(34,197,94,0.9)' }} />
                  <Text size="xs" fw={600} c="white">Live cohort in session</Text>
                </Box>
                <Box className="hero-glass hero-float" style={{ position: 'absolute', top: 14, right: 16, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 999, padding: '7px 14px', zIndex: 2 }}>
                  <IconUsersGroup size={16} color="white" />
                  <Text size="xs" fw={600} c="white">Campus &amp; Faculty Picks</Text>
                </Box>
              </div>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* SECTION 2 — TRUST STRIP */}
      <Container size="lg" className="lms-container" style={{ position: 'relative', zIndex: 2 }}>
        <Paper
          withBorder
          shadow="md"
          p="lg"
          mt={{ base: 'lg', md: -28 }}
          mb="xl"
          style={{ background: 'var(--mantine-color-body)' }}
        >
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            {TRUST_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Group key={item.title} gap="sm" align="flex-start" wrap="nowrap">
                  <ThemeIcon size={38} radius="md" color="indigo" variant="light" style={{ flexShrink: 0 }}>
                    <Icon size={20} />
                  </ThemeIcon>
                  <div style={{ minWidth: 0 }}>
                    <Text fw={600} size="sm">{item.title}</Text>
                    <Text size="xs" c="dimmed" mt={2}>{item.text}</Text>
                  </div>
                </Group>
              );
            })}
          </SimpleGrid>
        </Paper>

        {/* ANIMATED IMPACT BENTO COUNTERS */}
        <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md" mb="xl">
          {IMPACT_METRICS.map((m) => (
            <SpotlightWrap key={m.label}>
              <Paper withBorder p="md" radius="lg" style={{ height: '100%' }}>
                <Text fw={700} c="indigo" style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', lineHeight: 1.1 }}>
                  <AnimatedCounter target={m.target} prefix={m.prefix} suffix={m.suffix} />
                </Text>
                <Text fw={600} size="sm" mt={6}>{m.label}</Text>
                <Text size="xs" c="dimmed" mt={2}>{m.detail}</Text>
              </Paper>
            </SpotlightWrap>
          ))}
        </SimpleGrid>
      </Container>

      {/* SKILL & LANGUAGE MARQUEE */}
      <Box py="md" mb={40}>
        <Container size="lg" className="lms-container" mb="xs">
          <Text size="xs" fw={700} tt="uppercase" c="dimmed" ta="center" lts="0.08em">
            Explore Skills, Career Launchpads &amp; Individual Stack Tracks
          </Text>
        </Container>
        <TrackMarquee items={MARQUEE_TRACKS} />
      </Box>

      {/* SECTION 3 — FEATURED COURSES */}
      <Container size="lg" className="lms-container">
        <ScrollReveal>
          <Group justify="space-between" align="flex-end" mb="xl" wrap="wrap" gap="sm">
            <div style={{ maxWidth: 640 }}>
              <Badge variant="light" color="teal" radius="xl" mb="xs">
                Recommended for Students &amp; College Faculty
              </Badge>
              <Title order={2}>Top Career &amp; Campus Tracks</Title>
              <Text size="md" c="dimmed" mt={4}>
                High-impact, student-friendly programs recommended by professors and placement mentors.
              </Text>
            </div>
            <Button
              variant="light"
              color="indigo"
              component={Link}
              to="/courses"
              rightSection={<IconChevronRight size={16} />}
            >
              View All 56 Courses
            </Button>
          </Group>

          {loading ? (
            <Box className="course-grid" mb={64}>
              {Array.from({ length: 6 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </Box>
          ) : error ? (
            <Box mb={64}>
              <ErrorState message={error} onRetry={loadFeaturedCourses} />
            </Box>
          ) : courses.length > 0 ? (
            <Box className="course-grid" mb={64}>
              {courses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </Box>
          ) : (
            <Box mb={64}>
              <EmptyState icon={IconBook2} title="No featured courses yet." description="New live programs will appear here." />
            </Box>
          )}
        </ScrollReveal>
      </Container>

      {/* SECTION 4 — WHY SKILLCOURSE (Spotlight Bento Grid) */}
      <Box style={{ backgroundColor: 'var(--lms-surface-subtle)', padding: '64px 0' }}>
        <Container size="lg" className="lms-container">
          <ScrollReveal>
            <Group justify="center" mb="xl" style={{ textAlign: 'center' }}>
              <div style={{ maxWidth: 640 }}>
                <Title order={2}>Why Students &amp; Professors Trust SkillCourse</Title>
                <Text size="md" c="dimmed" mt={4}>
                  Everything needed to go from classroom concepts to job-ready offers.
                </Text>
              </div>
            </Group>
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
              {WHY_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <SpotlightWrap key={item.title} style={{ height: '100%' }}>
                    <Card withBorder radius="lg" p="xl" style={{ height: '100%' }}>
                      <ThemeIcon size={48} radius="md" color="indigo" variant="light" mb="md">
                        <Icon size={24} />
                      </ThemeIcon>
                      <Text fw={700} size="md">{item.title}</Text>
                      <Text size="sm" c="dimmed" mt={6} style={{ lineHeight: 1.55 }}>
                        {item.text}
                      </Text>
                    </Card>
                  </SpotlightWrap>
                );
              })}
            </SimpleGrid>
          </ScrollReveal>
        </Container>
      </Box>

      {/* SECTION 5 — HOW IT WORKS */}
      <Container size="lg" className="lms-container">
        <ScrollReveal>
          <Box py={64}>
            <Group justify="center" mb="xl" style={{ textAlign: 'center' }}>
              <div style={{ maxWidth: 640 }}>
                <Title order={2}>Start Learning in Three Simple Steps</Title>
                <Text size="md" c="dimmed" mt={4}>
                  Zero friction from discovery to live Google Meet sessions.
                </Text>
              </div>
            </Group>
            <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
              {STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={step.num} style={{ position: 'relative' }}>
                    {idx < STEPS.length - 1 && (
                      <Box
                        visibleFrom="md"
                        style={{
                          position: 'absolute',
                          top: 28,
                          right: -36,
                          width: 72,
                          height: 1,
                          backgroundColor: 'var(--lms-divider-subtle)',
                          zIndex: 0,
                        }}
                      />
                    )}
                    <SpotlightWrap style={{ height: '100%' }}>
                      <Card withBorder radius="lg" p="xl" style={{ height: '100%', textAlign: 'center' }}>
                        <Box mb="sm" style={{ position: 'relative', zIndex: 1 }}>
                          <ThemeIcon size={56} radius="xl" color="indigo" variant="light" style={{ margin: '0 auto' }}>
                            <Icon size={26} />
                          </ThemeIcon>
                        </Box>
                        <Badge variant="light" color="indigo" size="sm" radius="xl" mb="xs" className="tabular-nums">
                          Step {step.num}
                        </Badge>
                        <Text fw={700} size="md">{step.title}</Text>
                        <Text size="sm" c="dimmed" mt={4}>{step.text}</Text>
                      </Card>
                    </SpotlightWrap>
                  </div>
                );
              })}
            </SimpleGrid>
          </Box>
        </ScrollReveal>
      </Container>

      {/* SECTION 6 — FAQ + FINAL CONVERSION CTA */}
      <Box style={{ backgroundColor: 'var(--lms-surface-subtle)', padding: '64px 0 72px' }}>
        <Container size="lg" className="lms-container">
          <ScrollReveal>
            <div style={{ maxWidth: 760, margin: '0 auto' }}>
              <Group justify="center" mb="xl" style={{ textAlign: 'center' }}>
                <div>
                  <Title order={2}>Frequently Asked Questions</Title>
                  <Text size="md" c="dimmed" mt={4}>
                    Everything students and faculty coordinators need to know.
                  </Text>
                </div>
              </Group>
              <Accordion variant="separated" radius="lg" defaultValue={FAQS[0].value} mb={48}>
                {FAQS.map((faq) => (
                  <Accordion.Item key={faq.value} value={faq.value} style={{ backgroundColor: 'var(--mantine-color-body)' }}>
                    <Accordion.Control fw={600} size="md">
                      {faq.question}
                    </Accordion.Control>
                    <Accordion.Panel>
                      <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                        {faq.answer}
                      </Text>
                    </Accordion.Panel>
                  </Accordion.Item>
                ))}
              </Accordion>

              <Paper
                withBorder
                p="xl"
                radius="lg"
                style={{
                  background: 'var(--lms-surface-accent-soft)',
                  borderLeft: '4px solid var(--mantine-color-indigo-6)',
                }}
              >
                <Group justify="space-between" align="center" wrap="wrap" gap="md">
                  <Stack gap={4} style={{ maxWidth: 460 }}>
                    <Title order={3}>Ready to Upskill Your Career or Campus Batch?</Title>
                    <Text size="sm" c="dimmed">
                      Explore 56+ courses starting at ₹999 or talk directly with our New Delhi team.
                    </Text>
                  </Stack>
                  <Group gap="sm">
                    <Button
                      component={Link}
                      to="/courses"
                      color="indigo"
                      className="btn-shine"
                      rightSection={<IconChevronRight size={16} />}
                    >
                      Explore Courses
                    </Button>
                    <Button component={Link} to="/contact" variant="default">
                      Contact Us
                    </Button>
                  </Group>
                </Group>
              </Paper>
            </div>
          </ScrollReveal>
        </Container>
      </Box>
    </Box>
  );
}
