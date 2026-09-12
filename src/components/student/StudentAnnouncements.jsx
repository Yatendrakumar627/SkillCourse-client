import { Card, Text, Group, Badge, ThemeIcon, Stack } from '@mantine/core';
import { IconBell } from '@tabler/icons-react';
import EmptyState from '../ui/EmptyState';

export default function StudentAnnouncements({ announcements }) {
  if (announcements.length === 0) {
    return (
      <EmptyState
        icon={IconBell}
        title="No announcements yet"
        description="Important updates from your instructors will appear here."
      />
    );
  }

  return (
    <Stack gap="md">
      {announcements.map((ann) => (
        <Card key={ann._id} withBorder radius="lg" p="lg">
          <Group gap="sm" align="center" mb="sm">
            <ThemeIcon size={34} radius="md" color="indigo" variant="light">
              <IconBell size={18} />
            </ThemeIcon>
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              <Text fw={700} size="md">{ann.title}</Text>
              <Text size="xs" c="dimmed">
                {new Date(ann.createdAt).toLocaleDateString(undefined, {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </div>
            <Badge size="xs" color={ann.course ? 'indigo' : 'teal'} variant="light" radius="sm">
              {ann.course ? ann.course.title : 'Global'}
            </Badge>
          </Group>
          <Text size="sm" style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            {ann.message}
          </Text>
        </Card>
      ))}
    </Stack>
  );
}