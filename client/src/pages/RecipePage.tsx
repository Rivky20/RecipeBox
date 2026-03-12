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
import { convertUnits, multiplyRecipe } from '../services/geminiService';

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
  const [displayIngredients, setDisplayIngredients] = useState('');
  const [displayInstructions, setDisplayInstructions] = useState('');
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState(2);
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    if (!id) return;
    recipeService.getRecipe(Number(id))
      .then((r) => {
        setRecipe(r);
        setDisplayIngredients(r.ingredients ?? '');
        setDisplayInstructions(r.instructions ?? '');
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

  const handleCopyLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // fallback for older browsers / non-HTTPS
      const el = document.createElement('textarea');
      el.value = url;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    if (!isAuthenticated) { openLogin(); return; }
    window.print();
  };

  const handleConvert = async (to: 'cups' | 'grams') => {
    if (!displayIngredients.trim()) return;
    setAiLoading(`convert_${to}`);
    try {
      setDisplayIngredients(await convertUnits(displayIngredients, to));
      setIsModified(true);
    } catch { /* silent */ }
    setAiLoading(null);
  };

  const handleMultiply = async () => {
    if (!displayIngredients.trim()) return;
    setAiLoading('multiply');
    try {
      const res = await multiplyRecipe(displayIngredients, displayInstructions, multiplier);
      setDisplayIngredients(res.ingredients);
      setDisplayInstructions(res.instructions);
      setIsModified(true);
    } catch { /* silent */ }
    setAiLoading(null);
  };

  const handleReset = () => {
    setDisplayIngredients(recipe?.ingredients ?? '');
    setDisplayInstructions(recipe?.instructions ?? '');
    setIsModified(false);
    setMultiplier(2);
  };

  const AIPillBtn = ({
    label, loadingKey, onClick, disabled,
  }: { label: string; loadingKey: string; onClick: () => void; disabled?: boolean }) => {
    const isLoading = aiLoading === loadingKey;
    return (
      <button
        onClick={onClick}
        disabled={isLoading || !!disabled || !!aiLoading}
        style={{
          padding: '4px 11px',
          borderRadius: '20px',
          border: '1.5px solid #E8C5C9',
          background: isLoading ? '#F5E6E8' : 'white',
          color: '#9E6870',
          fontSize: '12px',
          fontWeight: 600,
          cursor: (isLoading || disabled || aiLoading) ? 'not-allowed' : 'pointer',
          opacity: (disabled && !isLoading) ? 0.45 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s',
          fontFamily: "'Nunito', sans-serif",
        }}
      >
        {isLoading ? '⏳' : '✨'} {label}
      </button>
    );
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
            style={{ color: '#9E6870', fontWeight: 600 }}
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
            {' · '}
            {isOwner ? 'אני' : (recipe.userName || recipe.userEmail?.split('@')[0] || '')}
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
            borderColor={copied ? '#4CAF50' : '#C9848C'}
            color={copied ? '#4CAF50' : '#9E6870'}
            _hover={{ bg: copied ? '#F0FFF0' : '#F5E6E8' }}
            onClick={handleCopyLink}
          >
            {copied ? <FaCheck /> : <FaShareAlt />} {copied ? 'הועתק!' : 'שתף'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            borderColor="#C9848C"
            color="#9E6870"
            _hover={{ bg: '#F5E6E8' }}
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
          style={{ fontFamily: "'Nunito', sans-serif" }}
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
              borderColor="#C9848C"
              color="#9E6870"
              _hover={{ bg: '#F5E6E8' }}
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
            {/* AI Toolbar */}
            <Box
              bg="#FFFAF7"
              border="1.5px solid #F0DDD0"
              borderRadius="xl"
              px={4}
              py={2}
              mb={4}
            >
              <HStack gap={2} flexWrap="wrap" justify="space-between" align="center">
                <HStack gap={2} flexWrap="wrap">
                  <AIPillBtn label="המר לכוסות" loadingKey="convert_cups" onClick={() => handleConvert('cups')} />
                  <AIPillBtn label="המר לגרמים" loadingKey="convert_grams" onClick={() => handleConvert('grams')} />
                </HStack>
                <HStack gap={1} align="center">
                  <Text fontSize="xs" color="#9E6870" fontWeight={600}>כפל מתכון:</Text>
                  <button
                    onClick={() => setMultiplier(m => Math.max(1, m - 1))}
                    style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      border: '1.5px solid #E8C5C9', background: 'white',
                      color: '#9E6870', fontWeight: 700, fontSize: '14px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >−</button>
                  <Text fontSize="sm" fontWeight={700} color="#7D6B62" minW="28px" textAlign="center">×{multiplier}</Text>
                  <button
                    onClick={() => setMultiplier(m => Math.min(10, m + 1))}
                    style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      border: '1.5px solid #E8C5C9', background: 'white',
                      color: '#9E6870', fontWeight: 700, fontSize: '14px',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >+</button>
                  <AIPillBtn label="הכפל" loadingKey="multiply" onClick={handleMultiply} />
                  {isModified && (
                    <button
                      onClick={handleReset}
                      title="חזור למקור"
                      style={{
                        padding: '4px 10px', borderRadius: '20px',
                        border: '1.5px solid #F0DDD0', background: 'white',
                        color: '#BBAAA0', fontSize: '12px', fontWeight: 600,
                        cursor: 'pointer', whiteSpace: 'nowrap',
                        fontFamily: "'Nunito', sans-serif",
                      }}
                    >
                      ↩ איפוס
                    </button>
                  )}
                </HStack>
              </HStack>
            </Box>

            <HStack align="flex-start" gap={6} wrap="wrap">
              <Box flex={1} minW="200px">
                <Heading size="md" mb={3} style={{ fontFamily: "'Nunito', sans-serif" }}>מצרכים</Heading>
                <Box
                  as="pre" whiteSpace="pre-wrap"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                  bg="#FFF8F4" border="1px solid" borderColor="#F0DDD0"
                  p={4} borderRadius="xl" fontSize="sm" color="#4A3728"
                >
                  {displayIngredients}
                </Box>
              </Box>

              <Box flex={2} minW="250px">
                <Heading size="md" mb={3} style={{ fontFamily: "'Nunito', sans-serif" }}>הוראות הכנה</Heading>
                <Box
                  as="pre" whiteSpace="pre-wrap"
                  style={{ fontFamily: "'Nunito', sans-serif" }}
                  bg="#FFF8F4" border="1px solid" borderColor="#F0DDD0"
                  p={4} borderRadius="xl" fontSize="sm" color="#4A3728"
                >
                  {displayInstructions}
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
