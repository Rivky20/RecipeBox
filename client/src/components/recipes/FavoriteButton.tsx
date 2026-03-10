import { useState } from 'react';
import { IconButton, Tooltip } from '@chakra-ui/react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useAuthModal } from '../../context/AuthModalContext';
import { favoriteService } from '../../services/favoriteService';

interface Props {
  recipeId: number;
  isFavorite: boolean;
  onToggle?: (newState: boolean) => void;
}

export default function FavoriteButton({ recipeId, isFavorite, onToggle }: Props) {
  const { user, isAuthenticated } = useAuth();
  const { openLogin } = useAuthModal();
  const [active, setActive] = useState(isFavorite);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }
    if (loading) return;
    setLoading(true);
    try {
      if (active) {
        await favoriteService.removeFavorite(user!.userId, recipeId);
        setActive(false);
        onToggle?.(false);
      } else {
        await favoriteService.addFavorite(user!.userId, recipeId);
        setActive(true);
        onToggle?.(true);
      }
    } catch (err: any) {
      // 409 = already favorited — treat as favorited
      if (err?.response?.status === 409) {
        setActive(true);
        onToggle?.(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <IconButton
          aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
          onClick={handleClick}
          variant="ghost"
          colorPalette={active ? 'yellow' : 'gray'}
          loading={loading}
          size="md"
        >
          {active ? <FaStar color="#ECC94B" /> : <FaRegStar />}
        </IconButton>
      </Tooltip.Trigger>
      <Tooltip.Positioner>
        <Tooltip.Content>
          {isAuthenticated
            ? active ? 'הסר ממועדפים' : 'הוסף למועדפים'
            : 'התחבר כדי להוסיף למועדפים'}
        </Tooltip.Content>
      </Tooltip.Positioner>
    </Tooltip.Root>
  );
}
