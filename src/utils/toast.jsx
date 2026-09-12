import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';

export function notifySuccess(title, message) {
  notifications.show({
    title,
    message,
    color: 'green',
    icon: <IconCheck size={18} />,
    radius: 'md',
    autoClose: 4000,
  });
}

export function notifyError(title, message, error) {
  const detail =
    message || error?.response?.data?.message || 'Something went wrong. Please try again.';
  notifications.show({
    title,
    message: detail,
    color: 'red',
    icon: <IconX size={18} />,
    radius: 'md',
    autoClose: 5000,
  });
}