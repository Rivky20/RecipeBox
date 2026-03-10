import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Badge, Box, Button, Heading, HStack, Table, Text,
} from '@chakra-ui/react';
import { Recipe } from '../../types';
import { recipeService } from '../../services/recipeService';
import SearchBar from '../../components/search/SearchBar';
import SortSelect from '../../components/search/SortSelect';
import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { load(); }, [search, sortBy]);

  const load = () => {
    setLoading(true);
    recipeService.getRecipes({ search: search || undefined, sortBy })
      .then(setRecipes)
      .catch(() => setError('טעינת המתכונים נכשלה.'))
      .finally(() => setLoading(false));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await recipeService.deleteRecipe(deleteTarget.id);
      setRecipes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError('מחיקת המתכון נכשלה.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div dir="rtl">
      <HStack justify="space-between" mb={6} wrap="wrap" gap={3}>
        <Heading size="xl">כל המתכונים</Heading>
        <HStack gap={3}>
          <SearchBar value={search} onChange={setSearch} />
          <SortSelect value={sortBy} onChange={setSortBy} />
        </HStack>
      </HStack>

      {error && <ErrorMessage message={error} />}

      <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
        <Table.Root>
          <Table.Header>
            <Table.Row bg="gray.50">
              <Table.ColumnHeader>שם</Table.ColumnHeader>
              <Table.ColumnHeader>סוג</Table.ColumnHeader>
              <Table.ColumnHeader>אלבום</Table.ColumnHeader>
              <Table.ColumnHeader>נוצר</Table.ColumnHeader>
              <Table.ColumnHeader>פעולות</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {recipes.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5}>
                  <Text textAlign="center" color="gray.500" py={4}>לא נמצאו מתכונים.</Text>
                </Table.Cell>
              </Table.Row>
            ) : recipes.map((r) => (
              <Table.Row key={r.id}>
                <Table.Cell fontWeight="medium">
                  <Link to={`/recipes/${r.id}`}>{r.name}</Link>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={r.recipeType === 'Link' ? 'blue' : 'green'} size="sm">
                    {r.recipeType === 'Link' ? 'קישור' : 'טקסט'}
                  </Badge>
                </Table.Cell>
                <Table.Cell color="gray.600" fontSize="sm">אלבום #{r.albumId}</Table.Cell>
                <Table.Cell color="gray.500" fontSize="sm">
                  {new Date(r.createdAt).toLocaleDateString('he-IL')}
                </Table.Cell>
                <Table.Cell>
                  <HStack gap={2}>
                    <Link to={`/recipes/${r.id}/edit`}>
                      <Button size="xs" variant="outline" colorPalette="blue"><FaEdit /></Button>
                    </Link>
                    <Button size="xs" colorPalette="red" onClick={() => setDeleteTarget(r)}>
                      <FaTrash />
                    </Button>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      <ConfirmDialog
        open={!!deleteTarget}
        title="מחיקת מתכון"
        message={`למחוק את "${deleteTarget?.name}"? לא ניתן לבטל פעולה זו.`}
        confirmLabel="מחק"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
