import { useState } from 'react';
import {
  Card, Text, Title, Button, Group, Grid, Stack, Badge, SimpleGrid,
  Modal, Textarea, FileInput, Image, Progress, ThemeIcon, Box,
} from '@mantine/core';
import { Link } from 'react-router-dom';
import {
  IconArrowLeft, IconArrowRight, IconDownload, IconClipboardCheck, IconUpload,
  IconBook2, IconCalendar, IconClipboardList,
} from '@tabler/icons-react';
import { getModulesAPI, getAssignmentsAPI, submitAssignmentAPI } from '../../services/api';
import EmptyState from '../ui/EmptyState';
import LoadingState from '../ui/LoadingState';
import SectionHeader from '../ui/SectionHeader';
import { notifyError, notifySuccess } from '../../utils/toast';

const FALLBACK_THUMB =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600';

function EnrolledCourseCard({ data, onOpen }) {
  const { course, upcoming, assignCount, submitCount, showProgress } = data;
  const upcomingDate = upcoming
    ? new Date(upcoming.date || upcoming.startTime)
    : null;

  return (
    <Card
      withBorder
      radius="lg"
      p="lg"
      className="card-hover"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <Card.Section mb="md" className="img-zoom">
        <Box style={{ aspectRatio: '16/10', position: 'relative' }}>
          <Image src={course.thumbnail || FALLBACK_THUMB} w="100%" h="100%" fit="cover" alt={course.title} />
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.3) 100%)',
            }}
          />
        </Box>
      </Card.Section>

      <Group gap="xs" wrap="wrap">
        <Badge color="gray" variant="light" size="sm" radius="sm">{course.level}</Badge>
        <Badge color="indigo" variant="light" size="sm" radius="sm">{course.duration}</Badge>
      </Group>

      <Text size="lg" fw={700} lineClamp={2} mt="xs">{course.title}</Text>

      <Stack gap={6} mt="sm" style={{ flexGrow: 1 }}>
        {upcomingDate && (
          <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
            <IconCalendar size={15} color="var(--mantine-color-dimmed)" style={{ flexShrink: 0 }} />
            <Text size="sm" c="dimmed" truncate>
              Next: {upcoming.topic} ·{' '}
              {upcomingDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </Text>
          </Group>
        )}
        {assignCount > 0 && (
          <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
            <IconClipboardList size={15} color="var(--mantine-color-dimmed)" style={{ flexShrink: 0 }} />
            <Text size="sm" c="dimmed">
              {assignCount} assignment{assignCount === 1 ? '' : 's'}
            </Text>
          </Group>
        )}
      </Stack>

      {showProgress && (
        <Box mt="md">
          <Group justify="space-between" mb={4} wrap="nowrap">
            <Text size="xs" c="dimmed">Assignments progress</Text>
            <Text size="xs" fw={700}>{submitCount}/{assignCount}</Text>
          </Group>
          <Progress color="indigo" radius="xl" size="sm" value={(submitCount / assignCount) * 100} />
        </Box>
      )}

      <Button
        fullWidth
        mt="md"
        color="indigo"
        rightSection={<IconArrowRight size={16} />}
        onClick={() => onOpen(course)}
      >
        Continue Learning
      </Button>
    </Card>
  );
}

export default function StudentCourses({
  courses,
  classes = [],
  assignments = [],
  submissions = [],
}) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [courseAssignments, setCourseAssignments] = useState([]);
  const [submissionList, setSubmissionList] = useState([]);
  const [loadingCourseData, setLoadingCourseData] = useState(false);

  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submittingSolution, setSubmittingSolution] = useState(false);

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    setLoadingCourseData(true);
    try {
      const [modRes, assRes] = await Promise.all([
        getModulesAPI(course._id),
        getAssignmentsAPI(course._id),
      ]);
      setModules(modRes);
      setCourseAssignments(assRes.assignments || []);
      setSubmissionList(assRes.submissions || []);
    } catch (error) {
      console.error('Error loading course materials', error);
    } finally {
      setLoadingCourseData(false);
    }
  };

  const handleBack = () => {
    setSelectedCourse(null);
    setModules([]);
    setCourseAssignments([]);
    setSubmissionList([]);
  };

  const handleOpenSubmitModal = (assignment) => {
    setActiveAssignment(assignment);
    setSubmissionText('');
    setSubmissionFile(null);
    setSubmitModalOpen(true);
  };

  const handleSolutionSubmit = async () => {
    if (!submissionText.trim() && !submissionFile) {
      notifyError('Action Needed', 'Please provide some text answers or upload a solution file.');
      return;
    }
    setSubmittingSolution(true);
    try {
      const formData = new FormData();
      formData.append('assignment', activeAssignment._id);
      if (submissionText) {
        formData.append('submissionText', submissionText);
      }
      if (submissionFile) {
        formData.append('file', submissionFile);
      }

      const newSub = await submitAssignmentAPI(selectedCourse._id, activeAssignment._id, formData);
      setSubmissionList((prev) => {
        const filtered = prev.filter((s) => s.assignment !== activeAssignment._id);
        return [...filtered, newSub];
      });
      setSubmitModalOpen(false);
      notifySuccess('Assignment Submitted', 'Your solution has been submitted for review.');
    } catch (error) {
      notifyError('Submit Failed', 'Error submitting solution. Please try again.', error);
    } finally {
      setSubmittingSolution(false);
    }
  };

  // ---- Course Overview (list) ----
  if (!selectedCourse) {
    if (courses.length === 0) {
      return (
        <EmptyState
          icon={IconBook2}
          title="No courses yet"
          description="You haven't enrolled in a course yet. Explore our live learning programs and start building new skills."
          action={
            <Button color="indigo" component={Link} to="/courses">
              Browse Courses
            </Button>
          }
        />
      );
    }

    const now = Date.now();
    const cardData = courses.map((course) => {
      const id = String(course._id);
      const courseAssign = assignments.filter((a) => String(a._courseId) === id);
      const courseSubs = submissions.filter((s) => String(s._courseId) === id);
      const upcoming = classes
        .filter(
          (c) =>
            String(c.course?._id || c.course) === id &&
            new Date(c.date || c.startTime || 0) > now
        )
        .sort((a, b) => new Date(a.date || a.startTime) - new Date(b.date || b.startTime))[0];
      const assignCount = courseAssign.length;
      const submitCount = courseSubs.length;
      return {
        course,
        upcoming,
        assignCount,
        submitCount,
        showProgress: assignCount > 0 && submitCount > 0,
      };
    });

    return (
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {cardData.map((data) => (
          <EnrolledCourseCard key={data.course._id} data={data} onOpen={handleSelectCourse} />
        ))}
      </SimpleGrid>
    );
  }

  // ---- Course Area (detail) ----
  return (
    <div>
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={handleBack}
        mb="md"
      >
        Back to Courses
      </Button>

      <Card withBorder radius="lg" p="lg" mb="lg">
        <Group align="flex-start" wrap="wrap" gap="md">
          <Image
            src={selectedCourse.thumbnail || FALLBACK_THUMB}
            width={120}
            height={90}
            radius="md"
            fit="cover"
            alt={selectedCourse.title}
          />
          <div style={{ flex: 1, minWidth: 240 }}>
            <Title order={2}>{selectedCourse.title}</Title>
            <Text size="sm" c="dimmed" mt={4}>Instructor: {selectedCourse.instructor}</Text>
            {courseAssignments.length > 0 && (
              <Group mt="md" gap="sm" wrap="nowrap">
                <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                  {submissionList.length}/{courseAssignments.length} submitted
                </Text>
                <Progress
                  color="indigo"
                  radius="xl"
                  size="sm"
                  value={(submissionList.length / courseAssignments.length) * 100}
                  style={{ maxWidth: 200, flexGrow: 1 }}
                />
              </Group>
            )}
          </div>
        </Group>
      </Card>

      {loadingCourseData ? (
        <LoadingState label="Loading course content..." />
      ) : (
        <Grid>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <SectionHeader title="Curriculum &amp; Modules" />
            {modules.length > 0 ? (
              <Stack gap="sm">
                {modules.map((mod, idx) => (
                  <Card key={mod._id} withBorder shadow="none" p="md" radius="lg">
                    <Group gap="sm" align="flex-start" wrap="nowrap">
                      <ThemeIcon size={28} radius="md" color="indigo" variant="light">
                        <Text size="sm" fw={700}>{idx + 1}</Text>
                      </ThemeIcon>
                      <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <Text fw={700} size="sm">{mod.title}</Text>
                        {mod.description && (
                          <Text size="xs" c="dimmed" mt={4}>{mod.description}</Text>
                        )}
                      </div>
                    </Group>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">No syllabus modules added yet.</Text>
            )}
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 5 }}>
            <SectionHeader title="Assignments &amp; Resources" />
            {courseAssignments.length > 0 ? (
              <Stack gap="md">
                {courseAssignments.map((ass) => {
                  const existingSub = submissionList.find((s) => s.assignment === ass._id);
                  return (
                    <Card key={ass._id} withBorder p="md" radius="lg">
                      <Text fw={700} size="sm">{ass.title}</Text>
                      <Text size="xs" c="dimmed" mt={4}>{ass.description}</Text>
                      {ass.dueDate && (
                        <Text size="xs" c="red" fw={500} mt={4}>
                          Due: {new Date(ass.dueDate).toLocaleDateString()}
                        </Text>
                      )}

                      {ass.filePath && (
                        <Button
                          variant="subtle"
                          size="xs"
                          leftSection={<IconDownload size={14} />}
                          component="a"
                          href={`http://localhost:5000${ass.filePath}`}
                          target="_blank"
                          mt="xs"
                        >
                          Download Material
                        </Button>
                      )}

                      <Group justify="space-between" mt="md">
                        {existingSub ? (
                          <div>
                            <Badge color={existingSub.grade ? 'green' : 'yellow'} variant="light">
                              {existingSub.grade ? `Graded: ${existingSub.grade}` : 'Submitted'}
                            </Badge>
                            {existingSub.feedback && (
                              <Text size="xs" c="indigo" mt={4}>
                                Feedback: {existingSub.feedback}
                              </Text>
                            )}
                          </div>
                        ) : (
                          <Button
                            size="xs"
                            variant="light"
                            color="indigo"
                            leftSection={<IconClipboardCheck size={14} />}
                            onClick={() => handleOpenSubmitModal(ass)}
                          >
                            Submit Solution
                          </Button>
                        )}
                      </Group>
                    </Card>
                  );
                })}
              </Stack>
            ) : (
              <Text size="sm" c="dimmed">No assignments published for this course yet.</Text>
            )}
          </Grid.Col>
        </Grid>
      )}

      {/* Submission Modal */}
      <Modal
        opened={submitModalOpen}
        onClose={() => setSubmitModalOpen(false)}
        title={`Submit Solution: ${activeAssignment?.title}`}
      >
        <Text size="sm" mb="md">{activeAssignment?.description}</Text>

        <Textarea
          label="Your Answers / Response text"
          placeholder="Write your explanation or code notes here..."
          value={submissionText}
          onChange={(e) => setSubmissionText(e.target.value)}
          minRows={4}
          mb="md"
        />

        <FileInput
          label="Attach Solution Document/Screenshot (Optional)"
          placeholder="Select file"
          leftSection={<IconUpload size={16} />}
          value={submissionFile}
          onChange={setSubmissionFile}
          mb="lg"
        />

        <Group justify="flex-end">
          <Button variant="default" onClick={() => setSubmitModalOpen(false)}>Cancel</Button>
          <Button
            color="indigo"
            loading={submittingSolution}
            onClick={handleSolutionSubmit}
          >
            Submit Solution
          </Button>
        </Group>
      </Modal>
    </div>
  );
}