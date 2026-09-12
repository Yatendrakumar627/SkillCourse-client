import { useState } from 'react';
import { Box, Container, Paper, Text, TextInput, PasswordInput, Button, Alert, Group, ThemeIcon } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { registerAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { IconAlertCircle, IconSchool } from '@tabler/icons-react';

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const res = await registerAPI(data);
      setAuth(res, res.token);
      if (res.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try a different email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
        background: 'var(--mantine-color-gray-0)',
      }}
    >
      <Container size={460} style={{ width: '100%' }}>
        <Group justify="center" gap="xs" mb="lg" wrap="nowrap">
          <ThemeIcon size={42} radius="md" className="brand-gradient">
            <IconSchool size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700}>
            SkillCourse<span style={{ color: 'var(--mantine-color-indigo-6)' }}> LMS</span>
          </Text>
        </Group>

        <Paper withBorder shadow="lg" p={32} radius="lg">
          <Text fw={700} size="xl" ta="center">Create an account</Text>
          <Text size="sm" c="dimmed" ta="center" mt={4} mb="lg">
            Already have an account?{' '}
            <Text component={Link} to="/login" size="sm" c="indigo" fw={500} inherit>
              Login
            </Text>
          </Text>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextInput
              label="Full Name"
              placeholder="John Doe"
              required
              {...register('name')}
              mb="md"
            />
            <TextInput
              label="Email"
              placeholder="you@email.com"
              type="email"
              required
              {...register('email')}
              mb="md"
            />
            <TextInput
              label="Phone"
              placeholder="1234567890"
              {...register('phone')}
              mb="md"
            />
            <PasswordInput
              label="Password"
              placeholder="Must be at least 6 characters"
              required
              {...register('password')}
              mb="lg"
            />
            <Button type="submit" fullWidth loading={loading} size="md" color="indigo">
              Register Account
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}