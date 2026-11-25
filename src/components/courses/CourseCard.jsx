import { memo } from 'react';
import { Card, Image, Badge, Text, Button, Group, Title, Divider, Box, Stack } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconClock, IconArrowRight, IconUser } from '@tabler/icons-react';

const FALLBACK_THUMB =
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600';

const handleImgError = (e) => {
  if (e.currentTarget.dataset.fallbackApplied) return;
  e.currentTarget.dataset.fallbackApplied = 'true';
  e.currentTarget.src = FALLBACK_THUMB;
};

function CourseCard({ course, variant = 'catalog', onOpen = null }) {

  if (variant === 'compact') {
    return (
      <Card withBorder radius="lg" p="md" className="card-hover" style={{ height: '100%' }}>
        <Group align="flex-start" gap="md" wrap="nowrap">
          <Image
            src={course.thumbnail || FALLBACK_THUMB}
            onError={handleImgError}
            width={88}
            height={88}
            radius="md"
            fit="cover"
            alt={course.title}
          />
          <Stack gap={4} style={{ flexGrow: 1, minWidth: 0 }}>
            <Title order={3} size="h4" lineClamp={2}>{course.title}</Title>
            <Text size="xs" c="dimmed" lineClamp={2}>
              {course.shortDescription || course.description}
            </Text>
            <Group gap="xs" mt="xs" wrap="wrap">
              <Badge color="gray" size="sm">{course.level}</Badge>
              <Badge color="indigo" size="sm">{course.duration}</Badge>
            </Group>
          </Stack>
        </Group>
        {onOpen && (
          <Button
            variant="subtle"
            color="indigo"
            fullWidth
            mt="md"
            rightSection={<IconArrowRight size={16} />}
            onClick={() => onOpen(course)}
          >
            Open Course Area
          </Button>
        )}
      </Card>
    );
  }

  const price = course.discountedPrice ?? course.price;
  const hasDiscount = course.discountedPrice != null && course.discountedPrice < course.price;
  const percentOff = hasDiscount && course.price > 0
    ? Math.round((1 - price / course.price) * 100)
    : 0;
  const meta = [
    { icon: IconClock, label: course.duration || 'Self-paced' },
    { icon: IconUser, label: course.instructor || 'Expert mentor' },
  ];

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
          <Image
            src={course.thumbnail || FALLBACK_THUMB}
            onError={handleImgError}
            loading="lazy"
            decoding="async"
            w="100%"
            h="100%"
            fit="cover"
            alt={course.title}
          />
          <Box
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.35) 100%)',
            }}
          />
          <Box style={{ position: 'absolute', top: 12, left: 12 }}>
            <Badge
              variant="filled"
              size="md"
              radius="sm"
              color="dark"
              styles={{ root: { background: 'rgba(0,0,0,0.6)', border: 'none' } }}
            >
              {course.level || 'Live Cohort'}
            </Badge>
          </Box>
          <Box style={{ position: 'absolute', top: 12, right: 12 }}>
            <Badge
              variant="filled"
              size="md"
              radius="sm"
              color="dark"
              styles={{ root: { background: 'rgba(0,0,0,0.6)', border: 'none' } }}
            >
              <Group gap={6} align="baseline" wrap="nowrap" className="tabular-nums">
                <Text span fw={800} c="white" size="sm">
                  {price === 0 ? 'Free' : `₹${Number(price).toLocaleString('en-IN')}`}
                </Text>
                {hasDiscount && (
                  <Text span size="xs" td="line-through" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    ₹{Number(course.price).toLocaleString('en-IN')}
                  </Text>
                )}
              </Group>
            </Badge>
          </Box>
        </Box>
      </Card.Section>

      {course.category?.name && (
        <Group justify="space-between" align="center" gap="xs" mb={4}>
          <Text size="xs" fw={600} tt="uppercase" c="indigo" truncate>
            {course.category.name}
          </Text>
          <Group gap={4} wrap="nowrap">
            {hasDiscount && percentOff > 0 && (
              <Badge variant="filled" color="teal" size="xs" radius="sm" className="tabular-nums">
                {percentOff}% OFF
              </Badge>
            )}
            {course.isFeatured && (
              <Badge variant="light" color="indigo" size="xs" radius="sm">
                Campus Pick
              </Badge>
            )}
          </Group>
        </Group>
      )}
      <Text size="lg" fw={700} lineClamp={2}>
        {course.title}
      </Text>
      <Text size="sm" c="dimmed" lineClamp={3} mt="xs" style={{ flexGrow: 1 }}>
        {course.shortDescription || course.description}
      </Text>

      <Divider my="md" />

      <Group gap="sm" wrap="nowrap" justify="space-between">
        {meta.map((m, idx) => {
          const MIcon = m.icon;
          return (
            <Group key={idx} gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
              <MIcon size={15} color="var(--mantine-color-dimmed)" style={{ flexShrink: 0 }} />
              <Text size="xs" c="dimmed" truncate>{m.label}</Text>
            </Group>
          );
        })}
      </Group>

      <Button
        className="card-cta"
        variant="light"
        color="indigo"
        fullWidth
        mt="md"
        component={Link}
        to={`/courses/${course.slug}`}
        rightSection={<IconArrowRight size={16} />}
      >
        View Course
      </Button>
    </Card>
  );
}

export default memo(CourseCard);