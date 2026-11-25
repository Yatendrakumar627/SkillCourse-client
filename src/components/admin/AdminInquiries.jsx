import { useMemo, useState } from 'react';
import { Table, Button, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { deleteContactMessageAPI } from '../../services/api';
import TablePanel from '../ui/TablePanel';
import EmptyState from '../ui/EmptyState';
import ConfirmModal from '../ui/ConfirmModal';
import { notifyError, notifySuccess } from '../../utils/toast';

export default function AdminInquiries({ inquiries = [], onReload }) {
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return inquiries;
    return inquiries.filter(
      (inq) =>
        (inq.name || '').toLowerCase().includes(q) ||
        (inq.email || '').toLowerCase().includes(q) ||
        (inq.message || '').toLowerCase().includes(q)
    );
  }, [inquiries, search]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteContactMessageAPI(deleteTarget._id);
      setDeleteTarget(null);
      onReload();
      notifySuccess('Inquiry Removed', 'The contact message has been deleted.');
    } catch (error) {
      notifyError('Delete Failed', 'Error removing inquiry.', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <TablePanel
        title="Contact Inquiries"
        subtitle="Messages submitted via the public Contact form"
        count={filtered.length}
      >
        <TextInput
          placeholder="Search by sender name, email, or message..."
          leftSection={<IconSearch size={15} />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          mb="md"
        />

        {filtered.length > 0 ? (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Sender</Table.Th>
                <Table.Th>Message</Table.Th>
                <Table.Th>Received</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filtered.map((inq) => (
                <Table.Tr key={inq._id}>
                  <Table.Td>
                    <Text fw={500}>{inq.name}</Text>
                    <Text size="xs" c="dimmed" component="a" href={`mailto:${inq.email}`}>
                      {inq.email}
                    </Text>
                  </Table.Td>
                  <Table.Td maw={420}>
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{inq.message}</Text>
                  </Table.Td>
                  <Table.Td className="tabular-nums">
                    {new Date(inq.createdAt).toLocaleString()}
                  </Table.Td>
                  <Table.Td>
                    <Button size="xs" color="red" onClick={() => setDeleteTarget(inq)}>
                      Delete
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        ) : (
          <EmptyState
            title={inquiries.length === 0 ? 'No inquiries yet.' : 'No matching inquiries found.'}
            description={inquiries.length === 0 ? 'Messages submitted on the Contact page appear here.' : 'Try clearing your search filter.'}
          />
        )}
      </TablePanel>

      <ConfirmModal
        opened={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete inquiry?"
        message={`Delete message from "${deleteTarget?.name}"?`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </>
  );
}
