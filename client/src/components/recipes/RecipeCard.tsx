import { Box, HStack, Text, Button } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Recipe } from '../../types';
import { useAuth } from '../../context/AuthContext';
import FavoriteButton from './FavoriteButton';
import { FaBookOpen } from 'react-icons/fa';

// Subtle parquet / wood-tile texture
const PARQUET_BG: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  backgroundImage: `
    linear-gradient(45deg, rgba(210,175,140,0.055) 25%, transparent 25%, transparent 75%, rgba(210,175,140,0.055) 75%),
    linear-gradient(-45deg, rgba(210,175,140,0.055) 25%, transparent 25%, transparent 75%, rgba(210,175,140,0.055) 75%)
  `,
  backgroundSize: '28px 28px',
  backgroundPosition: '0 0, 14px 14px',
};

interface Props {
  recipe: Recipe;
  onFavoriteToggle?: (recipeId: number, newState: boolean) => void;
}

export default function RecipeCard({ recipe, onFavoriteToggle }: Props) {
  const { user } = useAuth();
  const isOwner = recipe.userId === user?.userId;

  // Display "אני" for own recipes, or email-username for others
  const ownerLabel = isOwner
    ? 'אני'
    : (recipe.userName || recipe.userEmail?.split('@')[0] || '');

  return (
    <Box
      style={PARQUET_BG}
      border="1px solid"
      borderColor="#F0DDD0"
      borderRadius="2xl"
      overflow="hidden"
      boxShadow="0 2px 14px rgba(210,175,140,0.12)"
      transition="all 0.22s"
      _hover={{ boxShadow: '0 8px 32px rgba(210,175,140,0.22)', transform: 'translateY(-3px)' }}
      display="flex"
      flexDirection="column"
    >
      {/* Recipe image thumbnail */}
      {recipe.imagePath ? (
        <Link to={`/recipes/${recipe.id}`}>
          <img
            src={recipe.imagePath}
            alt={recipe.name}
            style={{
              width: '100%',
              height: '140px',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </Link>
      ) : (
        /* Top accent stripe when no image */
        <Box h="4px" bg="linear-gradient(90deg, #E8919C, #F5C6CB, #F5E1D0)" />
      )}

      <Box p={5} flex={1} display="flex" flexDirection="column" gap={3}>
        {/* Icon + title row */}
        <HStack gap={3} align="flex-start">
          <Box
            flexShrink={0}
            w="36px"
            h="36px"
            bg="#FCE8EA"
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="#E8919C"
            fontSize="md"
          >
            <FaBookOpen />
          </Box>
          <HStack justify="space-between" flex={1} align="flex-start" gap={1}>
            <Text
              fontWeight="700"
              fontSize="md"
              color="#1A1A1A"
              className="recipe-title"
              lineClamp={2}
              flex={1}
            >
              <Link to={`/recipes/${recipe.id}`}>{recipe.name}</Link>
            </Text>
            <FavoriteButton
              recipeId={recipe.id}
              isFavorite={recipe.isFavorite ?? false}
              onToggle={(s) => onFavoriteToggle?.(recipe.id, s)}
            />
          </HStack>
        </HStack>

        {/* Description */}
        {recipe.description && (
          <Text
            color="#7D6B62"
            fontSize="sm"
            lineClamp={2}
            flex={1}
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {recipe.description}
          </Text>
        )}

        {/* Owner badge */}
        {ownerLabel && (
          <Box
            as="span"
            display="inline-flex"
            alignSelf="flex-start"
            alignItems="center"
            bg={isOwner ? '#FCE8EA' : '#F5E1D0'}
            color={isOwner ? '#C97080' : '#7D6B62'}
            fontSize="xs"
            fontWeight="600"
            px={2}
            py="2px"
            borderRadius="full"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {ownerLabel}
          </Box>
        )}
      </Box>

      <Box px={5} pb={5}>
        <Link to={`/recipes/${recipe.id}`} style={{ display: 'block' }}>
          <Button
            size="sm"
            width="full"
            variant="outline"
            borderColor="#E8919C"
            color="#C97080"
            _hover={{ bg: '#FCE8EA' }}
            borderRadius="xl"
            fontWeight="600"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            צפה במתכון
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
