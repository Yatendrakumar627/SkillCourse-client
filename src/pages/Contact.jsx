import { useState } from 'react';
import { Container, Text, TextInput, Textarea, Button, Paper, Group, Stack, ThemeIcon, SimpleGrid } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { IconMail, IconPhone, IconMapPin } from '@tabler/icons-react';
import PageHeader from '../components/ui/PageHeader';
import { submitContactAPI } from '../services/api';
import { notifyError, notifySuccess } from '../utils/toast';

const CONTACT_DETAILS = [
  { icon: IconMail, title: 'Email Support', value: 'support@skillcourse.com' },
  { icon: IconPhone, title: 'Phone Support', value: '+1 (555) 019-2834' },
  { icon: IconMapPin, title: 'Headquarters', value: '100 Silicon Valley, San Francisco, CA' },
];

export default function Contact() {
  const { register, handleSubmit, reset } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await submitContactAPI(data);
      notifySuccess('Message Sent', `Thank you ${data.name}! We will contact you soon.`);
      reset();
    } catch (error) {
      notifyError('Failed to Send', 'Could not send your message. Please try again.', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container size="lg" className="lms-container page-shell">
      <PageHeader
        title="Contact Us"
        subtitle="Have questions about courses, cohort schedules, or custom training? Reach out to us below."
        align="center"
      />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        <Paper withBorder p="xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextInput
              label="Name"
              placeholder="Your Name"
              required
              {...register('name')}
              mb="md"
            />
            <TextInput
              label="Email"
              placeholder="Your Email"
              type="email"
              required
              {...register('email')}
              mb="md"
            />
            <Textarea
              label="Message"
              placeholder="How can we help you?"
              minRows={4}
              required
              {...register('message')}
              mb="lg"
            />
            <Button type="submit" size="md" color="indigo" loading={submitting}>
              Send Message
            </Button>
          </form>
        </Paper>

        <Paper withBorder p="xl" style={{ background: 'var(--lms-surface-subtle)' }}>
          <Stack gap="lg" justify="center" style={{ height: '100%' }}>
            {CONTACT_DETAILS.map((item) => {
              const Icon = item.icon;
              return (
                <Group key={item.title} gap="md" wrap="nowrap">
                  <ThemeIcon size={44} radius="md" color="indigo" variant="light">
                    <Icon size={22} />
                  </ThemeIcon>
                  <div>
                    <Text fw={600}>{item.title}</Text>
                    <Text size="sm" c="dimmed">{item.value}</Text>
                  </div>
                </Group>
              );
            })}
          </Stack>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}