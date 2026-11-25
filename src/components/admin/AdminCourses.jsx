import { useMemo, useState } from 'react';
import {
  Table, Button, Group, Image, Modal, TextInput, Textarea,
  Select, Checkbox, Stack, Text, Divider, Badge, SimpleGrid,
} from '@mantine/core';
import { useForm } from 'react-hook-form';
import { IconPlus, IconCategory, IconTrash, IconSearch, IconStar } from '@tabler/icons-react';
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

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      level: 'Beginner',
      category: '',
      isPublished: false,
      isFeatured: false,
      displayOrder: 100,
    },
  });

  const levelValue = watch('level');
  const categoryValue = watch('category');
  const isPublishedValue = watch('isPublished');
  const isFeaturedValue = watch('isFeatured');

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    return courses.filter((c) => {
      if (filterCategory !== 'all' && String(c.category?._id || c.category || '') !== filterCategory) {
        return false;
      }
      if (filterStatus === 'published' && !c.isPublished) return false;
      if (filterStatus === 'draft' && c.isPublished) return false;
      if (!q) return true;
      return (
        (c.title || '').toLowerCase().includes(q) ||
        (c.instructor || '').toLowerCase().includes(q)
      );
    });
  }, [courses, search, filterCategory, filterStatus]);

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
        isFeatured: Boolean(course.isFeatured),
        displayOrder: course.displayOrder ?? 100,
      });
    } else {
      reset({
        title: '', description: '', shortDescription: '', price: 0,
        discountedPrice: '', thumbnail: '', duration: '', language: 'English',
        level: 'Beginner', category: '', instructor: '',
        isPublished: false, isFeatured: false, displayOrder: 100,
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
      displayOrder:
        data.displayOrder === '' || data.displayOrder === null
          ? 100
          : Number(data.displayOrder),
      isFeatured: Boolean(data.isFeatured),
      isPublished: Boolean(data.isPublished),
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
        count={filteredCourses.length}
        actions={
          <Group gap="xs" wrap="wrap">
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
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mb="md">
          <TextInput
            placeholder="Search by course title or instructor..."
            leftSection={<IconSearch size={15} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <Select
            value={filterCategory}
            onChange={(val) => setFilterCategory(val || 'all')}
            data={[
              { value: 'all', label: 'All Categories' },
              ...categories.map((cat) => ({ value: cat._id, label: cat.name })),
            ]}
          />
          <Select
            value={filterStatus}
            onChange={(val) => setFilterStatus(val || 'all')}
            data={[
              { value: 'all', label: 'All Statuses' },
              { value: 'published', label: 'Published Only' },
              { value: 'draft', label: 'Drafts Only' },
            ]}
          />
        </SimpleGrid>

        {filteredCourses.length > 0 ? (
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
              {filteredCourses.map((c) => {
                const effectivePrice = c.discountedPrice ?? c.price;
                const hasDiscount = c.discountedPrice != null && c.discountedPrice < c.price;
                return (
                  <Table.Tr key={c._id}>
                    <Table.Td>
                      <Image src={c.thumbnail || 'https://placehold.co/100x60'} height={40} width={70} radius="sm" />
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>{c.title}</Text>
                      <Group gap={6} mt={2} wrap="wrap">
                        {c.category?.name && (
                          <Badge size="xs" variant="light" color="indigo">{c.category.name}</Badge>
                        )}
                        {c.isFeatured && (
                          <Badge size="xs" variant="light" color="yellow" leftSection={<IconStar size={10} />}>
                            Featured
                          </Badge>
                        )}
                        <Text size="xs" c="dimmed" className="tabular-nums">#{c.displayOrder ?? 100}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>{c.instructor || '—'}</Table.Td>
                    <Table.Td className="tabular-nums">
                      ₹{effectivePrice}
                      {hasDiscount && (
                        <Text span size="xs" c="dimmed" td="line-through" ml={6}>
                          ₹{c.price}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <StatusBadge status={c.isPublished ? 'published' : 'draft'} />
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs" wrap="nowrap">
                        <Button size="xs" variant="default" onClick={() => handleOpenModal(c)}>Edit</Button>
                        <Button size="xs" color="red" onClick={() => setDeleteTarget(c)}>Delete</Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        ) : (
          <EmptyState
            title={courses.length === 0 ? 'No courses yet' : 'No matching courses found'}
            description={courses.length === 0 ? 'Create your first live program to get started.' : 'Try adjusting your search or filter selections.'}
          />
        )}
      </TablePanel>

      {/* Create / Edit Course Modal */}
      <Modal opened={modalOpen} onClose={() => setModalOpen(false)} title={selectedCourse ? 'Edit Course' : 'Create Course'} size="lg">
        <form onSubmit={handleSubmit(onSubmitCourse)}>
          <TextInput label="Course Title" required {...register('title')} mb="sm" />
          <TextInput label="Short Description (max 150 chars)" maxLength={150} {...register('shortDescription')} mb="sm" />
          <Textarea label="Syllabus/Full Description" required {...register('description')} minRows={4} mb="sm" />
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mb="sm">
            <TextInput label="Base Price (₹)" required type="number" min={0} {...register('price')} />
            <TextInput label="Discounted Price (₹)" type="number" min={0} {...register('discountedPrice')} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mb="sm">
            <TextInput label="Duration (e.g. 6 Weeks)" {...register('duration')} />
            <TextInput label="Thumbnail Link" {...register('thumbnail')} />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mb="sm">
            <TextInput label="Language" {...register('language')} />
            <Select
              label="Difficulty Level"
              value={levelValue || 'Beginner'}
              data={['Beginner', 'Intermediate', 'Advanced']}
              onChange={(val) => setValue('level', val || 'Beginner')}
            />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mb="sm">
            <Select
              label="Category"
              placeholder="Select category"
              required
              searchable
              value={categoryValue || null}
              data={categories.map((c) => ({ value: c._id, label: c.name }))}
              onChange={(val) => setValue('category', val || '')}
            />
            <TextInput label="Instructor Name" {...register('instructor')} />
          </SimpleGrid>
          <TextInput
            label="Catalog Display Order"
            type="number"
            description="Lower numbers appear first in Browse Courses (default 100)"
            {...register('displayOrder')}
            mb="sm"
          />
          <Group gap="lg" wrap="wrap" mb="lg">
            <Checkbox
              label="Publish instantly to users"
              checked={Boolean(isPublishedValue)}
              onChange={(e) => setValue('isPublished', e.currentTarget.checked)}
            />
            <Checkbox
              label="Feature on Home page"
              checked={Boolean(isFeaturedValue)}
              onChange={(e) => setValue('isFeatured', e.currentTarget.checked)}
            />
          </Group>
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