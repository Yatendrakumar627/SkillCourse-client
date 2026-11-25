import { useState } from 'react';
import { Table, Button, Group, Modal, TextInput, Textarea, Select, Badge } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { IconPlus } from '@tabler/icons-react';
import { createAnnouncementAPI, updateAnnouncementAPI, deleteAnnouncementAPI } from '../../services/api';
import TablePanel from '../ui/TablePanel';
import EmptyState from '../ui/EmptyState';
import ConfirmModal from '../ui/ConfirmModal';
import { notifyError, notifySuccess } from '../../utils/toast';

export default function AdminAnnouncements({ courses, announcements, onReload }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: { course: '', title: '', message: '' },
  });
  const targetCourse = watch('course');

  const handleOpenModal = (ann = null) => {
    setEditingAnn(ann);
    if (ann) {
      reset({
        course: ann.course?._id || ann.course || '',
        title: ann.title || '',
        message: ann.message || '',
      });
    } else {
      reset({ course: '', title: '', message: '' });
    }
    setModalOpen(true);
  };

  const onSubmitAnn = async (data) => {
    setSaving(true);
    try {
      if (editingAnn) {
        await updateAnnouncementAPI(editingAnn._id, data);
      } else {
        await createAnnouncementAPI(data);
      }
      setModalOpen(false);
      onReload();
      notifySuccess(
        editingAnn ? 'Announcement Updated' : 'Announcement Posted',
        editingAnn ? 'Changes saved.' : 'Students have been notified.'
      );
    } catch (error) {
      notifyError('Save Failed', 'Error saving announcement.', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAnnouncementAPI(deleteTarget._id);
      setDeleteTarget(null);
      onReload();
      notifySuccess('Announcement Deleted', 'The announcement has been removed.');
    } catch (error) {
      notifyError('Delete Failed', 'Error deleting announcement.', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <TablePanel
        title="Announcements Logs"
        subtitle="Updates broadcast to students"
        count={announcements.length}
        actions={
          <Button
            color="indigo"
            leftSection={<IconPlus size={16} />}
            onClick={() => handleOpenModal()}
          >
            Broadcast Announcement
          </Button>
        }
      >
        {announcements.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Target</Table.Th>
                <Table.Th>Title</Table.Th>
                <Table.Th>Message</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {announcements.map((ann) => (
                <Table.Tr key={ann._id}>
                  <Table.Td>
                    <Badge color={ann.course ? 'indigo' : 'teal'}>
                      {ann.course ? ann.course.title : 'Global'}
                    </Badge>
                  </Table.Td>
                  <Table.Td fw={500}>{ann.title}</Table.Td>
                  <Table.Td>{ann.message}</Table.Td>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <Button size="xs" variant="default" onClick={() => handleOpenModal(ann)}>Edit</Button>
                      <Button size="xs" color="red" onClick={() => setDeleteTarget(ann)}>Delete</Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <EmptyState title="No announcements yet." description="Broadcast updates to all students or specific courses." />
        )}
      </TablePanel>

      {/* Broadcast / Edit Modal */}
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={editingAnn ? 'Edit Announcement' : 'Broadcast Announcement'}>
        <form onSubmit={handleSubmit(onSubmitAnn)}>
          <Select
            label="Target Course (Optional - leave empty for global)"
            placeholder="Global (all students)"
            searchable
            nothingFoundMessage="No matching course"
            value={targetCourse ?? ''}
            data={[{ value: '', label: 'Global (all students)' }, ...courses.map((c) => ({ value: c._id, label: c.title }))]}
            onChange={(val) => setValue('course', val || '')}
            mb="sm"
          />
          <TextInput label="Announcement Title" required {...register('title')} mb="sm" />
          <Textarea label="Message" required minRows={4} {...register('message')} mb="lg" />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" color="indigo" loading={saving}>
              {editingAnn ? 'Save Changes' : 'Broadcast'}
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete announcement?"
        message={`Remove "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </>
  );
}