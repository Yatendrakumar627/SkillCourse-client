import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  Container, Title, Text, Grid, Card, Image, Button, Group, Badge, Modal,
  FileInput, Alert, Stack, TextInput, Accordion, Paper, ThemeIcon, List,
  Breadcrumbs, Stepper, Box, SimpleGrid, Tabs, CopyButton, ActionIcon,
  Tooltip, Center,
} from '@mantine/core';
import {
  getCourseDetailsAPI, submitPaymentAPI, getMyEnrollmentsAPI, getModulesAPI, getPaymentConfigAPI,
} from '../services/api';
import { useAuthStore } from '../store/authStore';
import {
  IconUpload, IconHourglassHigh, IconCheck, IconInfoCircle, IconCode,
  IconClock, IconLanguage, IconUser, IconTrophy, IconArrowRight, IconArrowLeft,
  IconQrcode, IconBuildingBank, IconCopy, IconExternalLink,
} from '@tabler/icons-react';
import LoadingState from '../components/ui/LoadingState';
import SectionHeader from '../components/ui/SectionHeader';
import { notifySuccess } from '../utils/toast';

const UTR_REGEX = /^[A-Za-z0-9]{8,30}$/;

export default function CourseDetails() {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const [course, setCourse] = useState(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null); // 'none', 'pending', 'approved', 'rejected'
  const [rejectionReason, setRejectionReason] = useState('');
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchCourseDetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCourseDetailsAPI(slug);
      setCourse(data);

      const moduleRes = await getModulesAPI(data._id);
      setModules(moduleRes);

      if (isAuthenticated) {
        const enrolls = await getMyEnrollmentsAPI();
        const existing = enrolls.find((e) => e.course?._id === data._id);
        if (existing) {
          if (existing.accessGranted) {
            setEnrollmentStatus('approved');
            setRejectionReason('');
          } else if (existing.paymentId?.status === 'rejected') {
            setEnrollmentStatus('rejected');
            setRejectionReason(existing.paymentId?.rejectionReason || '');
          } else {
            setEnrollmentStatus('pending');
            setRejectionReason('');
          }
        } else {
          setEnrollmentStatus('none');
          setRejectionReason('');
        }
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [slug, isAuthenticated]);

  useEffect(() => {
    fetchCourseDetails();
  }, [fetchCourseDetails]);

  useEffect(() => {
    if (modalOpen) {
      setActiveStep(0);
      setErrorMessage('');
      if (isAuthenticated && !paymentConfig) {
        getPaymentConfigAPI()
          .then((cfg) => setPaymentConfig(cfg))
          .catch(() => {});
      }
    }
  }, [modalOpen, isAuthenticated, paymentConfig]);

  useEffect(() => {
    if (!screenshot) {
      setScreenshotPreview('');
      return undefined;
    }
    const url = URL.createObjectURL(screenshot);
    setScreenshotPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [screenshot]);

  const price = course ? (course.discountedPrice || course.price) : 0;
  const referenceNote = useMemo(() => {
    if (!course) return '';
    const coursePart = course._id?.slice(-4)?.toUpperCase() || 'CRS';
    const userPart = user?._id?.slice(-4)?.toUpperCase() || 'USR';
    return `SC-${coursePart}-${userPart}`;
  }, [course, user]);

  const upiId = paymentConfig?.upiId || 'pay@skillcourse';
  const upiName = paymentConfig?.upiName || 'SkillCourse Education';
  const upiUri = useMemo(() => {
    if (!course) return '';
    const params = new URLSearchParams({
      pa: upiId,
      pn: upiName,
      am: Number(price).toFixed(2),
      cu: 'INR',
      tn: referenceNote,
    });
    return `upi://pay?${params.toString()}`;
  }, [course, upiId, upiName, price, referenceNote]);

  useEffect(() => {
    if (!modalOpen || !upiUri) return;
    QRCode.toDataURL(upiUri, { width: 200, margin: 1, errorCorrectionLevel: 'H' })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''));
  }, [modalOpen, upiUri]);

  const handlePaymentSubmit = async () => {
    const cleanTx = transactionId.trim().toUpperCase();
    if (!UTR_REGEX.test(cleanTx)) {
      setErrorMessage('Enter a valid 8–30 character UTR / Transaction Reference ID');
      return;
    }
    if (!screenshot) {
      setErrorMessage('Please select a payment screenshot receipt');
      return;
    }
    setSubmitting(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('course', course._id);
      formData.append('transactionId', cleanTx);
      formData.append('screenshot', screenshot);

      await submitPaymentAPI(formData);
      setModalOpen(false);
      setEnrollmentStatus('pending');
      setTransactionId('');
      setScreenshot(null);
      notifySuccess('Payment Receipt Submitted', 'Admin will verify and approve your enrollment soon.');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error uploading receipt. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading course details..." fullPage />;
  }

  if (!course) {
    return (
      <Container size="lg" className="lms-container" py="xl" ta="center">
        <Text size="lg" c="red">Course not found!</Text>
        <Button mt="md" component={Link} to="/courses">Back to Courses</Button>
      </Container>
    );
  }

  const hasDiscount = !!course.discountedPrice && course.discountedPrice < course.price;
  const percentOff = hasDiscount ? Math.round((1 - course.discountedPrice / course.price) * 100) : 0;
  const saved = hasDiscount ? course.price - course.discountedPrice : 0;

  const heroMeta = [
    { icon: IconUser, label: 'Instructor', value: course.instructor },
    { icon: IconTrophy, label: 'Level', value: course.level },
    { icon: IconClock, label: 'Duration', value: course.duration },
    { icon: IconLanguage, label: 'Language', value: course.language },
  ];

  const courseInfo = [
    { label: 'Level', value: course.level },
    { label: 'Category', value: course.category?.name || 'General' },
    { label: 'Duration', value: course.duration },
    { label: 'Language', value: course.language },
    { label: 'Instructor', value: course.instructor },
    {
      label: 'Last updated',
      value: course.updatedAt
        ? new Date(course.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : '—',
    },
  ];

  const isValidUtr = UTR_REGEX.test(transactionId.trim());
  const stepNextDisabled = activeStep === 1 && (!isValidUtr || !screenshot);

  return (
    <>
      {/* PREMIUM HERO BANNER */}
      <div
        style={{
          backgroundColor: 'var(--mantine-color-indigo-9)',
          color: 'white',
          padding: '28px 0 52px',
          marginBottom: '48px',
        }}
      >
        <Container size="lg" className="lms-container">
          <Breadcrumbs
            mb="xl"
            separator={<Text size="sm" style={{ color: 'rgba(255,255,255,0.4)' }}>/</Text>}
          >
            <Text
              component={Link}
              to="/"
              size="sm"
              style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
            >
              Home
            </Text>
            <Text
              component={Link}
              to="/courses"
              size="sm"
              style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
            >
              Courses
            </Text>
            <Text size="sm" fw={600} c="white" truncate style={{ maxWidth: 260 }}>
              {course.title}
            </Text>
          </Breadcrumbs>

          <Grid align="flex-start" gutter="xl">
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Group gap="sm" mb="md">
                <Badge color="indigo" variant="light" size="lg" radius="sm" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}>
                  {course.category?.name || 'Live Class'}
                </Badge>
                <Badge color="gray" variant="light" size="lg" radius="sm" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}>
                  {course.level}
                </Badge>
              </Group>
              <Title order={1} style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.6rem)', fontWeight: 800, lineHeight: 1.12, color: 'white' }}>
                {course.title}
              </Title>
              <Text size="xl" mt="lg" style={{ color: 'rgba(255, 255, 255, 0.82)', maxWidth: 600, lineHeight: 1.55 }}>
                {course.shortDescription}
              </Text>

              <Group mt="xl" gap="lg" wrap="wrap">
                {heroMeta.map((item) => {
                  const MIcon = item.icon;
                  return (
                    <Group key={item.label} gap="xs" align="flex-start" wrap="nowrap" style={{ minWidth: 130 }}>
                      <ThemeIcon size={40} radius="md" variant="filled" color="white" style={{ background: 'rgba(255,255,255,0.14)', color: 'white', flexShrink: 0 }}>
                        <MIcon size={20} />
                      </ThemeIcon>
                      <div>
                        <Text size="xs" tt="uppercase" fw={700} style={{ color: 'rgba(255,255,255,0.65)' }}>
                          {item.label}
                        </Text>
                        <Text size="md" fw={600} c="white" style={{ lineHeight: 1.3 }}>
                          {item.value || '—'}
                        </Text>
                      </div>
                    </Group>
                  );
                })}
              </Group>
            </Grid.Col>

            {/* Enrollment / Pricing card */}
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Card shadow="lg" radius="lg" withBorder className="sticky-side" style={{ backgroundColor: 'var(--mantine-color-body)' }}>
                <Card.Section>
                  <Image
                    src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500'}
                    height={200}
                    alt={course.title}
                  />
                </Card.Section>

                <Group justify="space-between" align="flex-start" mt="lg" wrap="nowrap">
                  <div style={{ minWidth: 0 }}>
                    <Group gap={10} align="baseline" wrap="nowrap">
                      <Text fw={800} style={{ fontSize: '2rem', color: 'var(--mantine-color-indigo-6)', lineHeight: 1 }}>
                        ₹{price}
                      </Text>
                      {hasDiscount && (
                        <Text size="md" c="dimmed" td="line-through">
                          ₹{course.price}
                        </Text>
                      )}
                    </Group>
                    {hasDiscount && (
                      <Text size="xs" c="green" fw={700} mt={2}>
                        Save ₹{saved}
                      </Text>
                    )}
                  </div>
                  {hasDiscount && (
                    <Badge color="teal" variant="light" size="md" radius="sm">
                      {percentOff}% OFF
                    </Badge>
                  )}
                </Group>

                <div style={{ marginTop: 20 }}>
                  {!isAuthenticated ? (
                    <Button
                      fullWidth
                      size="lg"
                      color="indigo"
                      component={Link}
                      to="/login"
                      radius="md"
                    >
                      Login to Enroll
                    </Button>
                  ) : enrollmentStatus === 'approved' ? (
                    <Button
                      fullWidth
                      size="lg"
                      color="teal"
                      leftSection={<IconCheck size={20} />}
                      component={Link}
                      to="/dashboard"
                      radius="md"
                    >
                      Go to Dashboard
                    </Button>
                  ) : enrollmentStatus === 'pending' ? (
                    <>
                      <Button
                        fullWidth
                        disabled
                        size="lg"
                        color="yellow"
                        leftSection={<IconHourglassHigh size={20} />}
                        radius="md"
                      >
                        Verification Pending
                      </Button>
                      <Alert icon={<IconInfoCircle size={16} />} title="Pending Approval" color="yellow" mt="lg" radius="md">
                        Our support team is checking your payment. Standard verification takes 1-2 hours.
                      </Alert>
                    </>
                  ) : enrollmentStatus === 'rejected' ? (
                    <Stack gap={10}>
                      <Alert icon={<IconInfoCircle size={16} />} title="Previous Payment Rejected" color="red" radius="md">
                        {rejectionReason || 'Your previous payment could not be verified.'} You can submit a new receipt below.
                      </Alert>
                      <Button
                        fullWidth
                        size="lg"
                        color="indigo"
                        onClick={() => setModalOpen(true)}
                        radius="md"
                        rightSection={<IconArrowRight size={18} />}
                      >
                        Re-submit Payment
                      </Button>
                    </Stack>
                  ) : (
                    <Stack gap={8}>
                      <Text size="xs" c="dimmed" ta="center">
                        Manual payment via UPI / Bank — verified by our team.
                      </Text>
                      <Button
                        fullWidth
                        size="lg"
                        color="indigo"
                        onClick={() => setModalOpen(true)}
                        radius="md"
                        rightSection={<IconArrowRight size={18} />}
                      >
                        Enroll Now
                      </Button>
                    </Stack>
                  )}
                </div>

                <List mt="xl" spacing="sm" size="sm" c="dimmed" icon={
                  <ThemeIcon color="teal" size={24} radius="xl">
                    <IconCheck size={16} />
                  </ThemeIcon>
                }>
                  <List.Item>Live Interactive Sessions on Google Meet</List.Item>
                  <List.Item>Premium Downloadable Resources</List.Item>
                  <List.Item>Direct Instructor Q&A and Mentoring</List.Item>
                  <List.Item>Verified Digital Certificate on Completion</List.Item>
                </List>
              </Card>
            </Grid.Col>
          </Grid>
        </Container>
      </div>

      <Container size="lg" className="lms-container" py="lg" style={{ textAlign: 'left' }}>
        <Grid gutter="40px">
          {/* Main Content Area */}
          <Grid.Col span={{ base: 12, md: 8 }}>
            <SectionHeader title="About This Course" />
            <Text size="lg" style={{ whiteSpace: 'pre-line', lineHeight: 1.7 }} mb="xl">
              {course.description}
            </Text>

            {modules.length > 0 && (
              <>
                <SectionHeader title="What You'll Learn" subtitle="Highlights from this program" />
                <Paper withBorder p="xl" radius="lg" mb="xl">
                  <List spacing="md" size="md" icon={
                    <ThemeIcon color="teal" size={24} radius="xl">
                      <IconCheck size={16} />
                    </ThemeIcon>
                  }>
                    {modules.map((mod) => (
                      <List.Item key={mod._id}>{mod.title}</List.Item>
                    ))}
                  </List>
                </Paper>
              </>
            )}

            <SectionHeader title="Course Information" subtitle="Quick facts about this program" />
            <SimpleGrid cols={{ base: 1, sm: 2 }} mb="xl" spacing="md">
              {courseInfo.map((info) => (
                <Paper key={info.label} withBorder p="md" radius="md">
                  <Text size="xs" tt="uppercase" fw={700} c="dimmed">{info.label}</Text>
                  <Text size="md" fw={600} mt={2}>{info.value || '—'}</Text>
                </Paper>
              ))}
            </SimpleGrid>

            <SectionHeader title="Course Syllabus" subtitle="Structured curriculum modules" />
            {modules.length > 0 ? (
              <Stack gap="md" mb="xl">
                {modules.map((mod, idx) => (
                  <Paper key={mod._id} withBorder p="lg" radius="md" shadow="xs" style={{ borderLeft: '4px solid var(--mantine-color-indigo-6)' }}>
                    <Text fw={800} size="sm" tt="uppercase" c="indigo" lts={1}>Module {idx + 1}</Text>
                    <Title order={4} mt="xs" mb="sm">{mod.title}</Title>
                    {mod.description && (
                      <Text size="sm" c="dimmed">{mod.description}</Text>
                    )}
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Text c="dimmed" mb="xl">The curriculum is currently being updated by the instructor.</Text>
            )}

            <SectionHeader title="Frequently Asked Questions" />
            <Accordion variant="separated" radius="md" mb="xl">
              <Accordion.Item value="when">
                <Accordion.Control>When will the live classes take place?</Accordion.Control>
                <Accordion.Panel>Class schedules are usually shared on the Dashboard under the 'Live Classes' tab immediately after enrollment. Most classes happen on weekends or evenings.</Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="recording">
                <Accordion.Control>Will I get recordings of the live sessions?</Accordion.Control>
                <Accordion.Panel>This is an intensive live cohort. Currently, we focus purely on real-time interaction and do not officially host video recordings on the platform, although instructors may share private drive links.</Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="refund">
                <Accordion.Control>What is the refund policy?</Accordion.Control>
                <Accordion.Panel>Due to the live interactive nature of the cohorts, we do not offer refunds once you have attended the first class. Please verify the curriculum carefully before enrolling.</Accordion.Panel>
              </Accordion.Item>
            </Accordion>

            <Paper withBorder p="xl" radius="lg" mb="xl" style={{ backgroundColor: 'var(--lms-surface-subtle)' }}>
              <SectionHeader title="Prerequisites & Requirements" subtitle="What you need to get started" />
              <List spacing="sm" size="md" icon={
                <ThemeIcon color="indigo" size={24} radius="xl">
                  <IconCode size={16} />
                </ThemeIcon>
              }>
                <List.Item>A working computer with internet access.</List.Item>
                <List.Item>No prior programming experience strictly required, but logical thinking helps.</List.Item>
                <List.Item>Willingness to learn and actively participate in live sessions.</List.Item>
              </List>
            </Paper>
          </Grid.Col>
        </Grid>

        {/* Enhanced 3-Step UPI QR + Proof Checkout Modal */}
        <Modal
          opened={modalOpen}
          onClose={() => setModalOpen(false)}
          title={<Text fw={700} size="lg">Complete Your Enrollment</Text>}
          size="lg"
          overlayProps={{ blur: 3 }}
        >
          <Text size="sm" c="dimmed" mb="md">
            Enroll in <strong>{course.title}</strong> for <strong>₹{price}</strong>. Pay via dynamic UPI QR or bank transfer, then upload your UTR &amp; receipt.
          </Text>

          <Stepper
            active={activeStep}
            onStepClick={setActiveStep}
            allowNextStepsSelect={false}
            color="indigo"
            size="sm"
          >
            {/* Step 1: Pay via UPI QR, App Intent, or Bank Transfer */}
            <Stepper.Step label="Pay" description={`₹${price}`}>
              <Tabs value={paymentMethod} onChange={(val) => setPaymentMethod(val || 'upi')} mt="sm">
                <Tabs.List grow>
                  <Tabs.Tab value="upi" leftSection={<IconQrcode size={16} />}>
                    UPI / QR (Instant)
                  </Tabs.Tab>
                  <Tabs.Tab value="bank" leftSection={<IconBuildingBank size={16} />}>
                    Bank Transfer
                  </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="upi" pt="md">
                  <Paper withBorder p="md" radius="md" style={{ backgroundColor: 'var(--lms-surface-accent-soft)' }}>
                    <Grid align="center" gutter="md">
                      <Grid.Col span={{ base: 12, sm: 5 }}>
                        <Center>
                          <Paper withBorder p="xs" radius="md" style={{ background: '#ffffff', textAlign: 'center' }}>
                            {qrDataUrl ? (
                              <Image src={qrDataUrl} w={172} h={172} alt="Dynamic UPI Payment QR" />
                            ) : (
                              <Box w={172} h={172} />
                            )}
                            <Text size="xs" fw={700} c="dark" mt={4}>
                              Scan to pay ₹{price}
                            </Text>
                          </Paper>
                        </Center>
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, sm: 7 }}>
                        <Stack gap="xs">
                          <Text size="xs" tt="uppercase" fw={700} style={{ color: 'var(--lms-text-accent)' }}>
                            Amount &amp; Reference Auto-Filled
                          </Text>
                          <Group justify="space-between" wrap="nowrap">
                            <Text size="sm">UPI ID: <strong>{upiId}</strong></Text>
                            <CopyButton value={upiId}>
                              {({ copied, copy }) => (
                                <Tooltip label={copied ? 'Copied' : 'Copy UPI ID'}>
                                  <ActionIcon variant="subtle" color={copied ? 'teal' : 'indigo'} onClick={copy}>
                                    {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </CopyButton>
                          </Group>
                          <Group justify="space-between" wrap="nowrap">
                            <Text size="sm">Exact Amount: <strong>₹{price}</strong></Text>
                            <CopyButton value={String(price)}>
                              {({ copied, copy }) => (
                                <Tooltip label={copied ? 'Copied' : 'Copy Amount'}>
                                  <ActionIcon variant="subtle" color={copied ? 'teal' : 'indigo'} onClick={copy}>
                                    {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </CopyButton>
                          </Group>
                          <Group justify="space-between" wrap="nowrap">
                            <Text size="sm">Note / Ref: <strong>{referenceNote}</strong></Text>
                            <CopyButton value={referenceNote}>
                              {({ copied, copy }) => (
                                <Tooltip label={copied ? 'Copied' : 'Copy Note'}>
                                  <ActionIcon variant="subtle" color={copied ? 'teal' : 'indigo'} onClick={copy}>
                                    {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </CopyButton>
                          </Group>
                          <Button
                            component="a"
                            href={upiUri}
                            color="indigo"
                            variant="filled"
                            size="sm"
                            mt={4}
                            rightSection={<IconExternalLink size={15} />}
                          >
                            Open UPI App (GPay / PhonePe / Paytm)
                          </Button>
                        </Stack>
                      </Grid.Col>
                    </Grid>
                  </Paper>
                </Tabs.Panel>

                <Tabs.Panel value="bank" pt="md">
                  <Paper
                    withBorder
                    p="md"
                    radius="md"
                    style={{
                      backgroundColor: 'var(--lms-surface-accent-soft)',
                      borderLeft: '4px solid var(--mantine-color-indigo-6)',
                    }}
                  >
                    <Stack gap="xs">
                      <Text size="sm">
                        Account Name: <strong>{paymentConfig?.bankName || 'SkillCourse Education'}</strong>
                      </Text>
                      <Group justify="space-between" wrap="nowrap">
                        <Text size="sm">
                          A/C Number: <strong>{paymentConfig?.accountNumber || '1234567890'}</strong>
                        </Text>
                        <CopyButton value={paymentConfig?.accountNumber || '1234567890'}>
                          {({ copied, copy }) => (
                            <ActionIcon variant="subtle" color={copied ? 'teal' : 'indigo'} onClick={copy}>
                              {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
                            </ActionIcon>
                          )}
                        </CopyButton>
                      </Group>
                      <Group justify="space-between" wrap="nowrap">
                        <Text size="sm">
                          IFSC Code: <strong>{paymentConfig?.ifsc || 'SKILL0001'}</strong>
                        </Text>
                        <CopyButton value={paymentConfig?.ifsc || 'SKILL0001'}>
                          {({ copied, copy }) => (
                            <ActionIcon variant="subtle" color={copied ? 'teal' : 'indigo'} onClick={copy}>
                              {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
                            </ActionIcon>
                          )}
                        </CopyButton>
                      </Group>
                      <Text size="xs" c="dimmed">
                        Add remark <strong>{referenceNote}</strong> while sending via IMPS / NEFT / RTGS.
                      </Text>
                    </Stack>
                  </Paper>
                </Tabs.Panel>
              </Tabs>
              <Text size="xs" c="dimmed" mt="sm">
                After completing ₹{price} payment, copy the 12-digit UTR / Reference ID and click <strong>Next</strong>.
              </Text>
            </Stepper.Step>

            {/* Step 2: UTR + Screenshot Proof together */}
            <Stepper.Step label="Payment Proof" description="UTR & receipt">
              <Stack gap="md" mt="sm">
                <TextInput
                  label="12-Digit UTR / Transaction Reference Number"
                  placeholder="e.g. 412345678901"
                  description="Find the 12-digit UTR in your GPay, PhonePe, Paytm, or bank SMS confirmation."
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                  error={transactionId && !isValidUtr ? 'Use 8–30 letters/numbers (no spaces or symbols)' : ''}
                  required
                  radius="md"
                />
                <FileInput
                  label="Payment Proof Screenshot"
                  placeholder="Choose image file (JPG, PNG, WebP)"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  leftSection={<IconUpload size={16} />}
                  description="Upload a clear screenshot showing the UTR and ₹ amount (max 5 MB)."
                  value={screenshot}
                  onChange={setScreenshot}
                  required
                  radius="md"
                />
                {screenshotPreview && (
                  <Paper withBorder p="xs" radius="md">
                    <Text size="xs" c="dimmed" mb={6}>Receipt preview:</Text>
                    <Image src={screenshotPreview} mah={160} fit="contain" radius="sm" alt="Receipt preview" />
                  </Paper>
                )}
              </Stack>
            </Stepper.Step>

            {/* Step 3: Review & Confirm */}
            <Stepper.Step label="Confirm" description="Verify & submit">
              <Stack gap="md" mt="sm">
                <Paper withBorder p="md" radius="md">
                  <Stack gap={8}>
                    <Group justify="space-between" wrap="nowrap">
                      <Text size="sm" c="dimmed">Course</Text>
                      <Text size="sm" fw={600} truncate style={{ maxWidth: 260 }}>{course.title}</Text>
                    </Group>
                    <Group justify="space-between" wrap="nowrap">
                      <Text size="sm" c="dimmed">Amount</Text>
                      <Text size="sm" fw={600}>₹{price}</Text>
                    </Group>
                    <Group justify="space-between" wrap="nowrap">
                      <Text size="sm" c="dimmed">UTR / Reference ID</Text>
                      <Text size="sm" fw={600} truncate style={{ maxWidth: 260 }}>{transactionId.trim()}</Text>
                    </Group>
                    <Group justify="space-between" wrap="nowrap">
                      <Text size="sm" c="dimmed">Receipt</Text>
                      <Text size="sm" fw={600} truncate style={{ maxWidth: 260 }}>{screenshot?.name || '—'}</Text>
                    </Group>
                  </Stack>
                </Paper>
                <Alert icon={<IconInfoCircle size={16} />} color="yellow" radius="md">
                  {paymentConfig?.autoVerifyEnabled
                    ? 'Automated UTR verification is active. Your enrollment unlocks as soon as the bank credit matches.'
                    : 'Our support team reviews every UTR and receipt manually. Most verifications complete within 1–2 hours.'}
                </Alert>
              </Stack>
            </Stepper.Step>
          </Stepper>

          {errorMessage && (
            <Text size="xs" c="red" mt="sm">{errorMessage}</Text>
          )}

          <Group justify="space-between" mt="xl">
            <Button variant="subtle" color="gray" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Group gap="sm">
              {activeStep > 0 && (
                <Button
                  variant="default"
                  onClick={() => setActiveStep((s) => s - 1)}
                  leftSection={<IconArrowLeft size={16} />}
                >
                  Back
                </Button>
              )}
              {activeStep < 2 ? (
                <Button
                  color="indigo"
                  onClick={() => setActiveStep((s) => s + 1)}
                  disabled={stepNextDisabled}
                  rightSection={<IconArrowRight size={16} />}
                >
                  {activeStep === 0 ? 'I Have Paid — Next' : 'Next'}
                </Button>
              ) : (
                <Button
                  color="indigo"
                  onClick={handlePaymentSubmit}
                  loading={submitting}
                  leftSection={<IconCheck size={16} />}
                >
                  Submit for Verification
                </Button>
              )}
            </Group>
          </Group>
        </Modal>
      </Container>
    </>
  );
}