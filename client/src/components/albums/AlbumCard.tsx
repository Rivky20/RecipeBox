import { Box, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { Album } from '../../types';

interface Props {
  album: Album;
}

export default function AlbumCard({ album }: Props) {
  return (
    <Link to={`/albums/${album.id}`} style={{ textDecoration: 'none' }}>
      <Box
        position="relative"
        borderRadius="2xl"
        overflow="hidden"
        border="1px solid"
        borderColor="#EDE0D8"
        boxShadow="0 1px 8px rgba(180,140,110,0.08)"
        transition="all 0.2s"
        _hover={{ boxShadow: '0 6px 24px rgba(180,140,110,0.16)', transform: 'translateY(-2px)' }}
        cursor="pointer"
        h="190px"
        display="flex"
        flexDirection="column"
      >
        {/* Background image */}
        {album.imagePath && (
          <Box
            position="absolute"
            inset={0}
            backgroundImage={`url(${album.imagePath})`}
            backgroundSize="cover"
            backgroundPosition="center"
          />
        )}

        {/* Overlay */}
        <Box
          position="absolute"
          inset={0}
          bg={album.imagePath ? undefined : '#FDFAF8'}
        />

        {/* Content */}
        <Box position="relative" p={5} flex={1} display="flex" flexDirection="column" gap={2}>
          {/* Count badge */}
          <Box display="flex" justifyContent="flex-end">
            <Box
              bg="rgba(245,225,208,0.9)"
              color="#7D4F3A"
              fontSize="xs"
              fontWeight="600"
              px={2.5}
              py={0.5}
              borderRadius="full"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {album.recipeCount} {album.recipeCount === 1 ? 'מתכון' : 'מתכונים'}
            </Box>
          </Box>


          {/* Spacer */}
          <Box flex={1} />

          {/* Footer */}
          <Box
            pt={3}
            borderTop="1px solid"
            borderColor="rgba(210,175,140,0.5)"
            display="flex"
            justifyContent="center"
            bg="rgba(255,248,243,0.6)"
            mx={-5}
            px={5}
            pb={1}
          >
            <Text
              fontWeight="700"
              fontSize="lg"
              color="#1C1008"
              className="album-title"
            >
              {album.name}
            </Text>
          </Box>
        </Box>
      </Box>
    </Link>
  );
}
