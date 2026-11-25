import { Card, Text, Title, Button, Group, Badge, SimpleGrid } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import EmptyState from '../ui/EmptyState';

export default function StudentDownloads({ classes }) {
  const downloadable = classes.filter((cls) => cls.notesUrl);

  return downloadable.length > 0 ? (
    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
      {downloadable.map((cls) => (
        <Card key={cls._id} shadow="sm" p="lg" radius="lg" withBorder>
          <Group justify="space-between" mb="xs">
            <Badge color="indigo" variant="light">{cls.course?.title}</Badge>
            <Text size="xs" c="dimmed">{new Date(cls.date).toLocaleDateString()}</Text>
          </Group>
          <Title order={4} mb="sm">{cls.topic} - Study Notes</Title>
          <Button
            color="indigo"
            leftSection={<IconDownload size={16} />}
            component="a"
            href={cls.notesUrl}
            target="_blank"
            fullWidth
          >
            Download Material
          </Button>
        </Card>
      ))}
    </SimpleGrid>
  ) : (
    <EmptyState
      icon={IconDownload}
      title="No downloads available yet"
      description="Class notes and PDFs will appear here once your instructors upload them."
    />
  );
}