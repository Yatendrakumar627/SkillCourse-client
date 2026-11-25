import { Paper, Group, Title, Text, Badge } from '@mantine/core';

export default function TablePanel({
  title = '',
  subtitle = '',
  count = null,
  actions = null,
  children,
  p = 'lg',
  mb = 'lg',
  ...props
}) {
  return (
    <Paper withBorder radius="panel" p={p} mb={mb} {...props}>
      {(title || actions || count !== null) && (
        <Group justify="space-between" align="flex-start" gap="sm" wrap="wrap" mb="md">
          <Group gap="sm" wrap="nowrap" align="center">
            {title && <Title order={3}>{title}</Title>}
            {count !== null && (
              <Badge variant="light" color="gray" radius="sm" mt={2}>
                {count}
              </Badge>
            )}
          </Group>
          {actions && <Group gap="sm">{actions}</Group>}
        </Group>
      )}
      {subtitle && (
        <Text size="sm" c="dimmed" mb="md">
          {subtitle}
        </Text>
      )}
      <div className="table-scroll">{children}</div>
    </Paper>
  );
}