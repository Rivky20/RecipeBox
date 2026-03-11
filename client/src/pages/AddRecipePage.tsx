import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Heading, Text } from '@chakra-ui/react';
import confetti from 'canvas-confetti';
import { CreateRecipeRequest } from '../types';
import { recipeService } from '../services/recipeService';
import RecipeForm from '../components/recipes/RecipeForm';

const PALETTE = ['#E8919C', '#F5C6CB', '#F5E1D0', '#C97080', '#FAF0E8', '#1A1A1A'];

export default function AddRecipePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAlbumId = Number(searchParams.get('albumId')) || 0;

  const [success, setSuccess] = useState(false);
  const [targetAlbumId, setTargetAlbumId] = useState<number>(0);
  const confettiFired = useRef(false);

  useEffect(() => {
    if (success && targetAlbumId) {
      if (!confettiFired.current) {
        confettiFired.current = true;
        confetti({ particleCount: 130, spread: 80, origin: { y: 0.5 }, colors: PALETTE });
        setTimeout(() => {
          confetti({ particleCount: 70, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, colors: PALETTE });
          confetti({ particleCount: 70, angle: 60,  spread: 55, origin: { x: 0, y: 0.6 }, colors: PALETTE });
        }, 300);
      }

      const timer = setTimeout(() => {
        navigate(`/albums/${targetAlbumId}`);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [success, targetAlbumId, navigate]);

  const handleSubmit = async (data: CreateRecipeRequest) => {
    const created = await recipeService.createRecipe(data);
    setTargetAlbumId(created.albumId);
    setSuccess(true);
  };

  if (success) {
    return (
      <Box
        maxW="460px"
        mx="auto"
        mt={20}
        dir="rtl"
        textAlign="center"
        p={12}
        bg="white"
        border="1px solid"
        borderColor="#F0DDD0"
        borderRadius="3xl"
        boxShadow="0 8px 40px rgba(232,145,156,0.18)"
      >
        <Text fontSize="5xl" mb={5}>🎀</Text>
        <Heading
          size="xl"
          mb={3}
          style={{ fontFamily: "'Nunito', sans-serif", color: '#C97080' }}
        >
          המתכון נוסף בהצלחה!
        </Heading>
        <Text color="#7D6B62" fontSize="md">מעביר אותך לאלבום...</Text>
        {/* Animated dots */}
        <Box mt={6} display="flex" justifyContent="center" gap={2}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              w="8px"
              h="8px"
              bg="#E8919C"
              borderRadius="full"
              style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </Box>
        <style>{`
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
            40% { transform: translateY(-8px); opacity: 1; }
          }
        `}</style>
      </Box>
    );
  }

  return (
    <Box maxW="700px" mx="auto" dir="rtl">
      <Heading
        size="xl"
        mb={8}
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >
        הוספת מתכון חדש
      </Heading>
      <RecipeForm
        initialAlbumId={initialAlbumId}
        onSubmit={handleSubmit}
        submitLabel="צור מתכון"
      />
    </Box>
  );
}
