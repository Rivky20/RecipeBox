import { useEffect, useRef, useState } from 'react';
import {
  Alert, Box, Button, Field, Grid, HStack, Input,
  NativeSelect, Stack, Textarea, Text,
} from '@chakra-ui/react';
import { Album, CreateRecipeRequest, Recipe, RecipeType } from '../../types';
import { albumService } from '../../services/albumService';
import { imageService } from '../../services/imageService';
import { FaCloudUploadAlt, FaMicrophone, FaStop } from 'react-icons/fa';
import { improveText, suggestNameAndDescription } from '../../services/geminiService';

type RecordingField = 'ingredients' | 'instructions' | null;

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
  const [imageUrl, setImageUrl] = useState<string>(initial?.imagePath ?? '');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recordingField, setRecordingField] = useState<RecordingField>(null);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [undoIngredients, setUndoIngredients] = useState<string | null>(null);
  const [undoInstructions, setUndoInstructions] = useState<string | null>(null);

  useEffect(() => {
    albumService.getAlbums().then(setAlbums);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const startRecording = (field: 'ingredients' | 'instructions') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('הדפדפן שלך אינו תומך בזיהוי קול. נסה Chrome.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'he-IL';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;
    setRecordingField(field);
    setInterimText('');

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      setInterimText(interim);
      if (final) {
        if (field === 'ingredients') {
          setIngredients(prev => prev + (prev.trim() ? '\n' : '') + final.trim());
        } else {
          setInstructions(prev => prev + (prev.trim() ? '\n' : '') + final.trim());
        }
      }
    };

    recognition.onend = () => {
      setRecordingField(null);
      setInterimText('');
    };

    recognition.onerror = () => {
      setRecordingField(null);
      setInterimText('');
    };

    recognition.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecordingField(null);
    setInterimText('');
  };

  const MicButton = ({ field }: { field: 'ingredients' | 'instructions' }) => {
    const isRecording = recordingField === field;
    return (
      <button
        type="button"
        onClick={() => isRecording ? stopRecording() : startRecording(field)}
        title={isRecording ? 'עצור הקלטה' : 'הקלט קול'}
        style={{
          background: isRecording ? '#E53E3E' : '#F5E6E8',
          border: `2px solid ${isRecording ? '#C53030' : '#C9848C'}`,
          borderRadius: '50%',
          width: '34px',
          height: '34px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isRecording ? 'white' : '#9E6870',
          flexShrink: 0,
          animation: isRecording ? 'pulse 1.2s infinite' : 'none',
        }}
      >
        {isRecording ? <FaStop size={13} /> : <FaMicrophone size={14} />}
      </button>
    );
  };

  const handleImprove = async (field: 'ingredients' | 'instructions') => {
    const text = field === 'ingredients' ? ingredients : instructions;
    if (!text.trim()) return;
    setAiLoading(`improve_${field}`);
    try {
      const improved = await improveText(text, field);
      if (field === 'ingredients') {
        setUndoIngredients(text);
        setIngredients(improved);
      } else {
        setUndoInstructions(text);
        setInstructions(improved);
      }
    } catch {
      setAiError('שיפור הטקסט נכשל — נסה שוב.');
    }
    setAiLoading(null);
  };

  const handleUndoImprove = (field: 'ingredients' | 'instructions') => {
    if (field === 'ingredients' && undoIngredients !== null) {
      setIngredients(undoIngredients);
      setUndoIngredients(null);
    } else if (field === 'instructions' && undoInstructions !== null) {
      setInstructions(undoInstructions);
      setUndoInstructions(null);
    }
  };

  const handleSuggest = async () => {
    if (!ingredients.trim()) return;
    setAiLoading('suggest');
    setAiError(null);
    try {
      const { name: n, description: d } = await suggestNameAndDescription(ingredients);
      setName(n);
      setDescription(d);
    } catch {
      setAiError('לא הצלחנו להציע שם — נסה שוב.');
    }
    setAiLoading(null);
  };

  const AIPillBtn = ({
    label, loadingKey, onClick, disabled,
  }: { label: string; loadingKey: string; onClick: () => void; disabled?: boolean }) => {
    const isLoading = aiLoading === loadingKey;
    return (
      <button
        type="button"
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
      if (recipeType === 'Link') {
        imagePath = imageUrl.trim() || null;
      } else if (imageMode === 'url') {
        imagePath = imageUrl.trim() || null;
      } else if (imageFile) {
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

  const typeBtn = (active: RecipeType | boolean): React.CSSProperties => {
    const isActive = typeof active === 'boolean' ? active : recipeType === active;
    return {
      padding: '8px 22px',
      borderRadius: '12px',
      border: `2px solid ${isActive ? '#C9848C' : '#F0DDD0'}`,
      background: isActive ? '#F5E6E8' : 'white',
      color: isActive ? '#9E6870' : '#7D6B62',
      fontWeight: isActive ? 700 : 400,
      cursor: 'pointer',
      transition: 'all 0.15s',
      fontSize: '14px',
      fontFamily: "'Nunito', sans-serif",
    };
  };

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
              <HStack justify="space-between" align="center">
                <Field.Label mb={0}>מרכיבים *</Field.Label>
                <HStack gap={1}>
                  <AIPillBtn label="שפר" loadingKey="improve_ingredients" onClick={() => handleImprove('ingredients')} disabled={!ingredients.trim()} />
                  {undoIngredients !== null && (
                    <button type="button" onClick={() => handleUndoImprove('ingredients')} title="בטל שיפור" style={{ padding: '4px 9px', borderRadius: '20px', border: '1.5px solid #F0DDD0', background: 'white', color: '#BBAAA0', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Nunito', sans-serif" }}>↩ ביטול</button>
                  )}
                  <MicButton field="ingredients" />
                </HStack>
              </HStack>
              <Textarea
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="רשום מרכיב אחד בכל שורה..."
                rows={7}
                borderColor={recordingField === 'ingredients' ? '#E53E3E' : undefined}
                _focus={{ borderColor: recordingField === 'ingredients' ? '#E53E3E' : '#C9848C' }}
              />
              {recordingField === 'ingredients' && interimText && (
                <Text fontSize="xs" color="#E53E3E" mt={1} fontStyle="italic">
                  🎤 {interimText}
                </Text>
              )}
              {recordingField === 'ingredients' && !interimText && (
                <Text fontSize="xs" color="#E53E3E" mt={1}>🎤 מקשיב...</Text>
              )}
              {errors.ingredients && <Field.ErrorText>{errors.ingredients}</Field.ErrorText>}
            </Field.Root>

            <Field.Root invalid={!!errors.instructions}>
              <HStack justify="space-between" align="center">
                <Field.Label mb={0}>הוראות הכנה *</Field.Label>
                <HStack gap={1}>
                  <AIPillBtn label="שפר" loadingKey="improve_instructions" onClick={() => handleImprove('instructions')} disabled={!instructions.trim()} />
                  {undoInstructions !== null && (
                    <button type="button" onClick={() => handleUndoImprove('instructions')} title="בטל שיפור" style={{ padding: '4px 9px', borderRadius: '20px', border: '1.5px solid #F0DDD0', background: 'white', color: '#BBAAA0', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Nunito', sans-serif" }}>↩ ביטול</button>
                  )}
                  <MicButton field="instructions" />
                </HStack>
              </HStack>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="הוראות שלב אחר שלב..."
                rows={7}
                borderColor={recordingField === 'instructions' ? '#E53E3E' : undefined}
                _focus={{ borderColor: recordingField === 'instructions' ? '#E53E3E' : '#C9848C' }}
              />
              {recordingField === 'instructions' && interimText && (
                <Text fontSize="xs" color="#E53E3E" mt={1} fontStyle="italic">
                  🎤 {interimText}
                </Text>
              )}
              {recordingField === 'instructions' && !interimText && (
                <Text fontSize="xs" color="#E53E3E" mt={1}>🎤 מקשיב...</Text>
              )}
              {errors.instructions && <Field.ErrorText>{errors.instructions}</Field.ErrorText>}
            </Field.Root>
          </Grid>
        )}

        {/* AI Toolbar — suggest name/description */}
        {recipeType === 'Text' && (
          <HStack justify="flex-end" align="center" gap={3}>
            {aiError && (
              <Text fontSize="xs" color="#9E6870">{aiError}</Text>
            )}
            <AIPillBtn
              label="הצע שם ותיאור לפי המרכיבים"
              loadingKey="suggest"
              onClick={handleSuggest}
              disabled={!ingredients.trim()}
            />
          </HStack>
        )}

        {/* Image */}
        <Field.Root>
          <Field.Label>
            תמונה <Text as="span" color="gray.400" fontSize="sm">(אופציונלי)</Text>
          </Field.Label>

          {recipeType === 'Link' ? (
            /* Link type — URL only */
            <Input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... (URL לתמונה)"
            />
          ) : (
            /* Text type — toggle between upload / url */
            <Stack gap={3}>
              <HStack gap={2}>
                <button type="button" onClick={() => setImageMode('upload')} style={typeBtn(imageMode === 'upload')}>
                  ⬆️ העלאת קובץ
                </button>
                <button type="button" onClick={() => setImageMode('url')} style={typeBtn(imageMode === 'url')}>
                  🔗 כתובת URL
                </button>
              </HStack>

              {imageMode === 'url' ? (
                <Input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... (URL לתמונה)"
                />
              ) : (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  <Box
                    border="2px dashed"
                    borderColor={imagePreview ? '#C9848C' : '#F0DDD0'}
                    borderRadius="xl"
                    p={4}
                    textAlign="center"
                    cursor="pointer"
                    bg={imagePreview ? '#FFFAF7' : 'white'}
                    _hover={{ borderColor: '#C9848C', bg: '#FFFAF7' }}
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
                </>
              )}
            </Stack>
          )}
        </Field.Root>

        <Button
          type="submit"
          size="lg"
          bg="#C9848C"
          color="white"
          _hover={{ bg: '#9E6870' }}
          borderRadius="xl"
          fontWeight="700"
          loading={loading || uploading}
          loadingText={uploading ? 'מעלה תמונה...' : 'שומר...'}
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}
