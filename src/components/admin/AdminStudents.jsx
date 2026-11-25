import { useState } from 'react';
import { Table, Button, Group } from '@mantine/core';
import { updateStudentStatusAPI } from '../../services/api';
import TablePanel from '../ui/TablePanel';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';
import StudentActivityModal from './StudentActivityModal';
import { notifyError, notifySuccess } from '../../utils/toast';

export default function AdminStudents({ students, onReload }) {
  const [activityStudentId, setActivityStudentId] = useState(null);
  const [activityOpen, setActivityOpen] = useState(false);

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
        subtitle="Registered learners and their account status"
        count={students.length}
      >
        {students.length > 0 ? (
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
              {students.map((st) => (
                <Table.Tr key={st._id}>
                  <Table.Td fw={500}>{st.name}</Table.Td>
                  <Table.Td>{st.email}</Table.Td>
                  <Table.Td>{st.phone || '-'}</Table.Td>
                  <Table.Td>
                    <StatusBadge status={st.status} />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
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
          <EmptyState title="No students registered yet." description="New registrations will appear here." />
        )}
      </TablePanel>

      <StudentActivityModal
        opened={activityOpen}
        onClose={() => setActivityOpen(false)}
        studentId={activityStudentId}
      />
    </>
  );
}