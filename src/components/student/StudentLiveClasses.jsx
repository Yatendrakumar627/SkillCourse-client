import { Card, Text, Title, Button, Group, Stack, Badge } from '@mantine/core';
import { IconDownload, IconVideo } from '@tabler/icons-react';
import EmptyState from '../ui/EmptyState';

export default function StudentLiveClasses({ classes }) {
  if (classes.length === 0) {
    return (
      <EmptyState
        icon={IconVideo}
        title="No live classes yet"
        description="Your instructors will post Google Meet links here once they schedule a session."
      />
    );
  }

  const sorted = [...classes].sort(
    (a, b) => new Date(a.startTime || a.date) - new Date(b.startTime || b.date)
  );
  const now = Date.now();
  const nextClass = sorted.find((c) => new Date(c.startTime || c.date) >= now);

  return (
    <Stack gap="md">
      {sorted.map((cls) => {
        const isNext = nextClass?._id === cls._id;
        return (
          <Card
            key={cls._id}
            withBorder
            p="lg"
            radius="lg"
            style={{
              borderColor: isNext ? 'var(--mantine-color-indigo-6)' : undefined,
              borderWidth: isNext ? 2 : 1,
            }}
          >
            <Group align="center" wrap="wrap" justify="space-between" gap="md">
              <Group align="center" wrap="nowrap" gap="md" style={{ minWidth: 0, flexGrow: 1 }}>
                <div style={{ minWidth: 0 }}>
                  <Group gap="xs" mb={4} wrap="nowrap">
                    <Text size="xs" c="indigo" fw={700} truncate>
                      {cls.course?.title}
                    </Text>
                  </Group>
                  <Title order={3} size="h4" mt={4}>{cls.topic}</Title>
                  <Text size="sm" c="dimmed" mt="xs">
                    {new Date(cls.date).toLocaleDateString(undefined, {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'short',
                    })} • {new Date(cls.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </div>
              </Group>

              <Group gap="sm" wrap="wrap">
                {isNext && (
                  <Badge color="indigo" variant="filled" size="sm">
                    Next class
                  </Badge>
                )}
                {cls.notesUrl && (
                  <Button
                    variant="default"
                    size="sm"
                    leftSection={<IconDownload size={16} />}
                    component="a"
                    href={cls.notesUrl}
                    target="_blank"
                  >
                    Study Notes
                  </Button>
                )}
                <Button
                  color="indigo"
                  size="sm"
                  leftSection={<IconVideo size={16} />}
                  component="a"
                  href={cls.meetLink}
                  target="_blank"
                >
                  Join Live Meet
                </Button>
              </Group>
            </Group>
          </Card>
        );
      })}
    </Stack>
  );
}