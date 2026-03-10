import { useEffect, useState } from 'react';
import {
  Badge, Box, Button, Heading, HStack, Table, Text,
} from '@chakra-ui/react';
import { AppUser } from '../../types';
import { userService } from '../../services/userService';
import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    userService.getUsers()
      .then(setUsers)
      .catch(() => setError('טעינת המשתמשים נכשלה.'))
      .finally(() => setLoading(false));
  }, []);

  const handleBlock = async (user: AppUser) => {
    setActionLoading(user.id);
    try {
      if (user.isBlocked) {
        await userService.unblockUser(user.id);
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isBlocked: false } : u));
      } else {
        await userService.blockUser(user.id);
        setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isBlocked: true } : u));
      }
    } catch {
      setError('עדכון המשתמש נכשל.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div dir="rtl">
      <Heading size="xl" mb={6}>משתמשים</Heading>
      {error && <ErrorMessage message={error} />}

      <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
        <Table.Root>
          <Table.Header>
            <Table.Row bg="gray.50">
              <Table.ColumnHeader>אימייל</Table.ColumnHeader>
              <Table.ColumnHeader>תפקיד</Table.ColumnHeader>
              <Table.ColumnHeader>מתכונים</Table.ColumnHeader>
              <Table.ColumnHeader>סטטוס</Table.ColumnHeader>
              <Table.ColumnHeader>פעולות</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {users.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5}>
                  <Text textAlign="center" color="gray.500" py={4}>לא נמצאו משתמשים.</Text>
                </Table.Cell>
              </Table.Row>
            ) : users.map((u) => (
              <Table.Row key={u.id}>
                <Table.Cell>{u.email}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={u.role === 'Admin' ? 'purple' : 'blue'} size="sm">
                    {u.role === 'Admin' ? 'מנהל' : 'משתמש'}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{u.recipeCount}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={u.isBlocked ? 'red' : 'green'} size="sm">
                    {u.isBlocked ? 'חסום' : 'פעיל'}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  {u.role !== 'Admin' && (
                    <Button
                      size="xs"
                      colorPalette={u.isBlocked ? 'green' : 'red'}
                      variant="outline"
                      onClick={() => handleBlock(u)}
                      loading={actionLoading === u.id}
                    >
                      {u.isBlocked ? 'בטל חסימה' : 'חסום'}
                    </Button>
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </div>
  );
}
