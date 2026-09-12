import { Card, Skeleton } from '@mantine/core';

export default function CourseCardSkeleton() {
  return (
    <Card withBorder radius="lg" p="lg">
      <Skeleton height={0} radius="0" style={{ paddingTop: '62.5%' }} mb="md" />
      <Skeleton height={10} width="35%" mb="xs" />
      <Skeleton height={20} width="92%" mb="xs" />
      <Skeleton height={20} width="70%" mb="sm" />
      <Skeleton height={14} width="100%" mb="sm" />
      <Skeleton height={14} width="100%" mb="lg" />
      <Skeleton height={36} radius="md" />
    </Card>
  );
}