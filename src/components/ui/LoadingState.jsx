import { Container, Text, Stack, Loader, Skeleton } from '@mantine/core';

export default function LoadingState({ label = 'Loading...', fullPage = false, variant = 'spinner', rows = 4 }) {
  if (variant === 'skeleton') {
    const bars = (
      <Stack gap="md" w="100%">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} height={fullPage ? 84 : 56} radius="md" />
        ))}
      </Stack>
    );
    if (fullPage) {
      return (
        <Container size="lg" className="lms-container" py="xl">
          {bars}
        </Container>
      );
    }
    return bars;
  }

  if (fullPage) {
    return (
      <Container size="lg" className="lms-container" py="xl" ta="center">
        <Stack align="center" gap="md">
          <Loader color="indigo" />
          <Text size="lg">{label}</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Stack align="center" gap="md" py="xl">
      <Loader color="indigo" />
      <Text size="sm" c="dimmed">{label}</Text>
    </Stack>
  );
}