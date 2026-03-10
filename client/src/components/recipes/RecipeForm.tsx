import { useEffect, useRef, useState } from 'react';
import {
  Alert, Box, Button, Field, Grid, HStack, Input,
  NativeSelect, Stack, Textarea, Text,
} from '@chakra-ui/react';
import { Album, CreateRecipeRequest, Recipe, RecipeType } from '../../types';
import { albumService } from '../../services/albumService';
import { imageService } from '../../services/imageService';
import { FaCloudUploadAlt } from 'react-icons/fa';

interface Props {
  initial?: Recipe;
  initialAlbumId?: number;
  onSubmit: (data: CreateRecipeRequest) => Promise<void>;
  submitLabel: string;
}

export default function RecipeForm({ initial, initialAlbumId, onSubmit, submitLabel }: Props) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [albumId, setAlbumId] = useState<number>(initial?.albumId ?? initialAlbumId ?? 0);
  const [recipeType, setRecipeType] = useState<RecipeType>(initial?.recipeType ?? 'Text');
  const [link, setLink] = useState(initial?.link ?? '');
  const [ingredients, setIngredients] = useState(initial?.ingredients ?? '');
  const [instructions, setInstructions] = useState(initial?.instructions ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initial?.imagePath ?? '');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    albumService.getAlbums().then(setAlbums);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'שם המתכון נדרש.';
    if (!albumId) e.albumId = 'נא לבחור אלבום.';
    if (recipeType === 'Link' && !link.trim()) e.link = 'כתובת הקישור נדרשת.';
    if (recipeType === 'Text' && !ingredients.trim()) e.ingredients = 'נא להזין מרכיבים.';
    if (recipeType === 'Text' && !instructions.trim()) e.instructions = 'נא להזין הוראות הכנה.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setLoading(true);
    try {
      let imagePath: string | null = initial?.imagePath ?? null;
      if (imageFile) {
        setUploading(true);
        imagePath = await imageService.upload(imageFile);
        setUploading(false);
      }
      const payload: CreateRecipeRequest = {
        name,
        description,
        albumId,
        recipeType,
        imagePath,
        link: recipeType === 'Link' ? link : null,
        ingredients: recipeType === 'Text' ? ingredients : null,
        instructions: recipeType === 'Text' ? instructions : null,
      };
      await onSubmit(payload);
    } catch (err: any) {
      setUploading(false);
      const msg = err?.response?.data?.message || err?.message || 'שגיאה בשמירת המתכון. נסה שוב.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const typeBtn = (t: RecipeType): React.CSSProperties => ({
    padding: '8px 22px',
    borderRadius: '12px',
    border: `2px solid ${recipeType === t ? '#E8919C' : '#F0DDD0'}`,
    background: recipeType === t ? '#FCE8EA' : 'white',
    color: recipeType === t ? '#C97080' : '#7D6B62',
    fontWeight: recipeType === t ? 700 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontSize: '14px',
    fontFamily: "'Heebo', sans-serif",
  });

  return (
    <form onSubmit={handleSubmit} dir="rtl">
      <Stack gap={5}>
        {apiError && (
          <Alert.Root status="error" borderRadius="md">
            <Alert.Indicator />
            <Alert.Description>{apiError}</Alert.Description>
          </Alert.Root>
        )}

        {/* Row 1: Name | Description */}
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
          <Field.Root invalid={!!errors.name}>
            <Field.Label>שם המתכון *</Field.Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="לדוגמה: עוגת שוקולד" />
            {errors.name && <Field.ErrorText>{errors.name}</Field.ErrorText>}
          </Field.Root>

          <Field.Root>
            <Field.Label>תיאור</Field.Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="תיאור קצר..." />
          </Field.Root>
        </Grid>

        {/* Row 2: Album | Recipe Type */}
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
          <Field.Root invalid={!!errors.albumId}>
            <Field.Label>אלבום *</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field value={albumId} onChange={(e) => setAlbumId(Number(e.target.value))}>
                <option value={0}>-- בחר אלבום --</option>
                {albums.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
            {errors.albumId && <Field.ErrorText>{errors.albumId}</Field.ErrorText>}
          </Field.Root>

          <Field.Root>
            <Field.Label>סוג מתכון *</Field.Label>
            <HStack gap={3}>
              {(['Text', 'Link'] as RecipeType[]).map((t) => (
                <button key={t} type="button" onClick={() => setRecipeType(t)} style={typeBtn(t)}>
                  {t === 'Text' ? '📝 טקסט מלא' : '🔗 קישור'}
                </button>
              ))}
            </HStack>
          </Field.Root>
        </Grid>

        {/* Link URL */}
        {recipeType === 'Link' && (
          <Field.Root invalid={!!errors.link}>
            <Field.Label>כתובת URL למתכון *</Field.Label>
            <Input type="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
            {errors.link && <Field.ErrorText>{errors.link}</Field.ErrorText>}
          </Field.Root>
        )}

        {/* Row 3: Ingredients | Instructions (side by side, Text type only) */}
        {recipeType === 'Text' && (
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4} alignItems="flex-start">
            <Field.Root invalid={!!errors.ingredients}>
              <Field.Label>מרכיבים *</Field.Label>
              <Textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="רשום מרכיב אחד בכל שורה..."
                rows={7}
              />
              {errors.ingredients && <Field.ErrorText>{errors.ingredients}</Field.ErrorText>}
            </Field.Root>

            <Field.Root invalid={!!errors.instructions}>
              <Field.Label>הוראות הכנה *</Field.Label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="הוראות שלב אחר שלב..."
                rows={7}
              />
              {errors.instructions && <Field.ErrorText>{errors.instructions}</Field.ErrorText>}
            </Field.Root>
          </Grid>
        )}

        {/* Image Upload */}
        <Field.Root>
          <Field.Label>
            תמונה <Text as="span" color="gray.400" fontSize="sm">(אופציונלי)</Text>
          </Field.Label>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageChange}
          />

          <Box
            border="2px dashed"
            borderColor={imagePreview ? '#E8919C' : '#F0DDD0'}
            borderRadius="xl"
            p={4}
            textAlign="center"
            cursor="pointer"
            bg={imagePreview ? '#FFFAF7' : 'white'}
            _hover={{ borderColor: '#E8919C', bg: '#FFFAF7' }}
            transition="all 0.15s"
            onClick={() => fileInputRef.current?.click()}
          >
            {imagePreview ? (
              <Box>
                <img
                  src={imagePreview}
                  alt="preview"
                  style={{ maxHeight: '180px', borderRadius: '10px', margin: '0 auto', display: 'block', objectFit: 'cover' }}
                />
                <Text fontSize="xs" color="#7D6B62" mt={2}>לחץ להחלפה</Text>
              </Box>
            ) : (
              <Box color="#C0A090">
                <Box fontSize="2xl" mb={1} display="flex" justifyContent="center"><FaCloudUploadAlt /></Box>
                <Text fontSize="sm" color="#7D6B62">לחץ לבחירת תמונה</Text>
                <Text fontSize="xs" color="#BBAAA0" mt={1}>JPG, PNG, GIF, WebP — עד 10MB</Text>
              </Box>
            )}
          </Box>
        </Field.Root>

        <Button
          type="submit"
          size="lg"
          bg="#E8919C"
          color="white"
          _hover={{ bg: '#C97080' }}
          borderRadius="xl"
          fontWeight="700"
          loading={loading || uploading}
          loadingText={uploading ? 'מעלה תמונה...' : 'שומר...'}
          style={{ fontFamily: "'Heebo', sans-serif" }}
        >
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}
