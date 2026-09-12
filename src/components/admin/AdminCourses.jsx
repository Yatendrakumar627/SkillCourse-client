import { useState } from 'react';
import {
  Table, Button, Group, Image, Modal, TextInput, Textarea,
  Select, Checkbox,
} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { IconPlus } from '@tabler/icons-react';
import { createCourseAPI, updateCourseAPI, deleteCourseAPI } from '../../services/api';
import TablePanel from '../ui/TablePanel';
import StatusBadge from '../ui/StatusBadge';
import ConfirmModal from '../ui/ConfirmModal';
import EmptyState from '../ui/EmptyState';
import { notifyError, notifySuccess } from '../../utils/toast';

export default function AdminCourses({ courses, categories, onReload }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm();

  const handleOpenModal = (course = null) => {
    setSelectedCourse(course);
    if (course) {
      setValue('title', course.title);
      setValue('description', course.description);
      setValue('shortDescription', course.shortDescription || '');
      setValue('price', course.price);
      setValue('discountedPrice', course.discountedPrice || '');
      setValue('thumbnail', course.thumbnail || '');
      setValue('duration', course.duration || '');
      setValue('language', course.language || 'English');
      setValue('level', course.level || 'Beginner');
      setValue('category', course.category?._id || '');
      setValue('instructor', course.instructor || '');
      setValue('isPublished', course.isPublished || false);
    } else {
      reset({
        title: '', description: '', shortDescription: '', price: 0,
        discountedPrice: '', thumbnail: '', duration: '', language: 'English',
        level: 'Beginner', category: '', instructor: '', isPublished: false,
      });
    }
    setModalOpen(true);
  };

  const onSubmitCourse = async (data) => {
    setSaving(true);
    try {
      if (selectedCourse) {
        await updateCourseAPI(selectedCourse._id, data);
      } else {
        await createCourseAPI(data);
      }
      setModalOpen(false);
      onReload();
      notifySuccess(selectedCourse ? 'Course Updated' : 'Course Created', selectedCourse ? 'Changes have been saved.' : 'The course is now listed.');
    } catch (error) {
      notifyError('Save Failed', 'Error processing course.', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteCourseAPI(deleteTarget._id);
      setDeleteTarget(null);
      onReload();
      notifySuccess('Course Deleted', 'The course and its data have been removed.');
    } catch (error) {
      notifyError('Delete Failed', 'Error deleting course.', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <TablePanel
        title="All Live Programs"
        subtitle="Courses currently in the catalog"
        count={courses.length}
        actions={
          <Button
            color="indigo"
            leftSection={<IconPlus size={16} />}
            onClick={() => handleOpenModal()}
          >
            Add New Course
          </Button>
        }
      >
        {courses.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Thumbnail</Table.Th>
                <Table.Th>Course Title</Table.Th>
                <Table.Th>Instructor</Table.Th>
                <Table.Th>Price</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {courses.map((c) => (
                <Table.Tr key={c._id}>
                  <Table.Td>
                    <Image src={c.thumbnail || 'https://placehold.co/100x60'} height={40} width={70} radius="sm" />
                  </Table.Td>
                  <Table.Td fw={500}>{c.title}</Table.Td>
                  <Table.Td>{c.instructor}</Table.Td>
                  <Table.Td>₹{c.discountedPrice || c.price}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={c.isPublished ? 'published' : 'draft'} />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <Button size="xs" variant="default" onClick={() => handleOpenModal(c)}>Edit</Button>
                      <Button size="xs" color="red" onClick={() => setDeleteTarget(c)}>Delete</Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <EmptyState title="No courses yet" description="Create your first live program to get started." />
        )}
      </TablePanel>

      {/* Create / Edit Course Modal */}
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={selectedCourse ? 'Edit Course' : 'Create Course'} size="lg">
        <form onSubmit={handleSubmit(onSubmitCourse)}>
          <TextInput label="Course Title" required {...register('title')} mb="sm" />
          <TextInput label="Short Description (max 150 chars)" maxLength={150} {...register('shortDescription')} mb="sm" />
          <Textarea label="Syllabus/Full Description" required {...register('description')} minRows={4} mb="sm" />
          <Group grow mb="sm">
            <TextInput label="Base Price (₹)" required type="number" {...register('price')} />
            <TextInput label="Discounted Price (₹)" type="number" {...register('discountedPrice')} />
          </Group>
          <Group grow mb="sm">
            <TextInput label="Duration (e.g. 6 Weeks)" {...register('duration')} />
            <TextInput label="Thumbnail Link" {...register('thumbnail')} />
          </Group>
          <Group grow mb="sm">
            <TextInput label="Language" {...register('language')} />
            <Select
              label="Difficulty Level"
              defaultValue="Beginner"
              data={['Beginner', 'Intermediate', 'Advanced']}
              onChange={(val) => setValue('level', val)}
            />
          </Group>
          <Group grow mb="sm">
            <Select
              label="Category"
              placeholder="Select category"
              required
              data={categories.map((c) => ({ value: c._id, label: c.name }))}
              onChange={(val) => setValue('category', val)}
            />
            <TextInput label="Instructor Name" {...register('instructor')} />
          </Group>
          <Checkbox label="Publish instantly to users" {...register('isPublished')} mb="lg" />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" color="indigo" loading={saving}>
              Save Course
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete course?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </>
  );
}