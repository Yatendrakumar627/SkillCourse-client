import { Paper, Group, Title, Text, Box } from '@mantine/core';

export default function SectionShell({
  title = '',
  subtitle = '',
  actions = null,
  children,
  p = 'lg',
  mb = 'lg',
  ...props
}) {
  return (
    <Paper withBorder radius="panel" p={p} mb={mb} {...props}>
      {(title || actions) && (
        <Group
          justify="space-between"
          align="flex-start"
          gap="sm"
          wrap="wrap"
          mb={children ? 'md' : 0}
        >
          <Box style={{ minWidth: 0 }}>
            {title && <Title order={3}>{title}</Title>}
            {subtitle && (
              <Text size="sm" c="dimmed" mt={2}>
                {subtitle}
              </Text>
            )}
          </Box>
          {actions && <Group gap="sm">{actions}</Group>}
        </Group>
      )}
      {children}
    </Paper>
  );
}