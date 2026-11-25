import { useEffect, useState } from 'react';
import {
  Select, Button, Table, Modal, TextInput, Textarea, Group,
} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { IconPlus } from '@tabler/icons-react';
import { getModulesAPI, createModuleAPI, deleteModuleAPI } from '../../services/api';
import TablePanel from '../ui/TablePanel';
import EmptyState from '../ui/EmptyState';
import ConfirmModal from '../ui/ConfirmModal';
import { notifyError, notifySuccess } from '../../utils/toast';

export default function AdminCurriculum({ courses }) {
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0]._id);
    }
  }, [courses, selectedCourseId]);

  useEffect(() => {
    if (!selectedCourseId) return;
    setLoadingModules(true);
    getModulesAPI(selectedCourseId)
      .then((res) => setModules(res))
      .catch((err) => console.error(err))
      .finally(() => setLoadingModules(false));
  }, [selectedCourseId]);

  const handleModalOpen = () => {
    reset({ title: '', description: '', order: 0 });
    setModalOpen(true);
  };

  const onSubmitModule = async (data) => {
    setSubmitting(true);
    try {
      await createModuleAPI(selectedCourseId, {
        course: selectedCourseId,
        title: data.title,
        description: data.description,
        order: data.order,
      });
      setModalOpen(false);
      const res = await getModulesAPI(selectedCourseId);
      setModules(res);
      notifySuccess('Module Added', 'The module was added to the curriculum.');
    } catch (error) {
      notifyError('Create Failed', 'Error creating module.', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteModuleAPI(selectedCourseId, deleteTarget._id);
      const res = await getModulesAPI(selectedCourseId);
      setModules(res);
      setDeleteTarget(null);
      notifySuccess('Module Deleted', 'The module has been removed.');
    } catch (error) {
      notifyError('Delete Failed', 'Error deleting module.', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Group justify="space-between" align="center" mb="lg">
        <Select
          label="Select Course to Edit Curriculum"
          data={courses.map((c) => ({ value: c._id, label: c.title }))}
          value={selectedCourseId}
          onChange={(val) => setSelectedCourseId(val || '')}
          style={{ width: 350 }}
        />
      </Group>

      {selectedCourseId && (
        <TablePanel
          title="Course Curriculum"
          subtitle="Learning modules that make up the syllabus"
          count={modules.length}
          actions={
            <Button
              color="indigo"
              leftSection={<IconPlus size={16} />}
              onClick={handleModalOpen}
            >
              Add Curriculum Module
            </Button>
          }
        >
          {modules.length > 0 ? (
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Order</Table.Th>
                  <Table.Th>Module Title</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {modules.map((mod) => (
                  <Table.Tr key={mod._id}>
                    <Table.Td fw={700}>{mod.order}</Table.Td>
                    <Table.Td fw={500}>{mod.title}</Table.Td>
                    <Table.Td>{mod.description || '-'}</Table.Td>
                    <Table.Td>
                      <Button size="xs" color="red" onClick={() => setDeleteTarget(mod)}>Delete</Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <EmptyState
              title={loadingModules ? 'Loading modules...' : 'No curriculum modules found'}
              description="Add modules to build the course syllabus."
            />
          )}
        </TablePanel>
      )}

      {/* Create Module Modal */}
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title="Add Curriculum Module">
        <form onSubmit={handleSubmit(onSubmitModule)}>
          <TextInput label="Module Title" placeholder="e.g. Module 1: Introduction to JavaScript" required {...register('title')} mb="sm" />
          <Textarea label="Brief Description / Topics covered" placeholder="Variables, functions, array methods..." {...register('description')} mb="sm" />
          <TextInput label="Sort Order" type="number" defaultValue="0" {...register('order')} mb="lg" />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" color="indigo" loading={submitting}>
              Add Module
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete module?"
        message={`Delete "${deleteTarget?.title}" from the syllabus?`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </>
  );
}