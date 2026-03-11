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
          bg={album.imagePath ? 'rgba(255,248,243,0.55)' : '#FDFAF8'}
          backdropFilter={album.imagePath ? 'blur(0px)' : undefined}
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
              style={{ fontFamily: "'Heebo', sans-serif" }}
            >
              {album.recipeCount} {album.recipeCount === 1 ? 'מתכון' : 'מתכונים'}
            </Box>
          </Box>

          {/* Name */}
          <Text
            fontWeight="700"
            fontSize="xl"
            color="#1C1008"
            lineClamp={2}
            flex={1}
            style={{ fontFamily: "'Frank Ruhl Libre', Georgia, serif" }}
          >
            {album.name}
          </Text>

          {/* Description */}
          {album.description && (
            <Text
              fontSize="sm"
              color="#7D6B62"
              lineClamp={2}
              style={{ fontFamily: "'Heebo', sans-serif" }}
            >
              {album.description}
            </Text>
          )}

          {/* Footer */}
          <Box
            mt={3}
            pt={3}
            borderTop="1px solid"
            borderColor="rgba(210,175,140,0.25)"
            display="flex"
            justifyContent="flex-end"
          >
            <Text
              fontSize="sm"
              fontWeight="600"
              color="#A0785A"
              style={{ fontFamily: "'Heebo', sans-serif" }}
            >
              צפה במתכונים ←
            </Text>
          </Box>
        </Box>
      </Box>
    </Link>
  );
}
