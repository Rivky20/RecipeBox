import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Flex, HStack, NativeSelect, Text, Textarea, VStack } from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import { recipeService } from '../services/recipeService';
import { albumService } from '../services/albumService';
import { findRecipesWithAI, AIResult, GeneratedRecipe } from '../services/geminiService';
import { Album } from '../types';
import Spinner from '../components/common/Spinner';

export default function AIPage() {
  const { isAuthenticated } = useAuth();
  const { openLogin } = useAuthModal();
  const navigate = useNavigate();

  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState<number | null>(null);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);

  const handleSearch = async () => {
    if (!ingredients.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSavedRecipeId(null);
    try {
      const allRecipes = await recipeService.getRecipes();
      const aiResult = await findRecipesWithAI(ingredients, allRecipes);
      setResult(aiResult);
    } catch (e: any) {
      console.error('AI Search error:', e);
      if (e?.message === 'RATE_LIMIT') {
        setError('Gemini מגביל בקשות בחינמיות — המתן 30 שניות ונסה שוב.');
      } else {
        setError(`שגיאה: ${e?.message || 'לא ידוע'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async (recipe: GeneratedRecipe) => {
    if (!isAuthenticated) return;
    setGeneratedRecipe(recipe);
    setSavedRecipeId(null);
    try {
      const data = await albumService.getAlbums();
      setAlbums(data);
      setSelectedAlbumId(data[0]?.id ?? null);
    } catch {
      setAlbums([]);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!generatedRecipe || !selectedAlbumId) return;
    setSaving(true);
    try {
      const created = await recipeService.createRecipe({
        name: generatedRecipe.name,
        description: generatedRecipe.description,
        recipeType: 'Text',
        albumId: selectedAlbumId,
        ingredients: generatedRecipe.ingredients,
        instructions: generatedRecipe.instructions,
      });
      setSavedRecipeId(created.id);
      setShowModal(false);
    } catch {
      setError('שמירת המתכון נכשלה. נסה שוב.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box maxW="800px" mx="auto" px={6} py={10} dir="rtl">
      {/* Header */}
      <VStack gap={2} mb={8} textAlign="center">
        <Text fontSize="3xl" fontWeight="800" color="#1A1A1A">
          🧊 מה יש לך במקרר?
        </Text>
        <Text color="#7D6B62" fontSize="md">
          כתוב את החומרים שיש לך ונמצא מתכון מותאם אישית
        </Text>
      </VStack>

      {/* Search box */}
      <Box
        bg="white"
        border="1px solid #F0DDD0"
        borderRadius="16px"
        p={6}
        boxShadow="0 2px 12px rgba(232,145,156,0.08)"
        mb={6}
      >
        <Textarea
          value={ingredients}
          onChange={e => setIngredients(e.target.value)}
          placeholder="לדוגמה: עוף, אורז, שום, עגבניות..."
          rows={3}
          border="1px solid #F0DDD0"
          borderRadius="10px"
          fontSize="md"
          resize="none"
          mb={4}
          _focus={{ borderColor: '#C9848C', boxShadow: '0 0 0 1px #C9848C' }}
          style={{ direction: 'rtl' }}
        />
        <Button
          onClick={handleSearch}
          disabled={loading || !ingredients.trim()}
          bg="#C9848C"
          color="white"
          _hover={{ bg: '#9E6870' }}
          _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
          borderRadius="full"
          px={8}
          size="md"
          width="100%"
        >
          {loading ? 'מחפש...' : 'חפש מתכון'}
        </Button>
      </Box>

      {/* Loading */}
      {loading && (
        <Flex justify="center" py={8}>
          <Spinner />
        </Flex>
      )}

      {/* Error */}
      {error && (
        <Box bg="#FFF0F0" border="1px solid #F5C6CB" borderRadius="10px" p={4} mb={4} color="#842029">
          {error}
        </Box>
      )}

      {/* Results */}
      {result && !loading && (
        <VStack gap={4} align="stretch">
          {/* Found recipes */}
          {result.found.length > 0 && (
            <>
              <Text fontWeight="700" fontSize="lg" color="#1A1A1A">
                מתכונים שמצאנו עבורך:
              </Text>
              {result.found.map(recipe => (
                <Box
                  key={recipe.id}
                  bg="white"
                  border="1px solid #F0DDD0"
                  borderRadius="12px"
                  p={5}
                  boxShadow="0 2px 8px rgba(0,0,0,0.05)"
                >
                  <Flex justify="space-between" align="flex-start" gap={4} flexWrap="wrap">
                    <Box flex="1">
                      <Text fontWeight="700" fontSize="md" color="#1A1A1A" mb={2}>
                        {recipe.name}
                      </Text>
                      {recipe.missingIngredients.length === 0 ? (
                        <Text color="#2D8A4E" fontSize="sm" fontWeight="600">
                          ✅ יש לך הכל!
                        </Text>
                      ) : (
                        <Text color="#7D6B62" fontSize="sm">
                          🛒 קנה עוד:{' '}
                          <Text as="span" fontWeight="600" color="#9E6870">
                            {recipe.missingIngredients.join(', ')}
                          </Text>
                        </Text>
                      )}
                    </Box>
                    <Button
                      size="sm"
                      bg="#C9848C"
                      color="white"
                      _hover={{ bg: '#9E6870' }}
                      borderRadius="full"
                      px={5}
                      onClick={() => navigate(`/recipes/${recipe.id}`)}
                      flexShrink={0}
                    >
                      צפה במתכון
                    </Button>
                  </Flex>
                </Box>
              ))}
            </>
          )}

          {/* Generated recipe */}
          {result.generated && (
            <>
              {result.found.length === 0 && (
                <Text fontWeight="700" fontSize="lg" color="#1A1A1A">
                  לא נמצאו מתכונים קיימים — יצרנו מתכון חדש עבורך:
                </Text>
              )}
              <Box
                bg="#FDF0E8"
                border="2px solid #8B4513"
                borderRadius="14px"
                p={6}
                boxShadow="0 4px 16px rgba(139,69,19,0.1)"
              >
                <HStack justify="space-between" align="flex-start" flexWrap="wrap" gap={3} mb={4}>
                  <Box>
                    <Text fontWeight="800" fontSize="xl" color="#8B4513" mb={1}>
                      ✨ {result.generated.name}
                    </Text>
                    <Text color="#7D6B62" fontSize="sm">
                      {result.generated.description}
                    </Text>
                  </Box>
                  {savedRecipeId ? (
                    <Button
                      size="sm"
                      bg="#2D8A4E"
                      color="white"
                      borderRadius="full"
                      px={5}
                      onClick={() => navigate(`/recipes/${savedRecipeId}`)}
                      flexShrink={0}
                    >
                      ✅ נשמר — צפה
                    </Button>
                  ) : isAuthenticated ? (
                    <Button
                      size="sm"
                      bg="#8B4513"
                      color="white"
                      _hover={{ bg: '#6B3210' }}
                      borderRadius="full"
                      px={5}
                      onClick={() => handleOpenModal(result.generated!)}
                      flexShrink={0}
                    >
                      ＋ הוסף לאלבום
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      borderColor="#C9848C"
                      color="#9E6870"
                      _hover={{ bg: '#F5E6E8' }}
                      borderRadius="full"
                      px={5}
                      onClick={openLogin}
                      flexShrink={0}
                    >
                      התחבר לשמירה
                    </Button>
                  )}
                </HStack>

                {/* Ingredients */}
                <Box
                  bg="white"
                  borderRadius="10px"
                  p={4}
                  mb={3}
                  border="1px solid #E8CCBA"
                >
                  <Text fontWeight="700" color="#8B4513" mb={2} fontSize="sm">
                    🥗 חומרים:
                  </Text>
                  <Text
                    color="#1A1A1A"
                    fontSize="sm"
                    whiteSpace="pre-line"
                    lineHeight="1.8"
                  >
                    {result.generated.ingredients}
                  </Text>
                </Box>

                {/* Instructions */}
                <Box
                  bg="white"
                  borderRadius="10px"
                  p={4}
                  mb={3}
                  border="1px solid #E8CCBA"
                >
                  <Text fontWeight="700" color="#8B4513" mb={2} fontSize="sm">
                    👨‍🍳 הוראות הכנה:
                  </Text>
                  <Text
                    color="#1A1A1A"
                    fontSize="sm"
                    whiteSpace="pre-line"
                    lineHeight="1.8"
                  >
                    {result.generated.instructions}
                  </Text>
                </Box>

                {/* Shopping list */}
                {result.generated.shoppingList?.length > 0 && (
                  <Box
                    bg="#FFF8F4"
                    borderRadius="10px"
                    p={4}
                    border="1px solid #E8CCBA"
                  >
                    <Text fontWeight="700" color="#8B4513" mb={2} fontSize="sm">
                      🛒 מה לקנות:
                    </Text>
                    <VStack gap={1} align="flex-start">
                      {result.generated.shoppingList.map((item, i) => (
                        <Text key={i} color="#7D6B62" fontSize="sm">
                          • {item}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                )}
              </Box>
            </>
          )}

          {/* No results at all */}
          {result.found.length === 0 && !result.generated && (
            <Box textAlign="center" py={8} color="#7D6B62">
              לא נמצאו תוצאות. נסה חומרים אחרים.
            </Box>
          )}
        </VStack>
      )}

      {/* Album selection modal */}
      {showModal && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0,0,0,0.4)"
          zIndex={1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={() => setShowModal(false)}
        >
          <Box
            bg="white"
            borderRadius="16px"
            p={7}
            maxW="400px"
            w="90%"
            onClick={e => e.stopPropagation()}
            dir="rtl"
          >
            <Text fontWeight="800" fontSize="lg" color="#1A1A1A" mb={4}>
              בחר אלבום לשמירה
            </Text>

            {albums.length === 0 ? (
              <Text color="#7D6B62" mb={4}>אין אלבומים זמינים. צור אלבום תחילה.</Text>
            ) : (
              <NativeSelect.Root mb={5}>
                <NativeSelect.Field
                  value={selectedAlbumId ?? ''}
                  onChange={e => setSelectedAlbumId(Number(e.target.value))}
                  border="1px solid #F0DDD0"
                  borderRadius="8px"
                >
                  {albums.map(album => (
                    <option key={album.id} value={album.id}>{album.name}</option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            )}

            <HStack gap={3} justify="flex-end">
              <Button
                variant="ghost"
                size="sm"
                color="#7D6B62"
                onClick={() => setShowModal(false)}
              >
                ביטול
              </Button>
              <Button
                size="sm"
                bg="#C9848C"
                color="white"
                _hover={{ bg: '#9E6870' }}
                borderRadius="full"
                px={6}
                onClick={handleSave}
                disabled={saving || albums.length === 0}
              >
                {saving ? 'שומר...' : 'שמור מתכון'}
              </Button>
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  );
}
