import { useEffect, useState } from 'react';
import {
  Select, Button, Table, Modal, TextInput, Textarea, Group,
  FileInput, Badge, Text,
} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { IconPlus, IconUsers, IconDownload, IconStar } from '@tabler/icons-react';
import {
  getAssignmentsAPI, createAssignmentAPI,
  getSubmissionsForAdminAPI, gradeSubmissionAPI,
} from '../../services/api';
import TablePanel from '../ui/TablePanel';
import EmptyState from '../ui/EmptyState';
import { notifyError, notifySuccess } from '../../utils/toast';

export default function AdminAssignments({ courses }) {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignList, setAssignList] = useState([]);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignFile, setAssignFile] = useState(null);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [submissionList, setSubmissionList] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [gradeValue, setGradeValue] = useState('');
  const [feedbackValue, setFeedbackValue] = useState('');
  const [gradingSubmitting, setGradingSubmitting] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0]._id);
    }
  }, [courses, selectedCourseId]);

  useEffect(() => {
    if (!selectedCourseId) return;
    getAssignmentsAPI(selectedCourseId)
      .then((res) => setAssignList(res.assignments || []))
      .catch((err) => console.error(err));
  }, [selectedCourseId]);

  const handleOpenCreateModal = () => {
    reset({ title: '', description: '', dueDate: '' });
    setAssignFile(null);
    setAssignModalOpen(true);
  };

  const onSubmitAssignment = async (data) => {
    setAssignSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('course', selectedCourseId);
      formData.append('title', data.title);
      formData.append('description', data.description);
      if (data.dueDate) {
        formData.append('dueDate', data.dueDate);
      }
      if (assignFile) {
        formData.append('file', assignFile);
      }

      await createAssignmentAPI(selectedCourseId, formData);
      setAssignModalOpen(false);
      setAssignFile(null);
      const res = await getAssignmentsAPI(selectedCourseId);
      setAssignList(res.assignments || []);
      notifySuccess('Assignment Created', 'The assignment has been published.');
    } catch (error) {
      notifyError('Create Failed', 'Error creating assignment.', error);
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleOpenSubmissionsModal = async (assignment) => {
    setActiveAssignment(assignment);
    setLoadingSubmissions(true);
    try {
      const subs = await getSubmissionsForAdminAPI(selectedCourseId, assignment._id);
      setSubmissionList(subs);
      setSubmissionsModalOpen(true);
    } catch (error) {
      notifyError('Load Failed', 'Error loading student submissions.', error);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleOpenGradeModal = (submission) => {
    setActiveSubmission(submission);
    setGradeValue(submission.grade || '');
    setFeedbackValue(submission.feedback || '');
    setGradeModalOpen(true);
  };

  const handleGradeSubmit = async () => {
    if (!gradeValue) {
      notifyError('Action Needed', 'Please select or write a grade.');
      return;
    }
    setGradingSubmitting(true);
    try {
      await gradeSubmissionAPI(selectedCourseId, activeSubmission._id, {
        grade: gradeValue,
        feedback: feedbackValue,
      });
      setGradeModalOpen(false);
      const subs = await getSubmissionsForAdminAPI(selectedCourseId, activeAssignment._id);
      setSubmissionList(subs);
      notifySuccess('Grade Saved', 'The submission has been graded.');
    } catch (error) {
      notifyError('Grading Failed', 'Error grading submission.', error);
    } finally {
      setGradingSubmitting(false);
    }
  };

  return (
    <>
      <Group justify="space-between" align="center" mb="lg">
        <Select
          label="Select Course to View Assignments"
          data={courses.map((c) => ({ value: c._id, label: c.title }))}
          value={selectedCourseId}
          onChange={(val) => setSelectedCourseId(val || '')}
          style={{ width: 350 }}
        />
      </Group>

      {selectedCourseId && (
        <TablePanel
          title="Assignments"
          subtitle="Projects and tasks published to enrolled students"
          count={assignList.length}
          actions={
            <Button
              color="indigo"
              leftSection={<IconPlus size={16} />}
              onClick={handleOpenCreateModal}
            >
              Add Assignment
            </Button>
          }
        >
          {assignList.length > 0 ? (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Assignment Title</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Due Date</Table.Th>
                  <Table.Th>Submissions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {assignList.map((ass) => (
                  <Table.Tr key={ass._id}>
                    <Table.Td fw={500}>{ass.title}</Table.Td>
                    <Table.Td>{ass.description}</Table.Td>
                    <Table.Td>{ass.dueDate ? new Date(ass.dueDate).toLocaleDateString() : 'No Due Date'}</Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        variant="light"
                        color="violet"
                        leftSection={<IconUsers size={14} />}
                        onClick={() => handleOpenSubmissionsModal(ass)}
                      >
                        Grade Solutions
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <EmptyState title="No assignments published for this course yet." />
          )}
        </TablePanel>
      )}

      {/* Create Assignment Modal */}
      <Modal opened={assignModalOpen} onClose={() => setAssignModalOpen(false)} title="Create New Assignment">
        <form onSubmit={handleSubmit(onSubmitAssignment)}>
          <TextInput label="Assignment Title" placeholder="e.g. Build a Todo Application" required {...register('title')} mb="sm" />
          <Textarea label="Instructions / Description" placeholder="Explain what the student should build..." required {...register('description')} mb="sm" />
          <TextInput label="Due Date" type="date" {...register('dueDate')} mb="sm" />
          <FileInput
            label="Attach Material PDF / Handout"
            placeholder="Select file"
            leftSection={<IconPlus size={16} />}
            value={assignFile}
            onChange={setAssignFile}
            mb="lg"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
            <Button type="submit" color="indigo" loading={assignSubmitting}>
              Publish Assignment
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Submissions List Modal */}
      <Modal
        opened={submissionsModalOpen}
        onClose={() => setSubmissionsModalOpen(false)}
        title={`Submissions for: ${activeAssignment?.title}`}
        size="xl"
      >
        {loadingSubmissions ? (
          <Text align="center" py="xl">Loading submissions...</Text>
        ) : submissionList.length > 0 ? (
          <div className="table-scroll">
            <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Student</Table.Th>
                <Table.Th>Response Text</Table.Th>
                <Table.Th>Solution File</Table.Th>
                <Table.Th>Grade / Feedback</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {submissionList.map((sub) => (
                <Table.Tr key={sub._id}>
                  <Table.Td>
                    <Text fw={500}>{sub.student?.name}</Text>
                    <Text size="xs" c="dimmed">{sub.student?.email}</Text>
                  </Table.Td>
                  <Table.Td>{sub.submissionText || '-'}</Table.Td>
                  <Table.Td>
                    {sub.filePath ? (
                      <Button
                        size="xs"
                        variant="subtle"
                        leftSection={<IconDownload size={14} />}
                        component="a"
                        href={`http://localhost:5000${sub.filePath}`}
                        target="_blank"
                      >
                        Attachment
                      </Button>
                    ) : (
                      <Text size="xs" c="dimmed">No attachment</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    {sub.grade ? (
                      <div>
                        <Badge color="green">{sub.grade}</Badge>
                        {sub.feedback && <Text size="xs" c="dimmed" mt={4}>{sub.feedback}</Text>}
                      </div>
                    ) : (
                      <Badge color="gray">UNGRADED</Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      color="indigo"
                      leftSection={<IconStar size={12} />}
                      onClick={() => handleOpenGradeModal(sub)}
                    >
                      Grade
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            </Table>
          </div>
        ) : (
          <EmptyState title="No student submissions received for this assignment yet." />
        )}
      </Modal>

      {/* Grade Submission Modal */}
      <Modal opened={gradeModalOpen} onClose={() => setGradeModalOpen(false)} title="Grade Student Submission">
        <Select
          label="Grade"
          required
          placeholder="Select grade"
          data={['A+', 'A', 'B+', 'B', 'C', 'Pass', 'Fail']}
          value={gradeValue}
          onChange={(val) => setGradeValue(val || '')}
          mb="sm"
        />
        <Textarea
          label="Feedback / Comments"
          placeholder="Provide brief comments for the student..."
          value={feedbackValue}
          onChange={(e) => setFeedbackValue(e.target.value)}
          minRows={3}
          mb="lg"
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setGradeModalOpen(false)}>Cancel</Button>
          <Button
            color="indigo"
            onClick={handleGradeSubmit}
            loading={gradingSubmitting}
          >
            Submit Grade & Feedback
          </Button>
        </Group>
      </Modal>
    </>
  );
}