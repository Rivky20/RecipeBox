import { useEffect, useRef, useState } from 'react';
import {
  Box, Button, Field, Heading, HStack, Input, Stack, Table, Text, Textarea,
} from '@chakra-ui/react';
import { Album, CreateAlbumRequest } from '../../types';
import { albumService } from '../../services/albumService';
import { imageService } from '../../services/imageService';
import Spinner from '../../components/common/Spinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

export default function AdminAlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [editing, setEditing] = useState<Album | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imagePath, setImagePath] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Album | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { load(); }, []);

  const load = () =>
    albumService.getAlbums()
      .then(setAlbums)
      .catch(() => setError('טעינת האלבומים נכשלה.'))
      .finally(() => setLoading(false));

  const openAdd = () => { setEditing(null); setName(''); setDescription(''); setImagePath(''); setFormError(''); setShowForm(true); };
  const openEdit = (a: Album) => { setEditing(a); setName(a.name); setDescription(a.description); setImagePath(a.imagePath ?? ''); setFormError(''); setShowForm(true); };
  const closeForm = () => { setShowForm(false); if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await imageService.upload(file);
      setImagePath(url);
    } catch {
      setFormError('העלאת התמונה נכשלה.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { setFormError('שם הוא שדה חובה.'); return; }
    setSaving(true);
    try {
      const payload: CreateAlbumRequest = { name, description, imagePath: imagePath || null };
      if (editing) {
        const updated = await albumService.updateAlbum(editing.id, payload);
        setAlbums((prev) => prev.map((a) => a.id === editing.id ? updated : a));
      } else {
        const created = await albumService.createAlbum(payload);
        setAlbums((prev) => [...prev, created]);
      }
      closeForm();
    } catch {
      setFormError('שמירת האלבום נכשלה.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await albumService.deleteAlbum(deleteTarget.id);
      setAlbums((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setError('מחיקת האלבום נכשלה.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div dir="rtl">
      <HStack justify="space-between" mb={6}>
        <Heading size="xl">אלבומים</Heading>
        <Button colorPalette="teal" onClick={openAdd}><FaPlus /> אלבום חדש</Button>
      </HStack>

      {error && <ErrorMessage message={error} />}

      {/* Form */}
      {showForm && (
        <Box bg="white" p={6} borderRadius="lg" shadow="md" mb={6}>
          <Heading size="md" mb={4}>{editing ? 'עריכת אלבום' : 'אלבום חדש'}</Heading>
          <Stack gap={4}>
            <Field.Root invalid={!!formError}>
              <Field.Label>שם *</Field.Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="שם האלבום" />
              {formError && <Field.ErrorText>{formError}</Field.ErrorText>}
            </Field.Root>
            <Field.Root>
              <Field.Label>תיאור</Field.Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </Field.Root>
            <Field.Root>
              <Field.Label>תמונת רקע</Field.Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <HStack gap={3} align="center">
                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="teal"
                  loading={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePath ? 'החלף תמונה' : 'העלה תמונה'}
                </Button>
                {imagePath && (
                  <Box
                    as="img"
                    src={imagePath}
                    alt="תצוגה מקדימה"
                    h="48px"
                    w="72px"
                    objectFit="cover"
                    borderRadius="md"
                    border="1px solid"
                    borderColor="#EDE0D8"
                  />
                )}
                {imagePath && (
                  <Button size="xs" variant="ghost" colorPalette="red" onClick={() => { setImagePath(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                    הסר
                  </Button>
                )}
              </HStack>
            </Field.Root>
            <HStack>
              <Button colorPalette="teal" onClick={handleSave} loading={saving}>שמור</Button>
              <Button variant="outline" onClick={closeForm}>ביטול</Button>
            </HStack>
          </Stack>
        </Box>
      )}

      {/* Table */}
      <Box bg="white" borderRadius="lg" shadow="sm" overflow="hidden">
        <Table.Root>
          <Table.Header>
            <Table.Row bg="gray.50">
              <Table.ColumnHeader>שם</Table.ColumnHeader>
              <Table.ColumnHeader>תיאור</Table.ColumnHeader>
              <Table.ColumnHeader>מתכונים</Table.ColumnHeader>
              <Table.ColumnHeader>פעולות</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {albums.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={4}>
                  <Text textAlign="center" color="gray.500" py={4}>אין אלבומים עדיין.</Text>
                </Table.Cell>
              </Table.Row>
            ) : albums.map((album) => (
              <Table.Row key={album.id}>
                <Table.Cell fontWeight="medium">{album.name}</Table.Cell>
                <Table.Cell color="gray.600" fontSize="sm">{album.description || '—'}</Table.Cell>
                <Table.Cell>{album.recipeCount}</Table.Cell>
                <Table.Cell>
                  <HStack gap={2}>
                    <Button size="xs" variant="outline" colorPalette="blue" onClick={() => openEdit(album)}>
                      <FaEdit />
                    </Button>
                    <Button size="xs" colorPalette="red" onClick={() => setDeleteTarget(album)}>
                      <FaTrash />
                    </Button>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>

      <ConfirmDialog
        open={!!deleteTarget}
        title="מחיקת אלבום"
        message={`למחוק את "${deleteTarget?.name}"? כל המתכונים בו יושפעו.`}
        confirmLabel="מחק"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
