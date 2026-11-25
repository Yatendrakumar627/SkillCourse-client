import { useCallback, useEffect, useState } from 'react';
import { Container, Title, Text, Button, Group, SimpleGrid, Card, Accordion, Box, ThemeIcon, Badge, Paper, TextInput } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { getCoursesAPI } from '../services/api';
import {
  IconChevronRight, IconVideo, IconBooks, IconUserCheck, IconCompass,
  IconClipboardCheck, IconMessages, IconBook2, IconCreditCard,
  IconLiveView, IconUsersGroup, IconPlayerPlay, IconSearch,
} from '@tabler/icons-react';
import CourseCard from '../components/courses/CourseCard';
import CourseCardSkeleton from '../components/ui/CourseCardSkeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import heroImg from '../assets/hero.png';

const TRUST_ITEMS = [
  { icon: IconLiveView, title: 'Faculty-Aligned Syllabi', text: 'Structured modules & graded tasks' },
  { icon: IconBooks, title: 'Campus Placement Focus', text: 'AI, Excel, aptitude & mock prep' },
  { icon: IconUserCheck, title: 'Student-Friendly Pricing', text: 'Career tracks starting at ₹999' },
  { icon: IconCompass, title: 'Verified Outcomes', text: 'Live mentor feedback & certificates' },
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
  { num: '01', icon: IconBook2, title: 'Choose a Course', text: 'Browse live courses' },
  { num: '02', icon: IconCreditCard, title: 'Complete Enrollment', text: 'Pay & get verified' },
  { num: '03', icon: IconPlayerPlay, title: 'Join Live Classes', text: 'Learn with your cohort' },
];

const FAQS = [
  {
    value: 'meet-link',
    question: 'How do I join the live classes?',
    answer:
      'Once you purchase a course and your manual payment is verified and approved by the admin, you will gain access to your Student Dashboard. Direct Google Meet links for scheduled classes will appear there.',
  },
  {
    value: 'payment',
    question: 'How does manual payment verification work?',
    answer:
      'When purchasing a course, you will be provided with UPI details or bank account details. After transferring the amount, upload a screenshot of the receipt. The admin will check and grant you access to the course within 12-24 hours.',
  },
  {
    value: 'recordings',
    question: 'Are classes recorded?',
    answer:
      'Currently, our focus is purely on live instruction. We will be bringing video recording access in a future update, but currently notes and live cohorts are standard.',
  },
];

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const loadFeaturedCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getCoursesAPI();
      setCourses(res.slice(0, 6));
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load courses right now. Make sure the server is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeaturedCourses();
  }, [loadFeaturedCourses]);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/courses?q=${encodeURIComponent(q)}` : '/courses');
  };

  return (
    <Box style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* SECTION 1 — HERO (full bleed) */}
      <Box className="hero">
        <Container
          size="lg"
          className="lms-container hero-inner"
          style={{
            paddingTop: 'clamp(64px, 7vw, 104px)',
            paddingBottom: 'clamp(64px, 7vw, 96px)',
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
                lts="0.08em"
                mb="md"
                styles={{
                  root: {
                    background: 'rgba(255,255,255,0.12)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.25)',
                  },
                }}
              >
                Live Campus & Career Platform
              </Badge>
              <Title
                order={1}
                style={{
                  color: 'white',
                  fontSize: 'clamp(2rem, 4vw, 3.4rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  fontWeight: 800,
                }}
              >
                Career-Ready Skills Beyond the College Syllabus
              </Title>
              <Text size="lg" mt="md" style={{ color: 'rgba(255,255,255,0.92)', maxWidth: 520 }}>
                Practical live courses in AI, Excel, Placements, Data Analytics, and Coding—trusted by
                college faculty mentors and built for student employability.
              </Text>

              <form className="hero-search" onSubmit={handleSearch} style={{ marginTop: 28 }}>
                <TextInput
                  variant="unstyled"
                  placeholder="Search courses..."
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
                  styles={{ root: { fontWeight: 600 } }}
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
                    root: { borderColor: 'rgba(255,255,255,0.5)', color: 'white', background: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  Explore Learning
                </Button>
              </Group>
            </div>

            {/* Right — glowing 3D glassmorphism composition */}
            <Box mt={{ base: 'lg', md: 0 }} px={{ base: 0, sm: 'md' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 540, aspectRatio: '16/10', marginInline: 'auto' }}>
                {/* glowing ring */}
                <Box
                  visibleFrom="sm"
                  style={{ position: 'absolute', top: -28, right: 12, transform: 'rotate(14deg)', pointerEvents: 'none' }}
                >
                  <Box className="hero-float" style={{ width: 92, height: 92, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.35)', boxShadow: '0 0 40px rgba(255,255,255,0.25), inset 0 0 36px rgba(255,255,255,0.16)' }} />
                </Box>

                {/* glowing orb */}
                <Box
                  visibleFrom="sm"
                  style={{ position: 'absolute', bottom: -32, left: -12, transform: 'rotate(-8deg)', pointerEvents: 'none' }}
                >
                  <Box className="hero-float" style={{ width: 136, height: 136, borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.85), var(--mantine-color-indigo-4) 42%, var(--mantine-color-indigo-6) 78%)', filter: 'blur(2px)', opacity: 0.9 }} />
                </Box>

                {/* main tilted glass panel */}
                <Box style={{ position: 'absolute', inset: 0, transform: 'rotate(-2deg)' }}>
                  <Box className="hero-glass" style={{ position: 'relative', height: '100%', borderRadius: 24, overflow: 'hidden' }}>
                    <div className="hero-sheen" />
                    <img
                      src={heroImg}
                      alt="Live learning illustration"
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Box>
                </Box>

                {/* small gradient tile */}
                <Box visibleFrom="sm" style={{ position: 'absolute', top: '10%', left: -24, transform: 'rotate(12deg)', pointerEvents: 'none' }}>
                  <Box className="hero-glass hero-float" style={{ width: 56, height: 56, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box style={{ width: 24, height: 24, borderRadius: 8, background: 'linear-gradient(135deg, var(--mantine-color-indigo-3), var(--mantine-color-indigo-5))' }} />
                  </Box>
                </Box>

                {/* floating glass chips */}
                <Box className="hero-glass hero-float" style={{ position: 'absolute', bottom: 14, left: 16, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 999, padding: '7px 14px', zIndex: 2 }}>
                  <Box style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: '#22c55e', boxShadow: '0 0 12px rgba(34,197,94,0.9)' }} />
                  <Text size="xs" fw={600} c="white">Live class in progress</Text>
                </Box>
                <Box className="hero-glass hero-float" style={{ position: 'absolute', top: 14, right: 16, display: 'flex', alignItems: 'center', gap: 8, borderRadius: 999, padding: '7px 14px', zIndex: 2 }}>
                  <IconUsersGroup size={16} color="white" />
                  <Text size="xs" fw={600} c="white">Campus & Faculty Picks</Text>
                </Box>
              </div>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* SECTION 2 — TRUST / VALUE STRIP */}
      <Container size="lg" className="lms-container" style={{ position: 'relative', zIndex: 2 }}>
        <Paper
          withBorder
          shadow="md"
          p="lg"
          mt={{ base: 'lg', md: -28 }}
          mb={64}
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
      </Container>

      {/* SECTION 3 — FEATURED COURSES */}
      <Container size="lg" className="lms-container">
        <Group justify="space-between" align="flex-end" mb="xl" wrap="wrap" gap="sm">
          <div style={{ maxWidth: 640 }}>
            <Title order={2}>Top Career & Campus Tracks</Title>
            <Text size="md" c="dimmed" mt={4}>
              High-impact, student-friendly programs recommended by professors and placement mentors.
            </Text>
          </div>
          <Button variant="light" color="indigo" component={Link} to="/courses" rightSection={<IconChevronRight size={16} />}>
            View All
          </Button>
        </Group>

        {loading ? (
          <Box className="course-grid" mb={64}>
            {Array.from({ length: 3 }).map((_, i) => (
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
      </Container>

      {/* SECTION 4 — WHY SKILLCOURSE */}
      <Box style={{ backgroundColor: 'var(--lms-surface-subtle)', padding: '64px 0' }}>
        <Container size="lg" className="lms-container">
          <Group justify="center" mb="xl" style={{ textAlign: 'center' }}>
            <div style={{ maxWidth: 640 }}>
              <Title order={2}>Why SkillCourse?</Title>
              <Text size="md" c="dimmed" mt={4}>
                Everything you need to go from zero to job-ready.
              </Text>
            </div>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            {WHY_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} radius="lg" p="xl" className="card-hover" style={{ height: '100%' }}>
                  <ThemeIcon size={48} radius="md" color="indigo" variant="light" mb="md">
                    <Icon size={24} />
                  </ThemeIcon>
                  <Text fw={700} size="md">{item.title}</Text>
                  <Text size="sm" c="dimmed" mt={6}>
                    {item.text}
                  </Text>
                </Card>
              );
            })}
          </SimpleGrid>
        </Container>
      </Box>

      {/* SECTION 5 — HOW IT WORKS */}
      <Container size="lg" className="lms-container">
        <Box py={64}>
          <Group justify="center" mb="xl" style={{ textAlign: 'center' }}>
            <div style={{ maxWidth: 640 }}>
              <Title order={2}>How It Works</Title>
              <Text size="md" c="dimmed" mt={4}>
                Get started in three simple steps.
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
                  <Card radius="lg" p="xl" style={{ height: '100%', textAlign: 'center' }}>
                    <Box mb="sm" style={{ position: 'relative', zIndex: 1 }}>
                      <ThemeIcon size={56} radius="xl" color="indigo" variant="light" style={{ margin: '0 auto' }}>
                        <Icon size={26} />
                      </ThemeIcon>
                    </Box>
                    <Badge variant="light" color="indigo" size="sm" radius="xl" mb="xs">
                      Step {step.num}
                    </Badge>
                    <Text fw={700} size="md">{step.title}</Text>
                    <Text size="sm" c="dimmed" mt={4}>{step.text}</Text>
                  </Card>
                </div>
              );
            })}
          </SimpleGrid>
        </Box>
      </Container>

      {/* SECTION 6 — FAQ */}
      <Box style={{ backgroundColor: 'var(--lms-surface-subtle)', padding: '64px 0 72px' }}>
        <Container size="lg" className="lms-container">
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <Group justify="center" mb="xl" style={{ textAlign: 'center' }}>
              <div>
                <Title order={2}>Frequently Asked Questions</Title>
                <Text size="md" c="dimmed" mt={4}>
                  Everything you need to know before getting started.
                </Text>
              </div>
            </Group>
            <Accordion variant="separated" radius="lg" defaultValue={FAQS[0].value}>
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
          </div>
        </Container>
      </Box>
    </Box>
  );
}