import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Box, Button, Heading, HStack, Separator, Text, Badge,
} from '@chakra-ui/react';
import { Album, Recipe } from '../types';
import { recipeService } from '../services/recipeService';
import { albumService } from '../services/albumService';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import FavoriteButton from '../components/recipes/FavoriteButton';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { FaDownload, FaEdit, FaTrash, FaShareAlt, FaCheck, FaArrowRight } from 'react-icons/fa';

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { openLogin } = useAuthModal();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    recipeService.getRecipe(Number(id))
      .then((r) => {
        setRecipe(r);
        return albumService.getAlbum(r.albumId);
      })
      .then(setAlbum)
      .catch(() => setError('המתכון לא נמצא.'))
      .finally(() => setLoading(false));
  }, [id]);

  const isOwner = recipe?.userId === user?.userId;
  const canEdit = isOwner || isAdmin;

  const handleDelete = async () => {
    if (!recipe) return;
    setDeleting(true);
    try {
      await recipeService.deleteRecipe(recipe.id);
      navigate(`/albums/${recipe.albumId}`);
    } catch {
      setError('מחיקת המתכון נכשלה.');
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    if (!isAuthenticated) { openLogin(); return; }
    window.print();
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!recipe) return null;

  return (
    <div dir="rtl">
      {/* Top row: breadcrumb + back button */}
      <HStack justify="space-between" align="center" mb={4}>
        <Text fontSize="sm" color="gray.500">
          <Link to="/">אלבומים</Link>
          {' › '}
          <Link
            to={`/albums/${recipe.albumId}`}
            style={{ color: '#C97080', fontWeight: 600 }}
          >
            {recipe.albumName || 'אלבום'}
          </Link>
          {' › '}
          {recipe.name}
        </Text>

        {/* Back button — top right */}
        <Button
          size="sm"
          variant="ghost"
          color="#7D6B62"
          _hover={{ bg: '#F5E1D0', color: '#5C3520' }}
          borderRadius="full"
          onClick={() => navigate(`/albums/${recipe.albumId}`)}
          gap={1}
        >
          <FaArrowRight /> חזרה לאלבום
        </Button>
      </HStack>

      {/* Header */}
      <HStack justify="space-between" align="flex-start" mb={4} wrap="wrap" gap={3}>
        <Box flex={1}>
          <HStack gap={3} mb={2} wrap="wrap">
            <Heading size="2xl">{recipe.name}</Heading>
            <Badge colorPalette={recipe.recipeType === 'Link' ? 'blue' : 'green'}>
              {recipe.recipeType === 'Link' ? 'קישור' : 'טקסט'}
            </Badge>
            {album && (
              <Link to={`/albums/${recipe.albumId}`}>
                <Badge
                  bg="#F5E1D0"
                  color="#7D4F3A"
                  fontSize="xs"
                  px={3}
                  py={1}
                  borderRadius="full"
                  cursor="pointer"
                  _hover={{ bg: '#EDD0BB' }}
                >
                  {album.name} · {album.recipeCount} {album.recipeCount === 1 ? 'מתכון' : 'מתכונים'}
                </Badge>
              </Link>
            )}
          </HStack>
          <Text color="gray.500" fontSize="sm">
            נוסף ב‑{new Date(recipe.createdAt).toLocaleDateString('he-IL')}
          </Text>
        </Box>

        <HStack gap={2} wrap="wrap">
          <FavoriteButton
            recipeId={recipe.id}
            isFavorite={recipe.isFavorite ?? false}
            onToggle={(s) => setRecipe((r) => r ? { ...r, isFavorite: s } : r)}
          />
          <Button
            size="sm"
            variant="outline"
            borderColor={copied ? '#4CAF50' : '#E8919C'}
            color={copied ? '#4CAF50' : '#C97080'}
            _hover={{ bg: copied ? '#F0FFF0' : '#FCE8EA' }}
            onClick={handleCopyLink}
          >
            {copied ? <FaCheck /> : <FaShareAlt />} {copied ? 'הועתק!' : 'שתף'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            borderColor="#E8919C"
            color="#C97080"
            _hover={{ bg: '#FCE8EA' }}
            onClick={handleDownloadPdf}
            title={!isAuthenticated ? 'התחבר כדי להוריד' : 'הורד PDF'}
          >
            <FaDownload /> הורד PDF
          </Button>
          {canEdit && (
            <>
              <Link to={`/recipes/${recipe.id}/edit`}>
                <Button size="sm" variant="outline" borderColor="#93C5FD" color="#2563EB" _hover={{ bg: '#EFF6FF' }}>
                  <FaEdit /> עריכה
                </Button>
              </Link>
              <Button size="sm" variant="outline" borderColor="#FCA5A5" color="#DC2626" _hover={{ bg: '#FEF2F2' }} onClick={() => setConfirmOpen(true)}>
                <FaTrash /> מחיקה
              </Button>
            </>
          )}
        </HStack>
      </HStack>

      {/* Description */}
      {recipe.description && (
        <Text color="gray.700" mb={5} fontSize="lg"
          style={{ fontFamily: "'Rubik', 'Heebo', sans-serif" }}
        >
          {recipe.description}
        </Text>
      )}

      <Separator mb={5} />

      {/* Link type */}
      {recipe.recipeType === 'Link' && (
        <Box>
          {/* Small image for link recipes */}
          {recipe.imagePath && (
            <Box mb={4}>
              <img
                src={recipe.imagePath}
                alt={recipe.name}
                style={{ height: '120px', borderRadius: '12px', objectFit: 'cover' }}
              />
            </Box>
          )}
          <Heading size="md" mb={3}>קישור למתכון</Heading>
          <a href={recipe.link!} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              borderColor="#E8919C"
              color="#C97080"
              _hover={{ bg: '#FCE8EA' }}
            >
              פתח מתכון ←
            </Button>
          </a>
        </Box>
      )}

      {/* Text type — image left + ingredients/instructions */}
      {recipe.recipeType === 'Text' && (
        <Box display="flex" gap={6} alignItems="flex-start" flexWrap="wrap">
          {/* Image: left side, ~1/3 size */}
          {recipe.imagePath && (
            <Box flexShrink={0} w={{ base: '100%', md: '200px' }}>
              <img
                src={recipe.imagePath}
                alt={recipe.name}
                style={{
                  width: '100%',
                  maxHeight: '240px',
                  borderRadius: '14px',
                  objectFit: 'cover',
                  boxShadow: '0 4px 16px rgba(210,175,140,0.18)',
                }}
              />
            </Box>
          )}

          {/* Ingredients + Instructions */}
          <Box flex={1} minW="280px">
            <HStack align="flex-start" gap={6} wrap="wrap">
              <Box flex={1} minW="200px">
                <Heading size="md" mb={3}
                  style={{ fontFamily: "'Frank Ruhl Libre', Georgia, serif" }}
                >
                  מצרכים
                </Heading>
                <Box
                  as="pre"
                  whiteSpace="pre-wrap"
                  style={{ fontFamily: "'Rubik', 'Heebo', sans-serif" }}
                  bg="#FFF8F4"
                  border="1px solid"
                  borderColor="#F0DDD0"
                  p={4}
                  borderRadius="xl"
                  fontSize="sm"
                  color="#4A3728"
                >
                  {recipe.ingredients}
                </Box>
              </Box>

              <Box flex={2} minW="250px">
                <Heading size="md" mb={3}
                  style={{ fontFamily: "'Frank Ruhl Libre', Georgia, serif" }}
                >
                  הוראות הכנה
                </Heading>
                <Box
                  as="pre"
                  whiteSpace="pre-wrap"
                  style={{ fontFamily: "'Rubik', 'Heebo', sans-serif" }}
                  bg="#FFF8F4"
                  border="1px solid"
                  borderColor="#F0DDD0"
                  p={4}
                  borderRadius="xl"
                  fontSize="sm"
                  color="#4A3728"
                >
                  {recipe.instructions}
                </Box>
              </Box>
            </HStack>
          </Box>
        </Box>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="מחיקת מתכון"
        message={`האם למחוק את "${recipe.name}"? לא ניתן לבטל פעולה זו.`}
        confirmLabel="מחק"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />
    </div>
  );
}
