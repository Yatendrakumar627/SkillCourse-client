import { Group, Title, Text, Box, Badge } from '@mantine/core';

export default function PageHeader({
  title,
  subtitle,
  eyebrow = null,
  align = 'left',
  actions = null,
}) {
  return (
    <Box mb="xl">
      <Group justify={align === 'center' ? 'center' : 'space-between'} align="flex-end" wrap="wrap" gap="md">
        <Box style={{ flexGrow: 1, textAlign: align, maxWidth: 760 }}>
          {eyebrow && (
            <Badge variant="light" color="indigo" size="sm" radius="sm" mb={8} tt="uppercase">
              {eyebrow}
            </Badge>
          )}
          <Title order={1}>{title}</Title>
          {subtitle && (
            <Text c="dimmed" size="md" mt={6}>
              {subtitle}
            </Text>
          )}
        </Box>
        {actions && <Group gap="md">{actions}</Group>}
      </Group>
    </Box>
  );
}