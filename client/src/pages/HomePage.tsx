import { useEffect, useState } from 'react';
import { Heading, SimpleGrid, Text, Button, HStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Album } from '../types';
import { albumService } from '../services/albumService';
import { useAuth } from '../context/AuthContext';
import AlbumCard from '../components/albums/AlbumCard';
import Spinner from '../components/common/Spinner';
import ErrorMessage from '../components/common/ErrorMessage';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    albumService.getAlbums()
      .then(setAlbums)
      .catch(() => setError('טעינת האלבומים נכשלה.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div dir="rtl">
      <HStack justify="space-between" mb={8} wrap="wrap" gap={4}>
        <div>
          <Heading
            size="2xl"
            mb={1}
            style={{ fontFamily: "'Frank Ruhl Libre', Georgia, serif" }}
          >
            אלבומי מתכונים
          </Heading>
          <Text color="#7D6B62">עיין באוסף קטגוריות המתכונים שלנו</Text>
        </div>
        {isAuthenticated && (
          <Link to="/recipes/new">
            <Button bg="#E8919C" color="white" _hover={{ bg: '#C97080' }} borderRadius="xl" fontWeight="700">
              + הוסף מתכון
            </Button>
          </Link>
        )}
      </HStack>

      {albums.length === 0 ? (
        <Text color="gray.500" textAlign="center" py={12}>לא נמצאו אלבומים.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={6}>
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </SimpleGrid>
      )}
    </div>
  );
}
