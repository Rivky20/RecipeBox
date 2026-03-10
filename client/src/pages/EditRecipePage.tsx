import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Heading } from '@chakra-ui/react';
import { CreateRecipeRequest, Recipe } from '../types';
import { recipeService } from '../services/recipeService';
import { useAuth } from '../context/AuthContext';
import RecipeForm from '../components/recipes/RecipeForm';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    recipeService.getRecipe(Number(id))
      .then((r) => {
        // Guard: only owner or admin may edit
        if (r.userId !== user?.userId && !isAdmin) {
          navigate(`/recipes/${id}`);
          return;
        }
        setRecipe(r);
      })
      .catch(() => setError('המתכון לא נמצא.'))
      .finally(() => setLoading(false));
  }, [id, user, isAdmin, navigate]);

  const handleSubmit = async (data: CreateRecipeRequest) => {
    await recipeService.updateRecipe(Number(id), data);
    navigate(`/recipes/${id}`);
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!recipe) return null;

  return (
    <Box maxW="700px" mx="auto" dir="rtl">
      <Heading size="xl" mb={8}>עריכת מתכון</Heading>
      <RecipeForm initial={recipe} onSubmit={handleSubmit} submitLabel="שמור שינויים" />
    </Box>
  );
}
