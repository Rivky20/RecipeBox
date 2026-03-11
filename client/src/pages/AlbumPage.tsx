import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Badge, Box, Button, Heading, HStack, SimpleGrid, Text } from '@chakra-ui/react';
import { Album, Recipe } from '../types';
import { albumService } from '../services/albumService';
import { recipeService } from '../services/recipeService';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/recipes/RecipeCard';
import SearchBar from '../components/search/SearchBar';
import SortSelect from '../components/search/SortSelect';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { FaArrowRight } from 'react-icons/fa';

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [album, setAlbum] = useState<Album | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  useEffect(() => {
    if (!id) return;
    const albumId = Number(id);
    Promise.all([
      albumService.getAlbum(albumId),
      recipeService.getRecipesByAlbum(albumId),
    ])
      .then(([a, r]) => { setAlbum(a); setRecipes(r); })
      .catch(() => setError('טעינת האלבום נכשלה.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleFavoriteToggle = (recipeId: number, newState: boolean) => {
    setRecipes((prev) =>
      prev.map((r) => r.id === recipeId ? { ...r, isFavorite: newState } : r)
    );
  };

  const filtered = useMemo(() => {
    let list = [...recipes];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) => r.name.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [recipes, search, sortBy]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div dir="rtl">
      {/* Top row: breadcrumb + back button */}
      <HStack justify="space-between" align="center" mb={5}>
        <Text color="gray.500" fontSize="sm">
          <Link to="/">אלבומים</Link> › {album?.name}
        </Text>
        <Button
          size="sm"
          variant="ghost"
          color="#7D6B62"
          _hover={{ bg: '#F5E1D0', color: '#5C3520' }}
          borderRadius="full"
          onClick={() => navigate('/')}
          gap={1}
        >
          <FaArrowRight /> כל האלבומים
        </Button>
      </HStack>

      {/* Album header */}
      <HStack justify="space-between" mb={6} wrap="wrap" gap={4}>
        <div>
          <HStack gap={3} align="center">
            <Heading
              size="xl"
              style={{ fontFamily: "'Frank Ruhl Libre', Georgia, serif" }}
            >
              {album?.name}
            </Heading>
            <Badge
              bg="#F5E1D0"
              color="#7D4F3A"
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
            >
              {recipes.length} {recipes.length === 1 ? 'מתכון' : 'מתכונים'}
            </Badge>
          </HStack>
          {album?.description && (
            <Text color="gray.600" mt={1}>{album.description}</Text>
          )}
        </div>
        {isAuthenticated && (
          <Link to={`/recipes/new?albumId=${id}`}>
            <Button
              bg="#E8919C"
              color="white"
              size="sm"
              _hover={{ bg: '#C97080' }}
              borderRadius="xl"
              fontWeight="700"
            >
              + הוסף מתכון
            </Button>
          </Link>
        )}
      </HStack>

      <HStack mb={6} gap={3}>
        <Box flex={1}>
          <SearchBar value={search} onChange={setSearch} />
        </Box>
        <SortSelect value={sortBy} onChange={setSortBy} />
      </HStack>

      {filtered.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={12}>
          {search ? 'לא נמצאו מתכונים התואמים לחיפוש.' : 'אין מתכונים באלבום זה עדיין.'}
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={5}>
          {filtered.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onFavoriteToggle={handleFavoriteToggle}
            />
          ))}
        </SimpleGrid>
      )}
    </div>
  );
}
