import { useState } from 'react';
import { Container, Text, TextInput, Textarea, Button, Paper, Group, Stack, ThemeIcon, SimpleGrid, Anchor } from '@mantine/core';
import { useForm } from 'react-hook-form';
import { IconMail, IconPhone, IconMapPin, IconClock, IconBrandWhatsapp } from '@tabler/icons-react';
import PageHeader from '../components/ui/PageHeader';
import { submitContactAPI } from '../services/api';
import { notifyError, notifySuccess } from '../utils/toast';

const PHONE_E164 = '+919899415841';
const PHONE_DISPLAY = '+91 98994 15841';

const CONTACT_DETAILS = [
  {
    icon: IconMail,
    title: 'Email Support',
    value: 'support@skillcourse.com',
    href: 'mailto:support@skillcourse.com',
  },
  {
    icon: IconPhone,
    title: 'Call / Mobile Support',
    value: PHONE_DISPLAY,
    href: `tel:${PHONE_E164}`,
  },
  {
    icon: IconMapPin,
    title: 'Office Location',
    value: 'New Delhi, Delhi NCR, India',
  },
  {
    icon: IconClock,
    title: 'Support Hours (IST)',
    value: 'Mon – Sat, 10:00 AM – 7:00 PM IST',
  },
];

export default function Contact() {
  const { register, handleSubmit, reset } = useForm();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await submitContactAPI(data);
      notifySuccess('Message Sent', `Thank you ${data.name}! Our Delhi support team will contact you shortly.`);
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
        subtitle="Questions about courses, college/faculty partnerships, UPI payment verification, or batch schedules? Reach our Delhi team below."
        align="center"
      />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
        <Paper withBorder p="xl" radius="lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextInput
              label="Full Name"
              placeholder="e.g. Aarav Sharma"
              required
              {...register('name')}
              mb="md"
            />
            <TextInput
              label="Email Address"
              placeholder="you@example.com"
              type="email"
              required
              {...register('email')}
              mb="md"
            />
            <Textarea
              label="Message"
              placeholder="Ask about course syllabus, campus cohorts, or enrollment support..."
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

        <Paper withBorder p="xl" radius="lg" style={{ background: 'var(--lms-surface-subtle)' }}>
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
                    {item.href ? (
                      <Anchor href={item.href} size="sm" c="indigo" fw={500}>
                        {item.value}
                      </Anchor>
                    ) : (
                      <Text size="sm" c="dimmed">{item.value}</Text>
                    )}
                  </div>
                </Group>
              );
            })}

            <Group gap="sm" mt="xs" wrap="wrap">
              <Button
                component="a"
                href={`tel:${PHONE_E164}`}
                variant="light"
                color="indigo"
                leftSection={<IconPhone size={16} />}
              >
                Call {PHONE_DISPLAY}
              </Button>
              <Button
                component="a"
                href={`https://wa.me/919899415841?text=${encodeURIComponent('Hi SkillCourse team, I have a question about your courses.')}`}
                target="_blank"
                rel="noopener noreferrer"
                variant="light"
                color="teal"
                leftSection={<IconBrandWhatsapp size={16} />}
              >
                WhatsApp Support
              </Button>
            </Group>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Container>
  );
}
