import { Modal, Text, Group, Button } from '@mantine/core';

export default function ConfirmModal({
  opened,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  color = 'red',
  loading = false,
  children = null,
}) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      {message && <Text size="sm" mb={children ? 'md' : 'lg'}>{message}</Text>}
      {children}
      <Group justify="flex-end" mt="lg">
        <Button variant="default" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button color={color} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </Group>
    </Modal>
  );
}