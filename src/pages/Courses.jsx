import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Container,
  TextInput,
  Group,
  Paper,
  Button,
  Text,
  Select,
  Breadcrumbs,
  Title,
  Badge,
  Box,
} from '@mantine/core';
import { getCoursesAPI, getCategoriesAPI } from '../services/api';
import { IconSearch, IconX } from '@tabler/icons-react';
import CourseCard from '../components/courses/CourseCard';
import CourseCardSkeleton from '../components/ui/CourseCardSkeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

const CATEGORY_ORDER = [
  'career-productivity',
  'data-science',
  'full-stack-development',
  'web-development',
  'digital-marketing',
  'ui-ux-design',
  'mobile-development',
];

export default function Courses() {
  const [searchParams] = useSearchParams();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategoriesAPI()
      .then((res) => {
        const sorted = [...res].sort((a, b) => {
          const ia = CATEGORY_ORDER.indexOf(a.slug);
          const ib = CATEGORY_ORDER.indexOf(b.slug);
          return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        });
        setCategories(sorted);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const catQuery = selectedCategory === 'all' ? '' : selectedCategory;
    setLoading(true);
    setError('');
    getCoursesAPI(catQuery)
      .then((res) => setCourses(res))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load courses'))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const filteredCourses = courses.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const haystack = [c.title, c.description, c.shortDescription, c.category?.name, c.instructor]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });

  const hasActiveFilter = search.trim() !== '' || selectedCategory !== 'all';

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
  };

  const categoryData = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((c) => ({ value: c._id, label: c.name })),
  ];

  const countLabel = `${filteredCourses.length} course${filteredCourses.length === 1 ? '' : 's'} available`;

  return (
    <Container size="lg" className="lms-container page-shell">
      <Breadcrumbs mb="sm">
        <Text
          component={Link}
          to="/"
          size="sm"
          c="dimmed"
          style={{ textDecoration: 'none' }}
        >
          Home
        </Text>
        <Text size="sm" c="dimmed">Courses</Text>
      </Breadcrumbs>

      <Group justify="space-between" align="flex-end" wrap="wrap" gap="md" mb="xl">
        <Box style={{ maxWidth: 680, minWidth: 0 }}>
          <Badge variant="light" color="teal" radius="xl" mb="xs">
            Built for College Students &amp; Faculty Mentors
          </Badge>
          <Title order={1}>Career-First Course Catalog</Title>
          <Text c="dimmed" mt={4}>
            Flagship campus &amp; placement tracks (₹999–₹2,999) shown first, followed by Data Science, Full Stack, and specialized programs.
          </Text>
        </Box>
        {!loading && !error && (
          <Badge variant="light" color="indigo" radius="xl" size="lg" px="md" py="sm">
            {countLabel}
          </Badge>
        )}
      </Group>

      {/* Sticky filter bar */}
      <div className="sticky-bar">
        <Paper
          withBorder
          radius="lg"
          p="sm"
          mb="xl"
          style={{ background: 'var(--mantine-color-body)', boxShadow: 'var(--mantine-shadow-sm)' }}
        >
          <Group align="center" gap="sm" wrap="wrap" p="xs">
            <TextInput
              placeholder="Search by title, instructor, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftSection={<IconSearch size={16} />}
              style={{ flexGrow: 1, minWidth: 240 }}
            />
            <Select
              data={categoryData}
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value || 'all')}
              radius="md"
              w={{ base: '100%', xs: 230 }}
            />
            {hasActiveFilter && (
              <Button
                variant="subtle"
                color="gray"
                onClick={clearFilters}
                leftSection={<IconX size={16} />}
              >
                Clear
              </Button>
            )}
          </Group>
          {categories.length > 0 && (
            <Group gap="xs" px="xs" pb="xs" wrap="wrap">
              <Button
                size="xs"
                radius="xl"
                variant={selectedCategory === 'all' ? 'filled' : 'light'}
                color="indigo"
                onClick={() => setSelectedCategory('all')}
              >
                All Tracks
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat._id}
                  size="xs"
                  radius="xl"
                  variant={selectedCategory === cat._id ? 'filled' : 'light'}
                  color={cat.slug === 'career-productivity' ? 'teal' : 'gray'}
                  onClick={() => setSelectedCategory(cat._id)}
                >
                  {cat.name}
                </Button>
              ))}
            </Group>
          )}
        </Paper>
      </div>

      {loading ? (
        <Box className="course-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </Box>
      ) : error ? (
        <ErrorState message={error} />
      ) : filteredCourses.length > 0 ? (
        <Box className="course-grid">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </Box>
      ) : (
        <EmptyState
          tone="dashed"
          title="No courses found matching your criteria."
          description="Try shifting your filter or search terms."
          action={
            hasActiveFilter ? (
              <Button variant="light" color="indigo" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null
          }
        />
      )}
    </Container>
  );
}