import { Paper, Text, Group, ThemeIcon, Box, Button } from '@mantine/core';
import { IconInbox } from '@tabler/icons-react';

export default function EmptyState({
  title = 'Nothing here yet.',
  description = '',
  icon = IconInbox,
  action = null,
  actionLabel = '',
  tone = 'default',
  compact = false,
}) {
  const Icon = icon;
  const dashed = tone === 'dashed';

  return (
    <Paper
      radius="lg"
      p={compact ? 'lg' : 'xl'}
      ta="center"
      withBorder={!dashed}
      style={
        dashed
          ? { background: 'transparent', border: '2px dashed var(--mantine-color-default-border)' }
          : undefined
      }
    >
      <Group justify="center" mb="md">
        <ThemeIcon size={compact ? 44 : 56} radius="md" color="indigo" variant="light">
          <Icon size={compact ? 22 : 28} />
        </ThemeIcon>
      </Group>
      <Text size={compact ? 'md' : 'lg'} fw={600}>
        {title}
      </Text>
      {description && (
        <Text size="sm" c="dimmed" mt="xs" style={{ maxWidth: 440, margin: '0 auto' }}>
          {description}
        </Text>
      )}
      {(action || actionLabel) && <Box mt="lg">{action || <Button color="indigo">{actionLabel}</Button>}</Box>}
    </Paper>
  );
}