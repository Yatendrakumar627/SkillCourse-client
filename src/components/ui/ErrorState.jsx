import { Text, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function ErrorState({ message = 'Something went wrong while loading the data.', onRetry, action }) {
  return (
    <Alert
      icon={<IconAlertCircle size={18} />}
      title="Error"
      color="red"
      radius="md"
      variant="light"
      withCloseButton={false}
    >
      <Text size="sm" mb={onRetry ? 'md' : 0}>{message}</Text>
      {onRetry && (
        <Text
          component="button"
          type="button"
          onClick={onRetry}
          size="sm"
          fw={600}
          c="red"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          Try again
        </Text>
      )}
      {action}
    </Alert>
  );
}