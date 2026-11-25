import { useState } from 'react';
import { Paper, Title, TextInput, Button } from '@mantine/core';
import { updateProfileAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { notifyError, notifySuccess } from '../../utils/toast';

export default function StudentProfile() {
  const { user, setAuth } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updatedUser = await updateProfileAPI({
        name,
        phone,
        password: password || undefined,
      });
      setAuth(updatedUser, localStorage.getItem('token'));
      setPassword('');
      notifySuccess('Profile Updated', 'Your account details have been saved.');
    } catch (error) {
      notifyError('Update Failed', 'Error updating profile.', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper withBorder shadow="sm" p="xl" radius="lg" style={{ maxWidth: 500 }}>
      <Title order={3} mb="md">Update Account Profile</Title>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          mb="sm"
        />
        <TextInput
          label="Email"
          value={user?.email}
          disabled
          description="Email cannot be changed"
          mb="sm"
        />
        <TextInput
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          mb="sm"
        />
        <TextInput
          label="New Password"
          type="password"
          placeholder="Leave blank to keep current password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          mb="lg"
        />
        <Button
          type="submit"
          loading={submitting}
          color="indigo"
        >
          Save Changes
        </Button>
      </form>
    </Paper>
  );
}