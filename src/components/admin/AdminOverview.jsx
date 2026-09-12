import { SimpleGrid, Card } from '@mantine/core';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  IconCash, IconUsers, IconBook, IconHourglassHigh,
} from '@tabler/icons-react';
import StatCard from '../ui/StatCard';
import SectionShell from '../ui/SectionShell';
import PaymentApprovalTable from './PaymentApprovalTable';

const CHART_TOOLTIP_STYLE = {
  borderRadius: '8px',
  border: '1px solid var(--mantine-color-default-border)',
  background: 'var(--mantine-color-body)',
  fontSize: '13px',
  boxShadow: 'var(--mantine-shadow-xs)',
};

export default function AdminOverview({ payments, students, courses, pendingPayments, onApprove, onReject }) {
  const totalRevenue = payments
    .filter((p) => p.status === 'approved')
    .reduce((acc, p) => acc + p.amount, 0);

  // Real revenue trend: last 7 days grouped from approved payments
  const last7 = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    last7.push({
      name: d.toLocaleDateString(undefined, { weekday: 'short' }),
      date: d.toLocaleDateString(),
      revenue: 0,
    });
  }
  payments
    .filter((p) => p.status === 'approved')
    .forEach((p) => {
      const key = new Date(p.createdAt).toLocaleDateString();
      const bucket = last7.find((b) => b.date === key);
      if (bucket) bucket.revenue += p.amount;
    });
  const revenueData = last7;

  // Real enrollments per course from payment records
  const courseMap = {};
  payments.forEach((p) => {
    const title = p.course?.title || 'Unknown';
    courseMap[title] = (courseMap[title] || 0) + 1;
  });
  const enrollData = Object.entries(courseMap)
    .slice(0, 8)
    .map(([name, value]) => ({ name, students: value }));

  return (
    <>
      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" mb="xl">
        <StatCard label="Total Revenue" value={`$${totalRevenue}`} icon={IconCash} sub="Approved payments" />
        <StatCard label="Total Students" value={students.length} icon={IconUsers} sub="Registered accounts" />
        <StatCard label="Courses in LMS" value={courses.length} icon={IconBook} sub="Active catalog" />
        <StatCard
          label="Pending Payments"
          value={pendingPayments.length}
          icon={IconHourglassHigh}
          tone={pendingPayments.length > 0 ? 'alert' : 'default'}
          sub={pendingPayments.length > 0 ? 'Awaiting review' : 'All caught up'}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg" mb="xl">
        <Card withBorder radius="lg" p="lg">
          <SectionShell title="Revenue Trend" subtitle="Approved payments over the last 7 days" mb={0} p={0} withBorder={false}>
            <div style={{ height: 280, width: '100%', marginTop: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--mantine-color-dimmed)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--mantine-color-dimmed)" />
                  <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Line type="monotone" dataKey="revenue" stroke="var(--mantine-color-indigo-6)" strokeWidth={2.5} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionShell>
        </Card>

        <Card withBorder radius="lg" p="lg">
          <SectionShell title="Enrollments by Course" subtitle="Purchase requests per course" mb={0} p={0} withBorder={false}>
            <div style={{ height: 280, width: '100%', marginTop: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={enrollData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--mantine-color-default-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="var(--mantine-color-dimmed)" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="var(--mantine-color-dimmed)" />
                  <RechartsTooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Bar dataKey="students" fill="var(--mantine-color-indigo-6)" radius={[6, 6, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionShell>
        </Card>
      </SimpleGrid>

      {pendingPayments.length > 0 && (
        <SectionShell
          title="Pending Manual Payments Approval"
          subtitle={`${pendingPayments.length} transaction(s) awaiting review`}
          mb="lg"
        >
          <PaymentApprovalTable payments={pendingPayments} onApprove={onApprove} onReject={onReject} />
        </SectionShell>
      )}
    </>
  );
}