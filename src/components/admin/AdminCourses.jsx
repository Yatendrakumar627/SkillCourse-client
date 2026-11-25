import { useState } from 'react';
import {
  Table, Button, Group, Image, Modal, TextInput, Textarea,
  Select, Checkbox, Stack, Text, Divider,
} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { IconPlus, IconCategory, IconTrash } from '@tabler/icons-react';
import {
  createCourseAPI, updateCourseAPI, deleteCourseAPI,
  createCategoryAPI, deleteCategoryAPI,
} from '../../services/api';
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

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      level: 'Beginner',
      category: '',
      isPublished: false,
    },
  });

  const levelValue = watch('level');
  const categoryValue = watch('category');
  const isPublishedValue = watch('isPublished');

  const handleOpenModal = (course = null) => {
    setSelectedCourse(course);
    if (course) {
      reset({
        title: course.title,
        description: course.description,
        shortDescription: course.shortDescription || '',
        price: course.price,
        discountedPrice: course.discountedPrice ?? '',
        thumbnail: course.thumbnail || '',
        duration: course.duration || '',
        language: course.language || 'English',
        level: course.level || 'Beginner',
        category: course.category?._id || course.category || '',
        instructor: course.instructor || '',
        isPublished: Boolean(course.isPublished),
      });
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
    if (!data.category) {
      notifyError('Category Required', 'Please select a category for the course.');
      return;
    }

    const payload = {
      ...data,
      price: Number(data.price),
      discountedPrice:
        data.discountedPrice === '' || data.discountedPrice === null
          ? null
          : Number(data.discountedPrice),
    };

    setSaving(true);
    try {
      if (selectedCourse) {
        await updateCourseAPI(selectedCourse._id, payload);
      } else {
        await createCourseAPI(payload);
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

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setSavingCategory(true);
    try {
      await createCategoryAPI({ name: newCategoryName.trim() });
      setNewCategoryName('');
      onReload();
      notifySuccess('Category Created', 'New category added.');
    } catch (error) {
      notifyError('Create Failed', 'Could not create category.', error);
    } finally {
      setSavingCategory(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteCategoryAPI(id);
      onReload();
      notifySuccess('Category Removed', 'The category has been deleted.');
    } catch (error) {
      notifyError('Delete Failed', 'Could not delete category.', error);
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
          <Group gap="xs">
            <Button
              variant="default"
              leftSection={<IconCategory size={16} />}
              onClick={() => setCategoryModalOpen(true)}
            >
              Manage Categories
            </Button>
            <Button
              color="indigo"
              leftSection={<IconPlus size={16} />}
              onClick={() => handleOpenModal()}
            >
              Add New Course
            </Button>
          </Group>
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
              value={levelValue || 'Beginner'}
              data={['Beginner', 'Intermediate', 'Advanced']}
              onChange={(val) => setValue('level', val || 'Beginner')}
            />
          </Group>
          <Group grow mb="sm">
            <Select
              label="Category"
              placeholder="Select category"
              required
              value={categoryValue || null}
              data={categories.map((c) => ({ value: c._id, label: c.name }))}
              onChange={(val) => setValue('category', val || '')}
            />
            <TextInput label="Instructor Name" {...register('instructor')} />
          </Group>
          <Checkbox
            label="Publish instantly to users"
            checked={Boolean(isPublishedValue)}
            onChange={(e) => setValue('isPublished', e.currentTarget.checked)}
            mb="lg"
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" color="indigo" loading={saving}>
              Save Course
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Manage Categories Modal */}
      <Modal opened={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} title="Manage Categories">
        <form onSubmit={handleCreateCategory}>
          <Group align="flex-end" mb="md">
            <TextInput
              label="New Category Name"
              placeholder="e.g. Cloud Computing"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
              style={{ flex: 1 }}
            />
            <Button type="submit" color="indigo" loading={savingCategory}>Add</Button>
          </Group>
        </form>
        <Divider mb="md" />
        <Stack gap="xs">
          {categories.length > 0 ? categories.map((cat) => (
            <Group key={cat._id} justify="space-between" p="xs" style={{ border: '1px solid var(--mantine-color-default-border)', borderRadius: 8 }}>
              <Text size="sm" fw={500}>{cat.name}</Text>
              <Button size="xs" color="red" variant="subtle" leftSection={<IconTrash size={14} />} onClick={() => handleDeleteCategory(cat._id)}>
                Delete
              </Button>
            </Group>
          )) : (
            <Text size="sm" c="dimmed" ta="center">No categories yet.</Text>
          )}
        </Stack>
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