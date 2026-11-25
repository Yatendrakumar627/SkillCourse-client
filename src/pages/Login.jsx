import { useState } from 'react';
import { Box, Container, Paper, Text, TextInput, PasswordInput, Button, Alert, Group, ThemeIcon } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { loginAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { IconAlertCircle, IconSchool } from '@tabler/icons-react';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const res = await loginAPI(data);
      setAuth(res, res.token);
      if (res.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify credentials.');
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
        background: 'var(--lms-surface-page)',
      }}
    >
      <Container size={420} style={{ width: '100%' }}>
        <Group justify="center" gap="xs" mb="lg" wrap="nowrap">
          <ThemeIcon size={42} radius="md" className="brand-gradient">
            <IconSchool size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700}>
            SkillCourse<span style={{ color: 'var(--mantine-color-indigo-6)' }}> LMS</span>
          </Text>
        </Group>

        <Paper withBorder shadow="lg" p={32} radius="lg">
          <Text fw={700} size="xl" ta="center">Welcome back!</Text>
          <Text size="sm" c="dimmed" ta="center" mt={4} mb="lg">
            Do not have an account yet?{' '}
            <Text component={Link} to="/register" size="sm" c="indigo" fw={500} inherit>
              Create account
            </Text>
          </Text>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} title="Error" color="red" mb="md">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextInput
              label="Email"
              placeholder="you@email.com"
              required
              {...register('email')}
              mb="md"
            />
            <PasswordInput
              label="Password"
              placeholder="Your password"
              required
              {...register('password')}
              mb="lg"
            />
            <Button type="submit" fullWidth loading={loading} size="md" color="indigo">
              Sign in
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}