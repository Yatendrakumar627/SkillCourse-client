import { useMemo, useState } from 'react';
import { Table, Button, Group, TextInput, Select, SimpleGrid } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { updateStudentStatusAPI } from '../../services/api';
import TablePanel from '../ui/TablePanel';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import StudentActivityModal from './StudentActivityModal';
import { notifyError, notifySuccess } from '../../utils/toast';

export default function AdminStudents({ students, courses = [], onReload }) {
  const [activityStudentId, setActivityStudentId] = useState(null);
  const [activityOpen, setActivityOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((st) => {
      if (statusFilter !== 'all' && st.status !== statusFilter) return false;
      if (!q) return true;
      return (
        (st.name || '').toLowerCase().includes(q) ||
        (st.email || '').toLowerCase().includes(q) ||
        (st.phone || '').toLowerCase().includes(q)
      );
    });
  }, [students, search, statusFilter]);

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await updateStudentStatusAPI(id, { status: nextStatus });
      onReload();
      notifySuccess('Status Updated', `Student is now ${nextStatus}.`);
    } catch (error) {
      notifyError('Update Failed', 'Error toggling student status.', error);
    }
  };

  const handleOpenActivity = (id) => {
    setActivityStudentId(id);
    setActivityOpen(true);
  };

  return (
    <>
      <TablePanel
        title="User Base Directory"
        subtitle="Registered learners, account status, and enrollment portfolio"
        count={filteredStudents.length}
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mb="md">
          <TextInput
            placeholder="Search by name, email, or phone..."
            leftSection={<IconSearch size={15} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <Select
            value={statusFilter}
            onChange={(val) => setStatusFilter(val || 'all')}
            data={[
              { value: 'all', label: `All Students (${students.length})` },
              { value: 'active', label: 'Active Only' },
              { value: 'inactive', label: 'Inactive Only' },
            ]}
          />
        </SimpleGrid>

        {filteredStudents.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Student Name</Table.Th>
                <Table.Th>Email Address</Table.Th>
                <Table.Th>Phone</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredStudents.map((st) => (
                <Table.Tr key={st._id}>
                  <Table.Td fw={500}>{st.name}</Table.Td>
                  <Table.Td>{st.email}</Table.Td>
                  <Table.Td>{st.phone || '-'}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={st.status} />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <Button size="xs" variant="default" onClick={() => handleToggleStatus(st._id, st.status)}>
                        Toggle Status
                      </Button>
                      <Button size="xs" variant="light" color="violet" onClick={() => handleOpenActivity(st._id)}>
                        View Activity
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <EmptyState
            title={students.length === 0 ? 'No students registered yet.' : 'No matching students found.'}
            description={students.length === 0 ? 'New registrations will appear here.' : 'Try clearing your search or status filter.'}
          />
        )}
      </TablePanel>

      <StudentActivityModal
        opened={activityOpen}
        onClose={() => setActivityOpen(false)}
        studentId={activityStudentId}
        courses={courses}
        onChanged={onReload}
      />
    </>
  );
}