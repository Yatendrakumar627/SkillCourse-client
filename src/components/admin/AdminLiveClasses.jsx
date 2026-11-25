import { useState } from 'react';
import { Table, Button, Group, Modal, TextInput, Select } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { IconPlus } from '@tabler/icons-react';
import { createLiveClassAPI, deleteLiveClassAPI } from '../../services/api';
import TablePanel from '../ui/TablePanel';
import EmptyState from '../ui/EmptyState';
import ConfirmModal from '../ui/ConfirmModal';
import { notifyError, notifySuccess } from '../../utils/toast';

export default function AdminLiveClasses({ courses, classes, onReload }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: { course: '', topic: '', meetLink: '', date: '', notesUrl: '' },
  });
  const selectedCourse = watch('course');

  const handleOpenModal = () => {
    reset({ course: '', topic: '', meetLink: '', date: '', notesUrl: '' });
    setModalOpen(true);
  };

  const onSubmitClass = async (data) => {
    if (!data.course) {
      notifyError('Course Required', 'Please select a course for this live class.');
      return;
    }
    setSaving(true);
    try {
      await createLiveClassAPI(data);
      setModalOpen(false);
      onReload();
      notifySuccess('Class Scheduled', 'Students can now join the live class.');
    } catch (error) {
      notifyError('Scheduling Failed', 'Error scheduling class.', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteLiveClassAPI(deleteTarget._id);
      setDeleteTarget(null);
      onReload();
      notifySuccess('Class Removed', 'The live class has been deleted.');
    } catch (error) {
      notifyError('Delete Failed', 'Error deleting class.', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <TablePanel
        title="Scheduled Meet Cohorts"
        subtitle="Live Google Meet sessions for enrolled students"
        count={classes.length}
        actions={
          <Button
            color="indigo"
            leftSection={<IconPlus size={16} />}
            onClick={handleOpenModal}
          >
            Schedule Cohort Class
          </Button>
        }
      >
        {classes.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Course</Table.Th>
                <Table.Th>Topic</Table.Th>
                <Table.Th>Scheduled Date/Time</Table.Th>
                <Table.Th>Meet Link</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {classes.map((cls) => (
                <Table.Tr key={cls._id}>
                  <Table.Td>{cls.course?.title}</Table.Td>
                  <Table.Td fw={500}>{cls.topic}</Table.Td>
                  <Table.Td>{new Date(cls.date).toLocaleString()}</Table.Td>
                  <Table.Td>
                    <a href={cls.meetLink} target="_blank" rel="noreferrer">Meet Link</a>
                  </Table.Td>
                  <Table.Td>
                    <Button size="xs" color="red" onClick={() => setDeleteTarget(cls)}>Delete</Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <EmptyState title="No live classes scheduled." description="Schedule a Google Meet cohort class for your students." />
        )}
      </TablePanel>

      {/* Schedule Class Modal */}
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Cohort Class">
        <form onSubmit={handleSubmit(onSubmitClass)}>
          <Select
            label="Course"
            required
            placeholder="Select course"
            value={selectedCourse || null}
            data={courses.map((c) => ({ value: c._id, label: c.title }))}
            onChange={(val) => setValue('course', val || '')}
            mb="sm"
          />
          <TextInput label="Class Topic" required {...register('topic')} mb="sm" />
          <TextInput label="Google Meet Link" required placeholder="https://meet.google.com/..." {...register('meetLink')} mb="sm" />
          <TextInput label="Date & Time" type="datetime-local" required {...register('date')} mb="sm" />
          <TextInput label="Optional Notes/PDF Link" placeholder="http://..." {...register('notesUrl')} mb="lg" />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" color="indigo" loading={saving}>
              Schedule
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete scheduled class?"
        message={`Delete the "${deleteTarget?.topic}" session?`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </>
  );
}