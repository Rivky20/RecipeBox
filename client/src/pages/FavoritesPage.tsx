import { useEffect, useState } from 'react';
import { Heading, SimpleGrid, Text } from '@chakra-ui/react';
import { Recipe } from '../types';
import { favoriteService } from '../services/favoriteService';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/recipes/RecipeCard';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function FavoritesPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    favoriteService.getFavorites(user.userId)
      .then((data) => setRecipes(data.map((r) => ({ ...r, isFavorite: true }))))
      .catch(() => setError('טעינת המועדפים נכשלה.'))
      .finally(() => setLoading(false));
  }, [user]);

  // When user un-favorites from this page, remove from list
  const handleFavoriteToggle = (recipeId: number, newState: boolean) => {
    if (!newState) {
      setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div dir="rtl">
      <Heading size="xl" mb={2}>המועדפים שלי</Heading>
      <Text color="gray.600" mb={6}>המתכונים שסימנת</Text>

      {recipes.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={12}>
          עדיין לא הוספת מועדפים. עיין באלבומים וסמן מתכון!
        </Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={5}>
          {recipes.map((recipe) => (
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
