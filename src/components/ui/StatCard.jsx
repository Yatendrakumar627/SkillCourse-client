import { Card, Text, Title, ThemeIcon, Group } from '@mantine/core';

export default function StatCard({
  label,
  value,
  icon = null,
  tone = 'default',
  sub = null,
  onClick = null,
}) {
  const Icon = icon;

  return (
    <Card
      shadow="sm"
      withBorder
      p="lg"
      className={onClick ? 'card-hover' : undefined}
      style={{ height: '100%', cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <Group justify="space-between" align="flex-start" gap="sm" wrap="nowrap">
        <div>
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
            {label}
          </Text>
          <Title order={2} mt={5} c={tone === 'alert' ? 'red' : 'inherit'}>
            {value}
          </Title>
          {sub && (
            <Text size="xs" c="dimmed" mt={4}>
              {sub}
            </Text>
          )}
        </div>
        {Icon && (
          <ThemeIcon size={44} radius="md" color="indigo" variant="light">
            <Icon size={22} />
          </ThemeIcon>
        )}
      </Group>
    </Card>
  );
}