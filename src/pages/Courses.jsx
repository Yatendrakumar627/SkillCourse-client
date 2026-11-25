import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
  ActionIcon,
  Affix,
  Transition,
  Stack,
} from '@mantine/core';
import { getCoursesAPI, getCategoriesAPI } from '../services/api';
import { IconSearch, IconX, IconArrowUp } from '@tabler/icons-react';
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

const LEVEL_OPTIONS = [
  { value: 'all', label: 'All Levels' },
  { value: 'Beginner', label: 'Beginner' },
  { value: 'Intermediate', label: 'Intermediate' },
  { value: 'Advanced', label: 'Advanced' },
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Sort: Featured' },
  { value: 'deals', label: 'Sort: Best Deals (% Off)' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const SUGGESTED_QUERIES = ['AI', 'Placement', 'Python', 'Data Analytics', 'TypeScript', 'Java'];

const effectivePrice = (c) => Number(c.discountedPrice ?? c.price ?? 0);
const discountPercent = (c) => {
  if (c.discountedPrice == null || c.discountedPrice >= c.price || !c.price) return 0;
  return Math.round((1 - c.discountedPrice / c.price) * 100);
};

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 450;
      setShowTop((prev) => (prev === next ? prev : next));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const search = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedLevel = searchParams.get('level') || 'all';
  const sortBy = searchParams.get('sort') || 'featured';

  const updateParam = useCallback((key, value, defaultVal = '') => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === defaultVal) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  const {
    data: courses = [],
    isLoading: coursesLoading,
    error: coursesError,
    refetch: refetchCourses,
  } = useQuery({
    queryKey: ['courses'],
    queryFn: () => getCoursesAPI(),
  });

  const {
    data: rawCategories = [],
    isLoading: catsLoading,
    error: catsError,
    refetch: refetchCats,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesAPI,
  });

  const categories = useMemo(() => {
    return [...rawCategories].sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a.slug);
      const ib = CATEGORY_ORDER.indexOf(b.slug);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
  }, [rawCategories]);

  const loading = coursesLoading || catsLoading;
  const queryErr = coursesError || catsError;
  const error = queryErr ? queryErr.response?.data?.message || 'Failed to load courses' : '';
  const loadCatalog = useCallback(() => {
    refetchCourses();
    refetchCats();
  }, [refetchCourses, refetchCats]);

  // Resolve ?category= whether passed as Mongo _id or category slug
  const resolvedCategoryId = useMemo(() => {
    if (selectedCategory === 'all') return 'all';
    const match = categories.find((c) => c._id === selectedCategory || c.slug === selectedCategory);
    return match ? match._id : 'all';
  }, [selectedCategory, categories]);

  const categoryCounts = useMemo(() => {
    const map = {};
    for (const c of courses) {
      const id = c.category?._id || c.category;
      if (id) map[id] = (map[id] || 0) + 1;
    }
    return map;
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = courses.filter((c) => {
      if (resolvedCategoryId !== 'all') {
        const catId = c.category?._id || c.category;
        if (catId !== resolvedCategoryId) return false;
      }
      if (selectedLevel !== 'all' && c.level !== selectedLevel) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        c.title,
        c.description,
        c.shortDescription,
        c.category?.name,
        c.instructor,
        c.level,
        c.language,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    if (sortBy === 'deals') {
      return [...list].sort((a, b) => discountPercent(b) - discountPercent(a) || effectivePrice(a) - effectivePrice(b));
    }
    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => effectivePrice(a) - effectivePrice(b));
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => effectivePrice(b) - effectivePrice(a));
    }
    return list;
  }, [courses, resolvedCategoryId, selectedLevel, search, sortBy]);

  const hasActiveFilter =
    search.trim() !== '' ||
    resolvedCategoryId !== 'all' ||
    selectedLevel !== 'all' ||
    sortBy !== 'featured';

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
  };

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
          <Badge
            variant="light"
            color="indigo"
            radius="xl"
            size="lg"
            px="md"
            py="sm"
            className="tabular-nums"
            role="status"
            aria-live="polite"
          >
            {countLabel}
          </Badge>
        )}
      </Group>

      {/* Filter bar */}
      <Paper
        withBorder
        radius="lg"
        p="sm"
        mb="xl"
        style={{ background: 'var(--mantine-color-body)', boxShadow: 'var(--mantine-shadow-sm)' }}
      >
          <Group align="center" gap="sm" wrap="wrap" p="xs">
            <TextInput
              placeholder="Search by course, language (Python, Java, Rust), or instructor..."
              aria-label="Search courses"
              value={search}
              onChange={(e) => updateParam('q', e.target.value, '')}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && search) updateParam('q', '', '');
              }}
              leftSection={<IconSearch size={16} />}
              rightSection={
                search ? (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    aria-label="Clear search text"
                    onClick={() => updateParam('q', '', '')}
                  >
                    <IconX size={14} />
                  </ActionIcon>
                ) : null
              }
              style={{ flexGrow: 1, minWidth: 240 }}
            />
            <Select
              aria-label="Filter by difficulty level"
              data={LEVEL_OPTIONS}
              value={selectedLevel}
              onChange={(value) => updateParam('level', value || 'all', 'all')}
              radius="md"
              w={{ base: '48%', sm: 155 }}
            />
            <Select
              aria-label="Sort courses"
              data={SORT_OPTIONS}
              value={sortBy}
              onChange={(value) => updateParam('sort', value || 'featured', 'featured')}
              radius="md"
              w={{ base: '48%', sm: 185 }}
            />
            {hasActiveFilter && (
              <Button
                variant="subtle"
                color="gray"
                onClick={clearFilters}
                leftSection={<IconX size={16} />}
              >
                Reset
              </Button>
            )}
          </Group>

          {categories.length > 0 && (
            <Group gap="xs" px="xs" pb={4} wrap="wrap" role="group" aria-label="Category quick filters">
              <Button
                size="xs"
                radius="xl"
                variant={resolvedCategoryId === 'all' ? 'filled' : 'light'}
                color="indigo"
                aria-pressed={resolvedCategoryId === 'all'}
                onClick={() => updateParam('category', 'all', 'all')}
              >
                All Tracks ({courses.length})
              </Button>
              {categories.map((cat) => {
                const isActive = resolvedCategoryId === cat._id;
                const count = categoryCounts[cat._id] || 0;
                const pillColor = cat.slug === 'career-productivity'
                  ? 'teal'
                  : isActive
                    ? 'indigo'
                    : 'gray';
                return (
                  <Button
                    key={cat._id}
                    size="xs"
                    radius="xl"
                    variant={isActive ? 'filled' : 'light'}
                    color={pillColor}
                    aria-pressed={isActive}
                    onClick={() => updateParam('category', cat._id, 'all')}
                  >
                    {cat.name} ({count})
                  </Button>
                );
              })}
            </Group>
          )}
      </Paper>

      {loading ? (
        <Box className="course-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </Box>
      ) : error ? (
        <ErrorState message={error} onRetry={loadCatalog} />
      ) : filteredCourses.length > 0 ? (
        <Box className="course-grid">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </Box>
      ) : (
        <EmptyState
          tone="dashed"
          title={search.trim() ? `No courses found for "${search.trim()}".` : 'No courses found matching your filters.'}
          description="Try clearing a filter or jump directly to one of our popular topics below."
          action={
            <Stack align="center" gap="sm">
              <Group gap="xs" justify="center" wrap="wrap">
                {SUGGESTED_QUERIES.map((term) => (
                  <Button
                    key={term}
                    size="xs"
                    radius="xl"
                    variant="light"
                    color="indigo"
                    onClick={() => {
                      const next = new URLSearchParams();
                      next.set('q', term);
                      setSearchParams(next, { replace: true });
                    }}
                  >
                    {term}
                  </Button>
                ))}
              </Group>
              {hasActiveFilter && (
                <Button variant="subtle" color="gray" onClick={clearFilters}>
                  Reset all filters
                </Button>
              )}
            </Stack>
          }
        />
      )}

      {/* Floating Back to Top button for long catalog browsing */}
      <Affix position={{ bottom: 24, right: 24 }}>
        <Transition transition="slide-up" mounted={showTop}>
          {(transitionStyles) => (
            <Button
              style={transitionStyles}
              leftSection={<IconArrowUp size={16} />}
              radius="xl"
              color="indigo"
              shadow="md"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Scroll back to top"
            >
              Top
            </Button>
          )}
        </Transition>
      </Affix>
    </Container>
  );
}
