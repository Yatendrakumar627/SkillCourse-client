import { Group, Title, Text, Box } from '@mantine/core';

export default function SectionHeader({ title, subtitle = '', actions = null, align = 'left' }) {
  const centered = align === 'center';
  return (
    <Group
      justify={centered ? 'center' : 'space-between'}
      align="center"
      mb="lg"
      wrap="wrap"
      gap="sm"
      style={centered ? { textAlign: 'center' } : undefined}
    >
      <Box style={{ maxWidth: 640 }}>
        <Title order={3}>{title}</Title>
        {subtitle && (
          <Text size="sm" c="dimmed" mt={2}>
            {subtitle}
          </Text>
        )}
      </Box>
      {actions && <Group gap="sm">{actions}</Group>}
    </Group>
  );
}